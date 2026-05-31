import pytest
from the_ai_counsel_mcp.stream_buffer import buffer_stage1, buffer_stage2, buffer_stage3


async def _make_iter(events):
    for e in events:
        yield e


@pytest.mark.asyncio
async def test_stage1_success():
    events = [
        {"type": "stage1_start"},
        {"type": "stage1_init", "total": 2},
        {"type": "stage1_progress", "data": {"model": "openai:gpt-4.1", "response": "Hello", "error": None}},
        {"type": "stage1_progress", "data": {"model": "anthropic:claude-sonnet-4", "response": "Hi", "error": None}},
        {"type": "stage1_complete", "data": [
            {"model": "openai:gpt-4.1", "response": "Hello", "error": None},
            {"model": "anthropic:claude-sonnet-4", "response": "Hi", "error": None},
        ]},
        {"type": "stage2_start"},  # remaining events
    ]
    result, remaining = await buffer_stage1(_make_iter(events), "conv-1", "test query")
    assert result["conversation_id"] == "conv-1"
    assert result["summary"]["total"] == 2
    assert result["summary"]["succeeded"] == 2
    assert result["summary"]["failed"] == 0
    assert result["results"][0]["status"] == "success"

    # Remaining iterator should have stage2_start
    remaining_list = [e async for e in remaining]
    assert remaining_list[0]["type"] == "stage2_start"


@pytest.mark.asyncio
async def test_stage1_with_model_error():
    events = [
        {"type": "stage1_complete", "data": [
            {"model": "openai:gpt-4.1", "response": "Hello", "error": None},
            {"model": "ollama:llama3", "response": None, "error": True, "error_message": "429 Too Many Requests"},
        ]},
    ]
    result, _ = await buffer_stage1(_make_iter(events), "conv-1", "test")
    assert result["summary"]["succeeded"] == 1
    assert result["summary"]["failed"] == 1
    failed = next(r for r in result["results"] if r["status"] == "error")
    assert failed["error"]["type"] == "rate_limit"
    assert failed["error"]["retryable"] is True


@pytest.mark.asyncio
async def test_stage2_success():
    events = [
        {"type": "stage2_start"},
        {"type": "stage2_progress", "data": {"model": "openai:gpt-4.1", "ranking": "FINAL RANKING:\n1. Response A", "parsed_ranking": ["Response A"], "error": None}},
        {"type": "stage2_complete",
         "data": [{"model": "openai:gpt-4.1", "ranking": "...", "parsed_ranking": ["Response A"], "error": None}],
         "metadata": {
             "label_to_model": {"Response A": "anthropic:claude-sonnet-4"},
             "aggregate_rankings": [{"model": "anthropic:claude-sonnet-4", "average_rank": 1.0, "rankings_count": 1}],
         }},
        {"type": "stage3_start"},
    ]
    result, remaining = await buffer_stage2(_make_iter(events), "conv-1")
    assert result["conversation_id"] == "conv-1"
    assert result["label_to_model"] == {"Response A": "anthropic:claude-sonnet-4"}
    assert len(result["aggregate_rankings"]) == 1

    remaining_list = [e async for e in remaining]
    assert remaining_list[0]["type"] == "stage3_start"


@pytest.mark.asyncio
async def test_stage3_success():
    events = [
        {"type": "stage3_start"},
        {"type": "stage3_complete", "data": {"model": "anthropic:claude-sonnet-4", "response": "Final answer", "error": False}},
    ]
    result = await buffer_stage3(_make_iter(events), "conv-1")
    assert result["conversation_id"] == "conv-1"
    assert result["status"] == "success"
    assert result["synthesis"] == "Final answer"
    assert result["chairman_model"] == "anthropic:claude-sonnet-4"


@pytest.mark.asyncio
async def test_stage3_error_event():
    events = [
        {"type": "error", "message": "Provider failed"},
    ]
    result = await buffer_stage3(_make_iter(events), "conv-1")
    assert result["status"] == "error"
    assert result["error"]["message"] == "Provider failed"


@pytest.mark.asyncio
async def test_stage1_with_web_search():
    events = [
        {"type": "search_complete", "data": {"search_context": "search results here", "search_query": "test"}},
        {"type": "stage1_complete", "data": [
            {"model": "openai:gpt-4.1", "response": "Answer", "error": None},
        ]},
    ]
    result, _ = await buffer_stage1(_make_iter(events), "conv-1", "test")
    assert result["web_search"] is True
    assert result["search_context"] == "search results here"


