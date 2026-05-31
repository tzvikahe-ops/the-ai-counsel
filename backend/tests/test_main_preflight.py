from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from backend.main import (
    SendMessageRequest,
    _build_council_preflight_models,
    _run_model_preflight,
)
from backend.model_preflight import ModelPreflightResult


def test_council_preflight_includes_chairman_for_full_mode():
    body = SendMessageRequest(
        content="Question?",
        execution_mode="full",
        council_models=["openai:gpt-4.1"],
        chairman_model="openrouter:chair",
    )

    assert _build_council_preflight_models(body) == [
        "openai:gpt-4.1",
        "openrouter:chair",
    ]


def test_council_preflight_skips_chairman_for_chat_only_mode():
    body = SendMessageRequest(
        content="Question?",
        execution_mode="chat_only",
        council_models=["openai:gpt-4.1"],
        chairman_model="openrouter:chair",
    )

    assert _build_council_preflight_models(body) == ["openai:gpt-4.1"]


@pytest.mark.asyncio
async def test_run_model_preflight_returns_user_facing_error_message():
    failed = ModelPreflightResult(
        failures=[{"model": "openrouter:bad-model", "error": "OpenRouter API error: 401"}]
    )

    with patch("backend.main.preflight_models", new_callable=AsyncMock) as mock_preflight:
        mock_preflight.return_value = failed

        message = await _run_model_preflight(["openrouter:bad-model"])

    assert "openrouter:bad-model" in message
    assert "401" in message

