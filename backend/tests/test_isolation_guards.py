"""Verify the conftest safety guards actually fire.

These guards exist because the suite previously destroyed developers' real
credentials and settings. An untested guard is a guard that silently rots.
"""
import pytest


def test_guard_blocks_real_keyring_delete(monkeypatch):
    import keyring
    from backend.credentials import keyring_backend

    # Pretend a secret exists so delete_secret does not short-circuit on its
    # existence check and actually attempts the delete.
    monkeypatch.setattr(keyring, "get_password", lambda s, a: "pretend-existing")

    with pytest.raises(BaseException, match="REAL OS keyring delete"):
        keyring_backend.wipe(["api:anthropic"])


def test_guard_blocks_real_keyring_write(monkeypatch):
    from backend.credentials import keyring_backend

    # set_secret clears prior chunks via delete_secret first, so either guard
    # message proves the real keyring was blocked.
    with pytest.raises(BaseException, match="REAL OS keyring (write|delete)"):
        keyring_backend.set_secret("api:anthropic", "value")


def test_guard_blocks_the_exact_incident_path(monkeypatch):
    """store.wipe_all_secrets() is what wiped real keys during a test run."""
    import keyring
    from backend.credentials import store

    monkeypatch.setattr(keyring, "get_password", lambda s, a: "pretend-existing")

    with pytest.raises(BaseException, match="REAL OS keyring delete"):
        store.wipe_all_secrets()


def test_settings_file_is_redirected_away_from_the_repo():
    from backend import settings as settings_module

    path = str(settings_module.SETTINGS_FILE)
    assert not path.endswith("the-ai-counsel/data/settings.json"), (
        "autouse isolation should have redirected SETTINGS_FILE to tmp_path"
    )


def test_credentials_file_is_redirected_away_from_the_repo():
    from backend.credentials import file_backend

    path = str(file_backend.CREDENTIALS_FILE)
    assert not path.endswith("the-ai-counsel/data/credentials.json"), (
        "autouse isolation should have redirected CREDENTIALS_FILE to tmp_path"
    )


@pytest.mark.real_settings_file
def test_opt_out_marker_restores_the_real_paths():
    """The documented escape hatch must actually work, or it is a lie."""
    from backend import settings as settings_module
    from backend.credentials import file_backend

    assert str(settings_module.SETTINGS_FILE).endswith("data/settings.json")
    assert str(file_backend.CREDENTIALS_FILE).endswith("data/credentials.json")