@pytest.mark.asyncio
async def test_stage1_no_search():
    events = [
        {"type": "stage1_complete", "data": [
            {"model": "openai:gpt-4.1", "response": "Answer", "error": None},
        ]},
    ]
    result, _ = await buffer_stage1(_make_iter(events), "conv-1", "test")
    assert result["web_search"] is False
    assert result["search_context"] is None


@pytest.mark.asyncio
async def test_stage1_empty_stream():
    """Stream ends without any events — should return empty result, not crash."""
    events = []
    result, remaining = await buffer_stage1(_make_iter(events), "conv-1", "test")
    assert result["summary"]["total"] == 0
    assert result["summary"]["succeeded"] == 0
    remaining_list = [e async for e in remaining]
    assert remaining_list == []


@pytest.mark.asyncio
async def test_stage1_early_error_event():
    """Error event before stage1_complete — partial result returned, error in remaining."""
    events = [
        {"type": "stage1_progress", "data": {"model": "openai:gpt-4.1", "response": "Hello", "error": None}},
        {"type": "error", "message": "Backend crashed"},
    ]
    result, remaining = await buffer_stage1(_make_iter(events), "conv-1", "test")
    # Partial stage1 data from progress events
    assert result["summary"]["total"] == 1
    assert result["summary"]["succeeded"] == 1
    # The error event should be in remaining
    remaining_list = [e async for e in remaining]
    assert remaining_list[0]["type"] == "error"


@pytest.mark.asyncio
async def test_stage2_with_model_error():
    events = [
        {"type": "stage2_complete",
         "data": [
             {"model": "openai:gpt-4.1", "ranking": "...", "parsed_ranking": ["Response A"], "error": None},
             {"model": "groq:llama3", "ranking": None, "parsed_ranking": [], "error": True},
         ],
         "metadata": {"label_to_model": {}, "aggregate_rankings": []}},
    ]
    result, _ = await buffer_stage2(_make_iter(events), "conv-1")
    assert len(result["rankings"]) == 2
    failed = next(r for r in result["rankings"] if r["status"] == "error")
    assert failed["model"] == "groq:llama3"
    assert failed["error"] is not None


@pytest.mark.asyncio
async def test_stage3_stream_ends_without_complete():
    """Stream closes without stage3_complete — retryable error returned."""
    events = [
        {"type": "stage3_start"},
        # No stage3_complete
    ]
    result = await buffer_stage3(_make_iter(events), "conv-1")
    assert result["status"] == "error"
    assert result["error"]["retryable"] is True
    assert "did not complete" in result["error"]["message"]


@pytest.mark.asyncio
async def test_stage1_query_preserved():
    events = [
        {"type": "stage1_complete", "data": []},
    ]
    result, _ = await buffer_stage1(_make_iter(events), "conv-99", "what is the meaning of life?")
    assert result["conversation_id"] == "conv-99"
    assert result["query"] == "what is the meaning of life?"


@pytest.mark.asyncio
async def test_stage2_uses_complete_data_not_progress():
    """stage2_complete data list supersedes incremental stage2_progress accumulation."""
    events = [
        {"type": "stage2_progress", "data": {"model": "model-a", "ranking": "old", "parsed_ranking": [], "error": None}},
        {"type": "stage2_complete",
         "data": [{"model": "model-a", "ranking": "authoritative", "parsed_ranking": ["Response A"], "error": None}],
         "metadata": {"label_to_model": {}, "aggregate_rankings": []}},
    ]
    result, _ = await buffer_stage2(_make_iter(events), "conv-1")
    assert result["rankings"][0]["ranking_text"] == "authoritative"


@pytest.mark.asyncio
async def test_stage1_model_error_without_message():
    """error=True with no error_message falls back to generic message."""
    events = [
        {"type": "stage1_complete", "data": [
            {"model": "some:model", "response": None, "error": True},
        ]},
    ]
    result, _ = await buffer_stage1(_make_iter(events), "conv-1", "test")
    failed = result["results"][0]
    assert failed["status"] == "error"
    assert failed["error"]["message"] == "Unknown provider error"


@pytest.mark.asyncio
async def test_stage1_model_error_401():
    """error_message containing 401 maps to auth_error."""
    events = [
        {"type": "stage1_complete", "data": [
            {"model": "openai:gpt-4.1", "response": None, "error": True, "error_message": "401 Unauthorized"},
        ]},
    ]
    result, _ = await buffer_stage1(_make_iter(events), "conv-1", "test")
    failed = result["results"][0]
    assert failed["error"]["type"] == "auth_error"
    assert failed["error"]["retryable"] is False
