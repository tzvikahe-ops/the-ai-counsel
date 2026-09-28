"""Output token limits for Anthropic and OpenCode, configurable via .env."""

import httpx
import pytest
import respx

from backend.providers.anthropic import AnthropicProvider
from backend.providers.max_tokens import (
    ANTHROPIC_MAX_TOKENS_CEILING,
    DEFAULT_ANTHROPIC_MAX_TOKENS,
    DEFAULT_OPENCODE_MAX_TOKENS,
    anthropic_max_tokens,
    opencode_max_tokens,
)

MESSAGES_URL = "https://api.anthropic.com/v1/messages"


@pytest.fixture(autouse=True)
def _clear_env(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_MAX_TOKENS", raising=False)
    monkeypatch.delenv("OPENCODE_MAX_TOKENS", raising=False)


def test_defaults_when_unset():
    assert anthropic_max_tokens() == DEFAULT_ANTHROPIC_MAX_TOKENS
    assert opencode_max_tokens() == DEFAULT_OPENCODE_MAX_TOKENS


def test_default_is_far_above_the_old_hardcoded_4096():
    """Regression: 4096 could be consumed entirely by thinking tokens, leaving
    no budget for a visible answer."""
    assert DEFAULT_ANTHROPIC_MAX_TOKENS > 4096


def test_default_stays_within_the_api_ceiling():
    assert DEFAULT_ANTHROPIC_MAX_TOKENS <= ANTHROPIC_MAX_TOKENS_CEILING


def test_env_var_overrides(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_MAX_TOKENS", "64000")
    assert anthropic_max_tokens() == 64000


def test_opencode_has_its_own_variable(monkeypatch):
    monkeypatch.setenv("OPENCODE_MAX_TOKENS", "8192")
    monkeypatch.setenv("ANTHROPIC_MAX_TOKENS", "64000")
    assert opencode_max_tokens() == 8192
    assert anthropic_max_tokens() == 64000


def test_value_above_ceiling_is_clamped(monkeypatch):
    """A too-large value would otherwise return an opaque HTTP 400."""
    monkeypatch.setenv("ANTHROPIC_MAX_TOKENS", "999999")
    assert anthropic_max_tokens() == ANTHROPIC_MAX_TOKENS_CEILING


@pytest.mark.parametrize("bad", ["abc", "", "   ", "0", "-5", "12.5"])
def test_unusable_values_fall_back_to_default(monkeypatch, bad):
    """A misconfigured .env must not break every request to the provider."""
    monkeypatch.setenv("ANTHROPIC_MAX_TOKENS", bad)
    assert anthropic_max_tokens() == DEFAULT_ANTHROPIC_MAX_TOKENS


def test_whitespace_is_tolerated(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_MAX_TOKENS", "  16000  ")
    assert anthropic_max_tokens() == 16000


@respx.mock
async def test_anthropic_request_sends_the_configured_limit(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_MAX_TOKENS", "64000")
    provider = AnthropicProvider()
    monkeypatch.setattr(provider, "_get_api_key", lambda: "test-key")

    route = respx.post(MESSAGES_URL).mock(
        return_value=httpx.Response(
            200,
            json={
                "content": [{"type": "text", "text": "OK"}],
                "usage": {"input_tokens": 1, "output_tokens": 1},
            },
        )
    )
    await provider.query("anthropic:claude-opus-5", [{"role": "user", "content": "Hi"}])

    import json

    payload = json.loads(route.calls[0].request.content)
    assert payload["max_tokens"] == 64000


@respx.mock
async def test_anthropic_request_uses_default_without_env(monkeypatch):
    provider = AnthropicProvider()
    monkeypatch.setattr(provider, "_get_api_key", lambda: "test-key")

    route = respx.post(MESSAGES_URL).mock(
        return_value=httpx.Response(
            200,
            json={
                "content": [{"type": "text", "text": "OK"}],
                "usage": {"input_tokens": 1, "output_tokens": 1},
            },
        )
    )
    await provider.query("anthropic:claude-opus-5", [{"role": "user", "content": "Hi"}])

    import json

    payload = json.loads(route.calls[0].request.content)
    assert payload["max_tokens"] == DEFAULT_ANTHROPIC_MAX_TOKENS
