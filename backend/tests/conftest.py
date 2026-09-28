import pytest


@pytest.fixture(autouse=True)
def _block_real_os_keyring(monkeypatch):
    """Prevent any test from writing to or deleting from the developer's real OS keyring.

    `store.wipe_all_secrets()` calls `keyring_backend.wipe(KNOWN_SECRET_IDS)`
    unconditionally, inside a try/except that swallows failures. A test that
    redirects only the *file* backend to tmp_path therefore still issues real
    Keychain/Credential Manager deletes, silently destroying the developer's
    saved API keys when they use OS keystore mode.

    Reads are left alone; only the destructive operations are blocked. Tests
    that legitimately exercise keyring behaviour install their own fake (see
    test_credentials_keyring.py) and are unaffected, because monkeypatch
    applies their substitution after this one.

    The guard raises BaseException, not Exception. `keyring_backend.delete_secret`
    wraps its deletes in `except Exception: pass`, so an AssertionError here would
    be silently swallowed and the real delete would still go through -- which is
    precisely why the original data loss was silent.
    """
    import keyring

    class _RealKeyringAccess(BaseException):
        """Deliberately not an Exception, so `except Exception` cannot swallow it."""

    def _forbidden_set(service, account, password):
        raise _RealKeyringAccess(
            f"Test attempted a REAL OS keyring write ({service}/{account}). "
            "Install a fake keyring (see test_credentials_keyring.py) or patch "
            "backend.credentials.keyring_backend in your fixture."
        )

    def _forbidden_delete(service, account):
        raise _RealKeyringAccess(
            f"Test attempted a REAL OS keyring delete ({service}/{account}). "
            "Install a fake keyring (see test_credentials_keyring.py) or patch "
            "backend.credentials.keyring_backend in your fixture."
        )

    monkeypatch.setattr(keyring, "set_password", _forbidden_set)
    monkeypatch.setattr(keyring, "delete_password", _forbidden_delete)


class FakeKeyring:
    """In-memory stand-in for the OS keyring, for tests that must exercise deletes.

    `store.delete_secret` and `store.wipe_all_secrets` intentionally hit *both*
    backends regardless of the configured mode, so forcing "file" mode in a
    fixture does not protect the developer's real keychain. Tests that delete
    credentials should install this via the `fake_keyring` fixture.
    """

    def __init__(self):
        self.data = {}

    def get_password(self, service, account):
        return self.data.get((service, account))

    def set_password(self, service, account, password):
        self.data[(service, account)] = password

    def delete_password(self, service, account):
        self.data.pop((service, account), None)


class _RealSettingsWrite(BaseException):
    """Not an Exception, so broad `except Exception` handlers cannot swallow it."""


@pytest.fixture(autouse=True)
def _isolate_settings_file(tmp_path, monkeypatch, request):
    """Point the settings file at tmp_path so tests never touch the real one.

    `store._set_secret_disabled` imports `update_settings` from `..settings`
    *inside the function body*, so patching `backend.main.update_settings` in a
    test does not intercept it. The call lands on the real data/settings.json
    and rewrites `disabled_secret_ids` -- which then blocks the developer's
    saved API keys from being read at all, because `store.get_secret`
    short-circuits on that list before touching any backend.

    Redirecting the path is preferred over blocking writes: the tests genuinely
    need settings persistence to work, they just must not persist *here*.

    Opt out with @pytest.mark.real_settings_file.
    """
    if request.node.get_closest_marker("real_settings_file"):
        return

    from backend import settings as settings_module

    monkeypatch.setattr(
        settings_module, "SETTINGS_FILE", tmp_path / "settings.json"
    )
    # Drop the cached settings so the redirect takes effect immediately and
    # state cannot leak between tests.
    monkeypatch.setattr(settings_module, "_settings_cache", None)
    monkeypatch.setattr(settings_module, "_settings_mtime", 0.0)


@pytest.fixture(autouse=True)
def _isolate_credentials_file(tmp_path, monkeypatch, request):
    """Point the file credential store at tmp_path so tests never touch the real one.

    Same exposure as the settings file: `file_backend` writes
    `data/credentials.json` directly, so any test reaching the file backend
    without its own redirect would read or overwrite real stored secrets.
    Individual fixtures already redirect it; this makes the default safe so a
    new test cannot silently inherit the real path.

    Opt out with @pytest.mark.real_settings_file.
    """
    if request.node.get_closest_marker("real_settings_file"):
        return

    from backend.credentials import file_backend

    monkeypatch.setattr(
        file_backend, "CREDENTIALS_FILE", tmp_path / "credentials.json"
    )


@pytest.fixture
def fake_keyring(monkeypatch):
    """Route all keyring traffic to an in-memory store for this test."""
    import keyring

    fake = FakeKeyring()
    monkeypatch.setattr(keyring, "get_password", fake.get_password)
    monkeypatch.setattr(keyring, "set_password", fake.set_password)
    monkeypatch.setattr(keyring, "delete_password", fake.delete_password)
    return fake


class _FakeSettings:
    """Lightweight settings stand-in for cost tests that need custom_endpoint_*.}

    Tests that use this fixture should set any fields they need; the rest default
    to None / False. Mutate fields on the returned instance directly.
    """

    def __init__(self):
        self.custom_endpoint_name = None
        self.custom_endpoint_url = None
        self.openrouter_api_key = None
        self.openai_api_key = None
        self.anthropic_api_key = None
        self.google_api_key = None
        self.groq_api_key = None
        self.mistral_api_key = None
        self.deepseek_api_key = None
        self.nvidia_api_key = None
        self.opencode_api_key = None


@pytest.fixture
def fake_settings(monkeypatch):
    """Replace `backend.settings.get_settings` with a mutable stub.

    Returns the stub instance so tests can set fields before invoking the
    function under test. The substitution is reverted automatically at the
    end of the test.
    """
    from backend import settings as settings_module

    stub = _FakeSettings()
    monkeypatch.setattr(settings_module, "get_settings", lambda: stub)
    return stub
