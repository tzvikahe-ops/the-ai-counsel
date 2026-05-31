"""Unit tests for buffer_debate in stream_buffer.py."""

from __future__ import annotations

from collections.abc import AsyncIterator

import pytest

from the_ai_counsel_mcp.stream_buffer import buffer_debate


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _make_iter(events: list[dict]) -> AsyncIterator[dict]:
    for e in events:
        yield e


PERSONA_SKEPTIC = {"id": "skeptic", "name": "The Skeptic", "role": "Critical Thinker",
                   "avatar_emoji": "🔍", "color": "#ef4444", "is_customized": False}
PERSONA_PRAGMATIST = {"id": "pragmatist", "name": "The Pragmatist", "role": "Practical Thinker",
                      "avatar_emoji": "🔧", "color": "#f59e0b", "is_customized": False}
PERSONA_INNOVATOR = {"id": "innovator", "name": "The Innovator", "role": "Creative Thinker",
                     "avatar_emoji": "💡", "color": "#8b5cf6", "is_customized": False}


def _debate_start_event(personas=None, max_rounds=3, question="Test?"):
    return {
        "type": "advisor_debate_start",
        "data": {
            "personas": personas or [PERSONA_SKEPTIC, PERSONA_PRAGMATIST],
            "max_rounds": max_rounds,
            "question": question,
            "web_search": False,
        },
    }


def _response_event(persona_id, persona_name, model, content, consensus, round_num=1):
    consensus_score = 5 if consensus else 2
    return {
        "type": "advisor_response",
        "data": {
            "persona_id": persona_id,
            "persona_name": persona_name,
            "model": model,
            "content": content,
            "error": None,
            "consensus": consensus,
            "consensus_score": consensus_score,
        },
        "round": round_num,
        "count": 1,
        "total": 2,
    }


def _round_complete_event(round_num, responses, consensus_reached):
    scores = {r["persona_id"]: r.get("consensus_score", 5 if r.get("consensus") else 2) for r in responses}
    average_score = round(sum(scores.values()) / len(scores), 2) if scores else None
    return {
        "type": "advisor_round_complete",
        "data": {
            "round_number": round_num,
            "responses": responses,
            "consensus_votes": {r["persona_id"]: r["consensus"] for r in responses},
            "consensus_scores": scores,
            "average_consensus_score": average_score,
            "consensus_reached": consensus_reached,
        },
    }


def _verdict_event(model, content):
    return {"type": "advisor_verdict", "data": {"model": model, "content": content, "error": None}}


def _complete_event(rounds, consensus_reached, verdict, tiebreaker, personas):
    return {
        "type": "advisor_complete",
        "data": {
            "rounds": rounds,
            "consensus_reached": consensus_reached,
            "verdict": verdict,
            "tiebreaker": tiebreaker,
            "personas": personas,
        },
    }


# ── Tests ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_happy_path_two_rounds():
    """Full 2-round debate, 2 personas, no consensus, verdict produced."""
    r1_responses = [
        {"persona_id": "skeptic", "persona_name": "The Skeptic", "model": "gpt-4", "content": "Skeptic R1", "consensus": False},
        {"persona_id": "pragmatist", "persona_name": "The Pragmatist", "model": "gpt-4", "content": "Pragmatist R1", "consensus": False},
    ]
    r2_responses = [
        {"persona_id": "skeptic", "persona_name": "The Skeptic", "model": "gpt-4", "content": "Skeptic R2", "consensus": False},
        {"persona_id": "pragmatist", "persona_name": "The Pragmatist", "model": "gpt-4", "content": "Pragmatist R2", "consensus": False},
    ]
    verdict_data = {"model": "gpt-4", "content": "Final verdict", "error": None}
    personas = [PERSONA_SKEPTIC, PERSONA_PRAGMATIST]

    events = [
        _debate_start_event(personas=personas, max_rounds=3, question="Best approach?"),
        {"type": "advisor_round_start", "data": {"round_number": 1, "order": ["skeptic", "pragmatist"], "is_parallel": True}},
        _response_event("skeptic", "The Skeptic", "gpt-4", "Skeptic R1", False, 1),
        _response_event("pragmatist", "The Pragmatist", "gpt-4", "Pragmatist R1", False, 1),
        _round_complete_event(1, r1_responses, False),
        {"type": "advisor_round_start", "data": {"round_number": 2, "order": ["pragmatist", "skeptic"], "is_parallel": True}},
        _response_event("pragmatist", "The Pragmatist", "gpt-4", "Pragmatist R2", False, 2),
        _response_event("skeptic", "The Skeptic", "gpt-4", "Skeptic R2", False, 2),
        _round_complete_event(2, r2_responses, False),
        {"type": "advisor_verdict_start"},
        _verdict_event("gpt-4", "Final verdict"),
        _complete_event(
            rounds=[{"round_number": 1, "responses": r1_responses}, {"round_number": 2, "responses": r2_responses}],
            consensus_reached=False,
            verdict=verdict_data,
            tiebreaker=None,
            personas=personas,
        ),
    ]

    result = await buffer_debate(_make_iter(events), "conv-1")

    assert result["status"] == "success"
    assert result["conversation_id"] == "conv-1"
    assert result["question"] == "Best approach?"
    assert result["consensus_reached"] is False
    assert result["rounds_completed"] == 2
    assert len(result["rounds"]) == 2
    assert result["verdict"]["content"] == "Final verdict"
    assert result["tiebreaker"] is None
    assert result["web_search"] is None
    assert result["summary"]["total_personas"] == 2
    assert result["summary"]["rounds_run"] == 2
    assert result["summary"]["verdict_model"] == "gpt-4"


