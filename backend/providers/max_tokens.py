"""Per-provider output token limits.

Anthropic and OpenCode both require an explicit `max_tokens` on every request --
unlike the OpenAI-compatible providers, which default server-side when it is
omitted. The value was previously hardcoded to 4096, which predates
reasoning-capable models: thinking tokens are drawn from the same budget, so a
hard question could consume the whole allowance before any answer was written,
returning a response with thinking blocks and no text.

Configure via .env:

    ANTHROPIC_MAX_TOKENS=32000
    OPENCODE_MAX_TOKENS=8192

Ceilings, from the Anthropic Models API (`max_tokens` field, 2026-09):

    claude-opus-5, opus-4-8/4-7/4-6, sonnet-5, sonnet-4-6, fable-5/5-1   128000
    claude-opus-4-5, haiku-4-5, sonnet-4-5                                64000

The 32000 default is deliberately below the 128000 ceiling. Requesting the
maximum is not free: it raises the per-request timeout risk on a non-streaming
call, and this codebase queries several models in parallel per council round.
32000 leaves ample room for extended reasoning plus a full answer while keeping
latency predictable; raise it in .env for models or questions that need more.
"""

from __future__ import annotations

import os

# Fallbacks when the corresponding env var is unset or unusable.
DEFAULT_ANTHROPIC_MAX_TOKENS = 32000
DEFAULT_OPENCODE_MAX_TOKENS = 4096

# Highest value any currently served Anthropic model accepts. Requests above a
# given model's own ceiling are rejected by the API, so this is an upper bound
# for validation, not a guarantee for every model.
ANTHROPIC_MAX_TOKENS_CEILING = 128000


def _resolve(env_name: str, default: int, ceiling: int) -> int:
    """Read a positive int from the environment, falling back on bad input.

    Never raises. An unusable value falls back to the default rather than
    breaking every request to the provider -- a misconfigured .env should not
    take the app down, and the clamp keeps an over-large value from producing an
    opaque HTTP 400 from the provider instead.
    """
    raw = (os.getenv(env_name) or "").strip()
    if not raw:
        return default
    try:
        value = int(raw)
    except ValueError:
        return default
    if value < 1:
        return default
    return min(value, ceiling)


def anthropic_max_tokens() -> int:
    """Output token limit for Anthropic requests (ANTHROPIC_MAX_TOKENS)."""
    return _resolve(
        "ANTHROPIC_MAX_TOKENS",
        DEFAULT_ANTHROPIC_MAX_TOKENS,
        ANTHROPIC_MAX_TOKENS_CEILING,
    )


def opencode_max_tokens() -> int:
    """Output token limit for OpenCode requests (OPENCODE_MAX_TOKENS)."""
    return _resolve(
        "OPENCODE_MAX_TOKENS",
        DEFAULT_OPENCODE_MAX_TOKENS,
        ANTHROPIC_MAX_TOKENS_CEILING,
    )
