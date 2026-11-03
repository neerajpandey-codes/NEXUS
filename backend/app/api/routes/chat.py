"""AI chat route; secrets and provider calls stay on the backend."""

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini_chat import (
    GeminiProviderError,
    GeminiTimeoutError,
    generate_gemini_reply,
)

router = APIRouter()


@router.post("/chat", response_model=ChatResponse, tags=["chat"])
def post_chat(request: ChatRequest) -> ChatResponse:
    """Return one Gemini response for a validated user message."""
    api_key = (settings.gemini_api_key or "").strip()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI chat is not configured on the server.",
        )

    try:
        response_text = generate_gemini_reply(
            request.message,
            api_key=api_key,
            model=settings.gemini_model,
            timeout_seconds=settings.gemini_timeout_seconds,
            retry_attempts=settings.gemini_retry_attempts,
            retry_base_delay_seconds=settings.gemini_retry_base_delay_seconds,
        )
    except GeminiTimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The AI service took too long to respond. Please try again.",
        ) from None
    except GeminiProviderError as error:
        if error.provider_status == 503:
            response_status = status.HTTP_503_SERVICE_UNAVAILABLE
            user_message = "Gemini is temporarily busy. Please try again shortly."
        elif error.provider_status == 504:
            response_status = status.HTTP_504_GATEWAY_TIMEOUT
            user_message = "Gemini is taking too long to respond. Please try again shortly."
        else:
            response_status = status.HTTP_502_BAD_GATEWAY
            user_message = error.diagnostic_message
        raise HTTPException(
            status_code=response_status,
            detail={
                "code": "gemini_provider_error",
                "category": error.category,
                "provider_status": error.provider_status,
                "message": user_message,
            },
        ) from None

    return ChatResponse(response=response_text)