@pytest.mark.asyncio
async def test_early_consensus_stops_after_round_one():
    """All advisors agree in round 1 — debate stops early."""
    r1_responses = [
        {"persona_id": "skeptic", "persona_name": "The Skeptic", "model": "gpt-4", "content": "Agree!", "consensus": True},
        {"persona_id": "pragmatist", "persona_name": "The Pragmatist", "model": "gpt-4", "content": "Agree!", "consensus": True},
    ]
    verdict_data = {"model": "gpt-4", "content": "Consensus verdict", "error": None}
    personas = [PERSONA_SKEPTIC, PERSONA_PRAGMATIST]

    events = [
        _debate_start_event(personas=personas, max_rounds=3),
        _round_complete_event(1, r1_responses, consensus_reached=True),
        _verdict_event("gpt-4", "Consensus verdict"),
        _complete_event(
            rounds=[{"round_number": 1, "responses": r1_responses}],
            consensus_reached=True,
            verdict=verdict_data,
            tiebreaker=None,
            personas=personas,
        ),
    ]

    result = await buffer_debate(_make_iter(events), "conv-2")

    assert result["status"] == "success"
    assert result["consensus_reached"] is True
    assert result["rounds_completed"] == 1
    assert result["summary"]["consensus"] is True


@pytest.mark.asyncio
async def test_tiebreaker_fires_for_two_personas():
    """2 personas with no consensus → tiebreaker event fires."""
    r1_responses = [
        {"persona_id": "skeptic", "persona_name": "The Skeptic", "model": "gpt-4", "content": "No agree", "consensus": False},
        {"persona_id": "pragmatist", "persona_name": "The Pragmatist", "model": "gpt-4", "content": "No agree", "consensus": False},
    ]
    tiebreaker_data = {"model": "gpt-4-turbo", "content": "Tiebreaker result", "error": None}
    verdict_data = {"model": "gpt-4-turbo", "content": "Final", "error": None}
    personas = [PERSONA_SKEPTIC, PERSONA_PRAGMATIST]

    events = [
        _debate_start_event(personas=personas, max_rounds=3),
        _round_complete_event(1, r1_responses, False),
        {"type": "advisor_tiebreaker_start"},
        {"type": "advisor_tiebreaker", "data": tiebreaker_data},
        _verdict_event("gpt-4-turbo", "Final"),
        _complete_event(
            rounds=[{"round_number": 1, "responses": r1_responses}],
            consensus_reached=False,
            verdict=verdict_data,
            tiebreaker=tiebreaker_data,
            personas=personas,
        ),
    ]

    result = await buffer_debate(_make_iter(events), "conv-3")

    assert result["status"] == "success"
    assert result["tiebreaker"] is not None
    assert result["tiebreaker"]["content"] == "Tiebreaker result"
    assert result["consensus_reached"] is False


