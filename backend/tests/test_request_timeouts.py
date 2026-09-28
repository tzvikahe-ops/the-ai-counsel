"""Per-provider request timeouts and non-empty provider error messages."""

import httpx
import pytest
import respx

from backend.council import get_provider_name_for_model, query_model
from backend.providers.errors import describe_exception
from backend.providers.timeouts import (
    DEFAULT_REQUEST_TIMEOUT,
    MAX_REQUEST_TIMEOUT,
    MIN_REQUEST_TIMEOUT,
    request_timeout,
)


@pytest.fixture(autouse=True)
def _clear_env(monkeypatch):
    for var in (
        "LLM_COUNCIL_REQUEST_TIMEOUT",
        "ANTHROPIC_REQUEST_TIMEOUT",
        "OPENAI_REQUEST_TIMEOUT",
        "OPENCODE_ZEN_REQUEST_TIMEOUT",
    ):
        monkeypatch.delenv(var, raising=False)


# ---------------------------------------------------------------- resolution


def test_default_when_nothing_is_set():
    assert request_timeout("anthropic") == DEFAULT_REQUEST_TIMEOUT


def test_default_is_longer_than_the_old_hardcoded_120s():
    """Regression: 120s cut off reasoning models mid-thought."""
    assert DEFAULT_REQUEST_TIMEOUT > 120.0


def test_global_variable_applies_to_every_provider(monkeypatch):
    monkeypatch.setenv("LLM_COUNCIL_REQUEST_TIMEOUT", "240")
    assert request_timeout("anthropic") == 240.0
    assert request_timeout("openai") == 240.0


def test_per_provider_overrides_the_global(monkeypatch):
    monkeypatch.setenv("LLM_COUNCIL_REQUEST_TIMEOUT", "240")
    monkeypatch.setenv("ANTHROPIC_REQUEST_TIMEOUT", "600")
    assert request_timeout("anthropic") == 600.0
    assert request_timeout("openai") == 240.0  # unaffected


def test_hyphenated_provider_names_map_to_underscored_vars(monkeypatch):
    monkeypatch.setenv("OPENCODE_ZEN_REQUEST_TIMEOUT", "90")
    assert request_timeout("opencode-zen") == 90.0


def test_value_is_clamped_to_the_maximum(monkeypatch):
    """One stalled provider must not hold a council slot indefinitely."""
    monkeypatch.setenv("ANTHROPIC_REQUEST_TIMEOUT", "999999")
    assert request_timeout("anthropic") == MAX_REQUEST_TIMEOUT


@pytest.mark.parametrize("bad", ["abc", "", "   ", "0", "-30"])
def test_unusable_values_fall_through(monkeypatch, bad):
    """A misconfigured .env must not break every request."""
    monkeypatch.setenv("ANTHROPIC_REQUEST_TIMEOUT", bad)
    assert request_timeout("anthropic") == DEFAULT_REQUEST_TIMEOUT


def test_unusable_per_provider_falls_through_to_global(monkeypatch):
    monkeypatch.setenv("LLM_COUNCIL_REQUEST_TIMEOUT", "300")
    monkeypatch.setenv("ANTHROPIC_REQUEST_TIMEOUT", "not-a-number")
    assert request_timeout("anthropic") == 300.0


def test_provider_name_resolution():
    assert get_provider_name_for_model("anthropic:claude-opus-5") == "anthropic"
    assert get_provider_name_for_model("opencode-zen:some-model") == "opencode-zen"
    # Unprefixed models fall back to OpenRouter for legacy support.
    assert get_provider_name_for_model("some/model") == "openrouter"


# ------------------------------------------------------------ error messages


def test_read_timeout_no_longer_stringifies_to_nothing():
    """The bug: str(httpx.ReadTimeout("")) is "", which rendered as
    "Unknown error" and hid the fact that a timeout had occurred."""
    assert str(httpx.ReadTimeout("")) == ""
    message = describe_exception(httpx.ReadTimeout(""), 180.0)
    assert message
    assert "did not respond in time" in message
    assert "180s" in message
    assert "REQUEST_TIMEOUT" in message  # tells the user how to fix it


def test_connect_timeout_is_distinguishable_from_read_timeout():
    connect = describe_exception(httpx.ConnectTimeout(""), 180.0)
    read = describe_exception(httpx.ReadTimeout(""), 180.0)
    assert connect != read
    assert "Connection" in connect


