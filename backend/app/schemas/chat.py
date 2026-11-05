"""Validated request and response models for AI chat."""

from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.core import config


class DocumentContext(BaseModel):
    """Extracted text for one conversation-scoped PDF."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    document_id: UUID
    filename: str = Field(min_length=1, max_length=255)
    extracted_text: str = Field(min_length=1, max_length=100_000)

    @field_validator("filename")
    @classmethod
    def validate_filename(cls, value: str) -> str:
        if value in {".", ".."} or "/" in value or "\\" in value:
            raise ValueError("Filename must be a plain file name without path components.")
        if any(ord(character) < 32 or ord(character) == 127 for character in value):
            raise ValueError("Filename must not contain control characters.")
        return value


class ChatHistoryTurn(BaseModel):
    """A previous message included as context for the current turn."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    """One user turn submitted to the AI chat endpoint."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    message: str = Field(min_length=1, max_length=8000)
    history: list[ChatHistoryTurn] = Field(default_factory=list, max_length=20)
    document_context: list[DocumentContext] = Field(default_factory=list, max_length=3)

    @model_validator(mode="after")
    def validate_total_document_context(self) -> "ChatRequest":
        document_ids = [document.document_id for document in self.document_context]
        if len(document_ids) != len(set(document_ids)):
            raise ValueError("Each document context entry must have a unique document ID.")
        total_characters = sum(len(document.extracted_text) for document in self.document_context)
        maximum = config.settings.gemini_max_document_context_characters
        if total_characters > maximum:
            raise ValueError(f"Combined document context is limited to {maximum} characters.")
        return self


class ChatResponse(BaseModel):
    """Text returned by the configured Gemini model."""

    response: str