@pytest.mark.asyncio
async def test_web_search_captured():
    """Web search events are captured and included in the result."""
    verdict_data = {"model": "gpt-4", "content": "Verdict", "error": None}
    personas = [PERSONA_SKEPTIC, PERSONA_PRAGMATIST]

    events = [
        {"type": "advisor_search_start", "data": {"provider": "duckduckgo"}},
        {"type": "advisor_search_complete", "data": {"search_query": "best steak method"}},
        _debate_start_event(personas=personas),
        _round_complete_event(1, [
            {"persona_id": "skeptic", "persona_name": "The Skeptic", "model": "gpt-4", "content": "OK", "consensus": True},
            {"persona_id": "pragmatist", "persona_name": "The Pragmatist", "model": "gpt-4", "content": "OK", "consensus": True},
        ], True),
        _verdict_event("gpt-4", "Verdict"),
        _complete_event(
            rounds=[{"round_number": 1, "responses": []}],
            consensus_reached=True,
            verdict=verdict_data,
            tiebreaker=None,
            personas=personas,
        ),
    ]

    result = await buffer_debate(_make_iter(events), "conv-4")

    assert result["status"] == "success"
    assert result["web_search"] is not None
    assert result["web_search"]["provider"] == "duckduckgo"
    assert result["web_search"]["query"] == "best steak method"


@pytest.mark.asyncio
async def test_persona_error_in_response():
    """One advisor fails, others succeed — round still completes."""
    r1_responses = [
        {"persona_id": "skeptic", "persona_name": "The Skeptic", "model": "gpt-4",
         "content": None, "error": "Model timeout", "consensus": False},
        {"persona_id": "pragmatist", "persona_name": "The Pragmatist", "model": "gpt-4",
         "content": "Pragmatist answer", "consensus": True},
    ]
    verdict_data = {"model": "gpt-4", "content": "Partial verdict", "error": None}
    personas = [PERSONA_SKEPTIC, PERSONA_PRAGMATIST]

    events = [
        _debate_start_event(personas=personas),
        {
            "type": "advisor_response",
            "data": {"persona_id": "skeptic", "persona_name": "The Skeptic", "model": "gpt-4",
                     "content": None, "error": "Model timeout", "consensus": False},
            "round": 1, "count": 1, "total": 2,
        },
        _response_event("pragmatist", "The Pragmatist", "gpt-4", "Pragmatist answer", True, 1),
        _round_complete_event(1, r1_responses, False),
        _verdict_event("gpt-4", "Partial verdict"),
        _complete_event(
            rounds=[{"round_number": 1, "responses": r1_responses}],
            consensus_reached=False,
            verdict=verdict_data,
            tiebreaker=None,
            personas=personas,
        ),
    ]

    result = await buffer_debate(_make_iter(events), "conv-5")

    assert result["status"] == "success"
    assert result["rounds_completed"] == 1


@pytest.mark.asyncio
async def test_advisor_error_event_returns_error():
    """advisor_error event yields a structured error result."""
    events = [
        _debate_start_event(),
        {"type": "advisor_error", "message": "All persona LLM calls failed"},
    ]

    result = await buffer_debate(_make_iter(events), "conv-6")

    assert result["status"] == "error"
    assert "error" in result
    assert "All persona LLM calls failed" in result["error"]["message"]


@pytest.mark.asyncio
async def test_stream_ends_without_complete_returns_retryable_error():
    """If the stream ends without advisor_complete and no verdict, returns retryable error."""
    events = [
        _debate_start_event(),
        {"type": "advisor_round_start", "data": {"round_number": 1, "order": [], "is_parallel": True}},
        # stream cuts off — no verdict or advisor_complete
    ]

    result = await buffer_debate(_make_iter(events), "conv-7")

    assert result["status"] == "error"
    assert result["error"]["retryable"] is True


@pytest.mark.asyncio
async def test_early_consensus_with_three_round_limit():
    """max_rounds=3 can still complete after one round when consensus is reached."""
    r1_responses = [
        {"persona_id": "skeptic", "persona_name": "The Skeptic", "model": "gpt-4", "content": "One shot", "consensus": True, "consensus_score": 5},
        {"persona_id": "pragmatist", "persona_name": "The Pragmatist", "model": "gpt-4", "content": "One shot", "consensus": True, "consensus_score": 5},
    ]
    verdict_data = {"model": "gpt-4", "content": "Quick verdict", "error": None}
    personas = [PERSONA_SKEPTIC, PERSONA_PRAGMATIST]

    events = [
        _debate_start_event(personas=personas, max_rounds=3),
        _round_complete_event(1, r1_responses, True),
        _verdict_event("gpt-4", "Quick verdict"),
        _complete_event(
            rounds=[{"round_number": 1, "responses": r1_responses}],
            consensus_reached=True,
            verdict=verdict_data,
            tiebreaker=None,
            personas=personas,
        ),
    ]

    result = await buffer_debate(_make_iter(events), "conv-8")

    assert result["status"] == "success"
    assert result["rounds_completed"] == 1
    assert result["verdict"]["content"] == "Quick verdict"


