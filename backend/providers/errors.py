"""Turning provider exceptions into messages a user can act on.

Every provider wrapped its request in `except Exception as e:` and returned
`str(e)` as the error message. Several exception types stringify to the empty
string -- `httpx.ReadTimeout` and `httpx.ConnectTimeout` among them -- and the
council then rendered the blank message as a bare "Unknown error", hiding the
single most useful fact: that the request timed out and roughly how long it
waited.

`describe_exception` always returns something non-empty, naming the exception
type when the exception itself carries no message.
"""

from __future__ import annotations

import httpx

# Exception type -> user-facing explanation. Checked before the generic paths
# because these are the ones that commonly stringify to "".
_FRIENDLY: list[tuple[type[BaseException], str]] = [
    (httpx.ConnectTimeout, "Connection to the provider timed out"),
    (httpx.ReadTimeout, "The provider did not respond in time"),
    (httpx.WriteTimeout, "Sending the request to the provider timed out"),
    (httpx.PoolTimeout, "Timed out waiting for a free connection"),
    (httpx.ConnectError, "Could not connect to the provider"),
    (httpx.RemoteProtocolError, "The provider closed the connection unexpectedly"),
]


def describe_exception(exc: BaseException, timeout: float | None = None) -> str:
    """A non-empty, user-facing description of a provider request failure.

    `timeout` is included in timeout messages so the reader knows what limit was
    hit and can raise it -- the whole point of the per-provider setting.
    """
    for exc_type, explanation in _FRIENDLY:
        if isinstance(exc, exc_type):
            if timeout is not None and isinstance(exc, httpx.TimeoutException):
                return (
                    f"{explanation} after {timeout:.0f}s. Increase the timeout via "
                    f"LLM_COUNCIL_REQUEST_TIMEOUT (or the provider-specific "
                    f"*_REQUEST_TIMEOUT) if the model needs longer to think."
                )
            return explanation

    text = str(exc).strip()
    if text:
        return text

    # Some exceptions carry no message at all; naming the type still beats
    # surfacing an empty string as "Unknown error".
    return f"{type(exc).__name__} (no further detail provided)"
