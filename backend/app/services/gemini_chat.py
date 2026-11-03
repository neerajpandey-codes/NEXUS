"""Small adapter around Google's official Gen AI Python SDK."""

import re
import math
import time

import httpx
from google import genai
from google.genai import types


class GeminiTimeoutError(Exception):
    """Raised when Gemini does not answer within the configured timeout."""


class GeminiProviderError(Exception):
    """A sanitized provider failure that is safe to return as diagnostics."""

    def __init__(
        self,
        category: str = "provider_error",
        provider_status: int | None = None,
        diagnostic_message: str = "The provider request failed.",
    ) -> None:
        super().__init__(diagnostic_message)
        self.category = category
        self.provider_status = provider_status
        self.diagnostic_message = diagnostic_message


def _safe_provider_error(error: Exception, api_key: str) -> GeminiProviderError:
    """Extract useful provider diagnostics while removing credential-like values."""
    raw_status = getattr(error, "code", None)
    provider_status = raw_status if isinstance(raw_status, int) else None
    raw_message = getattr(error, "message", None)
    if not isinstance(raw_message, str) or not raw_message.strip():
        return GeminiProviderError(
            "sdk_error", provider_status, f"Google Gen AI SDK failed ({type(error).__name__})."
        )

    message = raw_message
    if api_key:
        message = message.replace(api_key, "[REDACTED]")
    message = re.sub(r"AIza[\w-]{20,}", "[REDACTED]", message)
    message = re.sub(r"(?i)(api[_-]?key\s*[:=]\s*)\S+", r"\1[REDACTED]", message)
    message = " ".join(message.split())[:500]

    if provider_status == 503:
        category = "provider_overloaded"
    elif provider_status == 504:
        category = "provider_timeout"
    elif provider_status == 429:
        category = "rate_limited"
    elif provider_status in (401, 403):
        category = "authentication_or_permission"
    elif provider_status == 404:
        category = "model_not_found"
    elif provider_status == 400:
        category = "invalid_request"
    else:
        category = "provider_error"
    return GeminiProviderError(category, provider_status, message)


def generate_gemini_reply(
    message: str,
    *,
    api_key: str,
    model: str,
    timeout_seconds: int,
    retry_attempts: int = 3,
    retry_base_delay_seconds: float = 1.0,
) -> str:
    """Retry transient gateway failures within one overall time budget."""
    attempts = max(1, min(3, retry_attempts))
    deadline = time.monotonic() + max(1, timeout_seconds)
    for attempt in range(attempts):
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise GeminiTimeoutError("The Gemini request time budget expired.") from None
        try:
            with genai.Client(
                api_key=api_key,
                http_options=types.HttpOptions(
                    timeout=max(1, math.ceil(remaining * 1000)),
                    # Keep retries centralized here so the overall deadline is respected.
                    retry_options=types.HttpRetryOptions(attempts=1),
                ),
            ) as client:
                response = client.models.generate_content(model=model, contents=message)
                response_text = response.text
            break
        except (httpx.TimeoutException, TimeoutError) as error:
            raise GeminiTimeoutError from error
        except Exception as error:
            provider_error = _safe_provider_error(error, api_key)
            if provider_error.provider_status not in (503, 504) or attempt + 1 >= attempts:
                raise provider_error from None
            delay = max(0.0, retry_base_delay_seconds) * (2**attempt)
            remaining = deadline - time.monotonic()
            if remaining <= delay:
                raise GeminiTimeoutError("The Gemini request time budget expired.") from None
            if delay > 0:
                time.sleep(delay)

    if not response_text or not response_text.strip():
        raise GeminiProviderError("empty_response", None, "The model returned an empty response.")
    return response_text.strip()