@pytest.mark.asyncio
async def test_three_personas_no_tiebreaker():
    """3 personas, no consensus — no tiebreaker (only fires for exactly 2 personas)."""
    r1_responses = [
        {"persona_id": "skeptic", "persona_name": "The Skeptic", "model": "gpt-4", "content": "No", "consensus": False},
        {"persona_id": "pragmatist", "persona_name": "The Pragmatist", "model": "gpt-4", "content": "No", "consensus": False},
        {"persona_id": "innovator", "persona_name": "The Innovator", "model": "gpt-4", "content": "No", "consensus": False},
    ]
    verdict_data = {"model": "gpt-4", "content": "Split verdict", "error": None}
    personas = [PERSONA_SKEPTIC, PERSONA_PRAGMATIST, PERSONA_INNOVATOR]

    events = [
        _debate_start_event(personas=personas, max_rounds=3),
        _round_complete_event(1, r1_responses, False),
        _verdict_event("gpt-4", "Split verdict"),
        _complete_event(
            rounds=[{"round_number": 1, "responses": r1_responses}],
            consensus_reached=False,
            verdict=verdict_data,
            tiebreaker=None,
            personas=personas,
        ),
    ]

    result = await buffer_debate(_make_iter(events), "conv-9")

    assert result["status"] == "success"
    assert result["tiebreaker"] is None
    assert result["summary"]["total_personas"] == 3


@pytest.mark.asyncio
async def test_advisor_complete_is_authoritative():
    """advisor_complete data overrides anything accumulated from earlier events."""
    # Early accumulated data that would be wrong
    early_responses = [
        {"persona_id": "skeptic", "persona_name": "The Skeptic", "model": "old-model", "content": "Old content", "consensus": False},
    ]
    # Authoritative data from advisor_complete
    authoritative_responses = [
        {"persona_id": "skeptic", "persona_name": "The Skeptic", "model": "new-model", "content": "Correct content", "consensus": True},
        {"persona_id": "pragmatist", "persona_name": "The Pragmatist", "model": "new-model", "content": "Correct too", "consensus": True},
    ]
    verdict_data = {"model": "new-model", "content": "True verdict", "error": None}
    personas = [PERSONA_SKEPTIC, PERSONA_PRAGMATIST]

    events = [
        _debate_start_event(personas=personas),
        _response_event("skeptic", "The Skeptic", "old-model", "Old content", False, 1),
        _round_complete_event(1, early_responses, False),
        _verdict_event("old-model", "Wrong verdict"),
        _complete_event(
            rounds=[{"round_number": 1, "responses": authoritative_responses}],
            consensus_reached=True,
            verdict=verdict_data,
            tiebreaker=None,
            personas=personas,
        ),
    ]

    result = await buffer_debate(_make_iter(events), "conv-10")

    assert result["status"] == "success"
    assert result["consensus_reached"] is True
    assert result["verdict"]["content"] == "True verdict"
    assert result["verdict"]["model"] == "new-model"


@pytest.mark.asyncio
async def test_advisor_complete_preserves_round_level_consensus_scores():
    responses = [
        {"persona_id": "skeptic", "persona_name": "The Skeptic", "model": "gpt-4", "content": "OK", "consensus": True, "consensus_score": 4},
        {"persona_id": "pragmatist", "persona_name": "The Pragmatist", "model": "gpt-4", "content": "OK", "consensus": True, "consensus_score": 5},
    ]
    verdict_data = {"model": "gpt-4", "content": "Verdict", "error": None}
    personas = [PERSONA_SKEPTIC, PERSONA_PRAGMATIST]

    events = [
        _debate_start_event(personas=personas),
        _complete_event(
            rounds=[{
                "round_number": 1,
                "responses": responses,
                "consensus_scores": {"skeptic": 4, "pragmatist": 5},
                "average_consensus_score": 4.5,
            }],
            consensus_reached=True,
            verdict=verdict_data,
            tiebreaker=None,
            personas=personas,
        ),
    ]

    result = await buffer_debate(_make_iter(events), "conv-11")

    assert result["rounds"][0]["consensus_scores"] == {"skeptic": 4, "pragmatist": 5}
    assert result["rounds"][0]["average_consensus_score"] == 4.5
