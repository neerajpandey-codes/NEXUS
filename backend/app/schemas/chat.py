"""Validated request and response models for AI chat."""

from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    """One user turn submitted to the AI chat endpoint."""

    model_config = ConfigDict(str_strip_whitespace=True)

    message: str = Field(min_length=1, max_length=8000)


class ChatResponse(BaseModel):
    """Text returned by the configured Gemini model."""

    response: str
