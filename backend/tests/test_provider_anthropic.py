import httpx
import pytest
import respx

from backend.providers.anthropic import AnthropicProvider

MESSAGES_URL = "https://api.anthropic.com/v1/messages"


@pytest.fixture
def provider(monkeypatch):
    p = AnthropicProvider()
    monkeypatch.setattr(p, "_get_api_key", lambda: "test-key")
    return p


def _response(blocks, stop_reason="end_turn"):
    return httpx.Response(
        200,
        json={
            "id": "msg_1",
            "type": "message",
            "role": "assistant",
            "content": blocks,
            "stop_reason": stop_reason,
            "usage": {"input_tokens": 10, "output_tokens": 5},
        },
    )


@respx.mock
async def test_plain_text_response(provider):
    respx.post(MESSAGES_URL).mock(
        return_value=_response([{"type": "text", "text": "OK"}])
    )
    result = await provider.query("anthropic:claude-opus-5", [{"role": "user", "content": "Hi"}])
    assert result["error"] is False
    assert result["content"] == "OK"
    assert result["usage"] == {"input_tokens": 10, "output_tokens": 5}


@respx.mock
async def test_thinking_block_before_text_does_not_raise(provider):
    """Regression: a leading non-text block used to raise KeyError('text').

    Reasoning-capable models emit a thinking block first, so indexing
    content[0]["text"] surfaced a bare KeyError to preflight as "model: 'text'".
    """
    respx.post(MESSAGES_URL).mock(
        return_value=_response(
            [
                {"type": "thinking", "thinking": "considering...", "signature": "abc"},
                {"type": "text", "text": "OK"},
            ]
        )
    )
    result = await provider.query("anthropic:claude-opus-5", [{"role": "user", "content": "Hi"}])
    assert result["error"] is False
    assert result["content"] == "OK"


@respx.mock
async def test_multiple_text_blocks_are_concatenated(provider):
    respx.post(MESSAGES_URL).mock(
        return_value=_response(
            [
                {"type": "text", "text": "Hello "},
                {"type": "thinking", "thinking": "..."},
                {"type": "text", "text": "world"},
            ]
        )
    )
    result = await provider.query("anthropic:claude-opus-5", [{"role": "user", "content": "Hi"}])
    assert result["error"] is False
    assert result["content"] == "Hello world"


@respx.mock
async def test_no_text_block_reports_stop_reason(provider):
    """Thinking-only response (e.g. max_tokens hit mid-reasoning) is a clean error."""
    respx.post(MESSAGES_URL).mock(
        return_value=_response(
            [{"type": "thinking", "thinking": "considering..."}],
            stop_reason="max_tokens",
        )
    )
    result = await provider.query("anthropic:claude-opus-5", [{"role": "user", "content": "Hi"}])
    assert result["error"] is True
    assert "no text content" in result["error_message"]
    assert "max_tokens" in result["error_message"]
    assert "thinking" in result["error_message"]


@respx.mock
async def test_empty_content_list(provider):
    respx.post(MESSAGES_URL).mock(return_value=_response([]))
    result = await provider.query("anthropic:claude-opus-5", [{"role": "user", "content": "Hi"}])
    assert result["error"] is True
    assert "no text content" in result["error_message"]


@respx.mock
async def test_malformed_content_is_not_a_crash(provider):
    respx.post(MESSAGES_URL).mock(
        return_value=httpx.Response(200, json={"content": "not-a-list"})
    )
    result = await provider.query("anthropic:claude-opus-5", [{"role": "user", "content": "Hi"}])
    assert result["error"] is True
    assert "Unexpected response format" in result["error_message"]


@respx.mock
async def test_system_message_is_split_out(provider):
    route = respx.post(MESSAGES_URL).mock(
        return_value=_response([{"type": "text", "text": "OK"}])
    )
    await provider.query(
        "anthropic:claude-opus-5",
        [
            {"role": "system", "content": "Be terse."},
            {"role": "user", "content": "Hi"},
        ],
    )
    payload = __import__("json").loads(route.calls[0].request.content)
    assert payload["system"] == "Be terse."
    assert payload["messages"] == [{"role": "user", "content": "Hi"}]
    assert payload["model"] == "claude-opus-5"


async def test_missing_api_key_short_circuits(monkeypatch):
    p = AnthropicProvider()
    monkeypatch.setattr(p, "_get_api_key", lambda: "")
    result = await p.query("anthropic:claude-opus-5", [{"role": "user", "content": "Hi"}])
    assert result["error"] is True
    assert "API key not configured" in result["error_message"]


@respx.mock
async def test_empty_text_block_is_a_successful_empty_response(provider):
    """A text block containing "" is valid output, not an error.

    The pre-fix code returned it as success with empty content; preserve that
    rather than silently reclassifying it as a failure.
    """
    respx.post(MESSAGES_URL).mock(
        return_value=_response([{"type": "text", "text": ""}])
    )
    result = await provider.query("anthropic:claude-opus-5", [{"role": "user", "content": "Hi"}])
    assert result["error"] is False
    assert result["content"] == ""
