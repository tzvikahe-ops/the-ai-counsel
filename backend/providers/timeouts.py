"""Per-provider request timeouts.

The council previously used a single hardcoded 120s timeout for every provider.
That is too short for reasoning-capable models on hard questions: the model can
still be thinking when the HTTP read times out, and because
`httpx.ReadTimeout` stringifies to the empty string, the failure surfaced to the
user as a bare "Unknown error" with no indication a timeout had occurred.

Configure via .env -- a global default, with an optional per-provider override:

    LLM_COUNCIL_REQUEST_TIMEOUT=180      # applies to every provider
    ANTHROPIC_REQUEST_TIMEOUT=600        # overrides it for one provider

The per-provider variable is `{PROVIDER}_REQUEST_TIMEOUT`, uppercased with
hyphens as underscores: `OPENAI_REQUEST_TIMEOUT`, `OPENCODE_ZEN_REQUEST_TIMEOUT`,
`GITHUB_COPILOT_REQUEST_TIMEOUT`, and so on.

The 180s default is raised from 120s but deliberately not unbounded: several
models are queried in parallel per council round, and a stalled provider holds
its slot for the whole timeout. Providers running reasoning models with a large
max_tokens budget are the ones that need a longer value -- set it for those
specifically rather than raising the global default for everyone.
"""

from __future__ import annotations

import math
import os

# Applies when neither the per-provider nor the global variable is set.
DEFAULT_REQUEST_TIMEOUT = 180.0

# Bounds. The lower bound keeps a typo from making every request fail
# instantly; the upper bound keeps one stalled provider from holding a council
# slot indefinitely.
MIN_REQUEST_TIMEOUT = 1.0
MAX_REQUEST_TIMEOUT = 3600.0

GLOBAL_ENV_VAR = "LLM_COUNCIL_REQUEST_TIMEOUT"


def _env_var_for(provider: str) -> str:
    """`anthropic` -> `ANTHROPIC_REQUEST_TIMEOUT`; `opencode-zen` -> `OPENCODE_ZEN_...`."""
    normalized = provider.strip().upper().replace("-", "_").replace(".", "_")
    return f"{normalized}_REQUEST_TIMEOUT"


def _read(env_name: str) -> float | None:
    """Read a positive float from the environment, or None if unset/unusable.

    Never raises: a misconfigured .env should fall through to the next source
    rather than break every request.
    """
    raw = (os.getenv(env_name) or "").strip()
    if not raw:
        return None
    try:
        value = float(raw)
    except ValueError:
        return None
    # NaN fails every comparison, so it would slip past a `value <= 0` guard and
    # reach httpx, where it means "hang forever" rather than raising -- a typo
    # would silently stall the council slot instead of erroring.
    if not math.isfinite(value) or value <= 0:
        return None
    return min(max(value, MIN_REQUEST_TIMEOUT), MAX_REQUEST_TIMEOUT)


def request_timeout(provider: str | None = None) -> float:
    """Resolve the timeout for a provider.

    Precedence: `{PROVIDER}_REQUEST_TIMEOUT`, then `LLM_COUNCIL_REQUEST_TIMEOUT`,
    then `DEFAULT_REQUEST_TIMEOUT`.
    """
    if provider:
        per_provider = _read(_env_var_for(provider))
        if per_provider is not None:
            return per_provider
    global_value = _read(GLOBAL_ENV_VAR)
    if global_value is not None:
        return global_value
    return DEFAULT_REQUEST_TIMEOUT
