from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from backend.model_preflight import build_preflight_error_message, preflight_models


@pytest.mark.asyncio
async def test_preflight_reports_immediate_model_failure():
    with patch("backend.model_preflight.query_model", new_callable=AsyncMock) as mock_query:
        mock_query.return_value = {
            "error": True,
            "error_message": "NVIDIA API error: 401 - unauthorized",
        }

        result = await preflight_models(["nvidia:missing-access"], timeout=5.0)

    assert result.ok is False
    assert result.failures == [
        {
            "model": "nvidia:missing-access",
            "error": "NVIDIA API error: 401 - unauthorized",
        }
    ]
    assert "nvidia:missing-access" in build_preflight_error_message(result)
    assert "401" in build_preflight_error_message(result)


@pytest.mark.asyncio
async def test_preflight_does_not_block_on_timeout():
    with patch("backend.model_preflight.query_model", new_callable=AsyncMock) as mock_query:
        mock_query.return_value = {
            "error": True,
            "error_message": "Request timed out after 5s",
        }

        result = await preflight_models(["openrouter:slow-model"], timeout=5.0)

    assert result.ok is True
    assert result.failures == []
    assert result.timeouts == ["openrouter:slow-model"]


@pytest.mark.asyncio
async def test_preflight_deduplicates_models_before_querying():
    with patch("backend.model_preflight.query_model", new_callable=AsyncMock) as mock_query:
        mock_query.return_value = {"error": False, "content": "OK"}

        result = await preflight_models(["openai:GPT-4.1", "openai:gpt-4.1", ""], timeout=5.0)

    assert result.ok is True
    assert mock_query.await_count == 1
    assert mock_query.call_args[0][0] == "openai:GPT-4.1"


@pytest.mark.asyncio
async def test_preflight_semaphore_does_not_change_behavior():
    with patch("backend.model_preflight.query_model", new_callable=AsyncMock) as mock_query:
        mock_query.return_value = {"error": False, "content": "OK"}

        models = [f"openai:gpt-{i}" for i in range(10)]
        result = await preflight_models(models, timeout=5.0)

    assert result.ok is True
    assert mock_query.call_count == 10


