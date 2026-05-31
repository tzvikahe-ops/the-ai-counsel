"""Lightweight model availability checks before expensive runs."""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from typing import Iterable

from .council import query_model

logger = logging.getLogger(__name__)

PREFLIGHT_PROMPT = "Reply with OK."
DEFAULT_PREFLIGHT_TIMEOUT = 5.0


@dataclass
class ModelPreflightResult:
    """Result of a preflight pass over selected models."""

    failures: list[dict[str, str]] = field(default_factory=list)
    timeouts: list[str] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return not self.failures


def _dedupe_models(models: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    unique: list[str] = []
    for model in models:
        normalized = (model or "").strip()
        if not normalized:
            continue
        comp = normalized.lower()
        if comp in seen:
            continue
        seen.add(comp)
        unique.append(normalized)
    return unique


def _is_timeout_error(message: str) -> bool:
    text = (message or "").lower()
    return any(marker in text for marker in ("timeout", "timed out", "readtimeout", "connecttimeout"))


async def _preflight_one(model: str, timeout: float) -> tuple[str, str | None, bool]:
    messages = [{"role": "user", "content": PREFLIGHT_PROMPT}]
    try:
        result = await query_model(model, messages, timeout=timeout, temperature=0.0)
    except asyncio.TimeoutError:
        return model, None, True
    except Exception as exc:
        message = str(exc) or repr(exc)
        if _is_timeout_error(message):
            return model, None, True
        return model, message, False

    if not result:
        return model, "Model returned empty or null response", False
    if not result.get("error"):
        return model, None, False

    message = result.get("error_message", "Unknown model error")
    if _is_timeout_error(message):
        return model, None, True
    return model, message, False


async def preflight_models(
    models: Iterable[str],
    timeout: float = DEFAULT_PREFLIGHT_TIMEOUT,
) -> ModelPreflightResult:
    """Ping selected models and report immediate non-timeout failures."""

    result = ModelPreflightResult()
    unique_models = _dedupe_models(models)
    if not unique_models:
        return result

    sem = asyncio.Semaphore(5)

    async def _preflight_with_sem(m: str):
        async with sem:
            return await _preflight_one(m, timeout)

    checks = [_preflight_with_sem(model) for model in unique_models]
    for model, error, timed_out in await asyncio.gather(*checks):
        if timed_out:
            result.timeouts.append(model)
            logger.warning(
                "Preflight timeout for model %s (%.1fs) — will retry under full timeout",
                model,
                timeout,
            )
        elif error:
            result.failures.append({"model": model, "error": error})

    return result


def build_preflight_error_message(result: ModelPreflightResult) -> str:
    """Build a user-facing error message for failed model preflight checks."""

    if result.ok:
        return ""

    details = "; ".join(
        f"{failure['model']}: {failure['error']}"
        for failure in result.failures
    )
    return (
        "Model preflight failed before starting. "
        "One or more selected models are not currently available: "
        f"{details}"
    )