def test_exception_with_a_message_keeps_it():
    assert describe_exception(ValueError("boom"), None) == "boom"


def test_exception_with_no_message_names_its_type():
    assert describe_exception(Exception(), None) == "Exception (no further detail provided)"


def test_describe_exception_never_returns_empty():
    for exc in (
        httpx.ReadTimeout(""),
        httpx.ConnectTimeout(""),
        httpx.ConnectError(""),
        httpx.RemoteProtocolError(""),
        Exception(),
        ValueError(""),
        RuntimeError("real message"),
    ):
        assert describe_exception(exc, 120.0).strip()


# ------------------------------------------------------------- integration


@respx.mock
async def test_timeout_surfaces_an_actionable_message(monkeypatch):
    """End to end: a timing-out provider no longer reports "Unknown error"."""
    monkeypatch.setenv("ANTHROPIC_REQUEST_TIMEOUT", "5")
    monkeypatch.setattr(
        "backend.credentials.get_api_key", lambda p: "test-key", raising=False
    )
    from backend.providers import anthropic as anthropic_module

    provider = anthropic_module.AnthropicProvider()
    monkeypatch.setattr(provider, "_get_api_key", lambda: "test-key")
    monkeypatch.setitem(
        __import__("backend.council", fromlist=["PROVIDERS"]).PROVIDERS,
        "anthropic",
        provider,
    )

    respx.post("https://api.anthropic.com/v1/messages").mock(
        side_effect=httpx.ReadTimeout("")
    )

    result = await query_model(
        "anthropic:claude-opus-5", [{"role": "user", "content": "Hi"}]
    )
    assert result["error"] is True
    assert result["error_message"]
    assert "Unknown" not in result["error_message"]
    assert "did not respond in time" in result["error_message"]


@respx.mock
async def test_explicit_caller_timeout_is_respected(monkeypatch):
    """Preflight passes a deliberately short timeout; config must not override it."""
    monkeypatch.setenv("ANTHROPIC_REQUEST_TIMEOUT", "600")
    from backend.providers import anthropic as anthropic_module

    seen = {}

    async def fake_query(model_id, messages, timeout=120.0, temperature=0.7):
        seen["timeout"] = timeout
        return {"content": "ok", "error": False}

    provider = anthropic_module.AnthropicProvider()
    monkeypatch.setattr(provider, "query", fake_query)
    monkeypatch.setitem(
        __import__("backend.council", fromlist=["PROVIDERS"]).PROVIDERS,
        "anthropic",
        provider,
    )

    await query_model(
        "anthropic:claude-opus-5", [{"role": "user", "content": "Hi"}], timeout=5.0
    )
    assert seen["timeout"] == 5.0


@respx.mock
async def test_configured_timeout_is_used_when_caller_passes_none(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_REQUEST_TIMEOUT", "600")
    from backend.providers import anthropic as anthropic_module

    seen = {}

    async def fake_query(model_id, messages, timeout=120.0, temperature=0.7):
        seen["timeout"] = timeout
        return {"content": "ok", "error": False}

    provider = anthropic_module.AnthropicProvider()
    monkeypatch.setattr(provider, "query", fake_query)
    monkeypatch.setitem(
        __import__("backend.council", fromlist=["PROVIDERS"]).PROVIDERS,
        "anthropic",
        provider,
    )

    await query_model("anthropic:claude-opus-5", [{"role": "user", "content": "Hi"}])
    assert seen["timeout"] == 600.0


@pytest.mark.parametrize("bad", ["nan", "NaN", "inf", "-inf", "1e400"])
def test_non_finite_values_fall_through(monkeypatch, bad):
    """NaN fails every comparison, so it would slip past a `<= 0` guard and reach
    httpx -- where a NaN timeout means "hang forever" rather than raising. A typo
    in .env must not silently stall a council slot."""
    monkeypatch.setenv("ANTHROPIC_REQUEST_TIMEOUT", bad)
    assert request_timeout("anthropic") == DEFAULT_REQUEST_TIMEOUT


def test_small_positive_value_clamps_up_to_the_minimum(monkeypatch):
    """Covers the clamp path, distinct from the `<= 0` fall-through path."""
    monkeypatch.setenv("ANTHROPIC_REQUEST_TIMEOUT", "0.5")
    assert request_timeout("anthropic") == MIN_REQUEST_TIMEOUT
