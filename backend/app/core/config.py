"""Small environment-based settings object for the first backend phase."""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

# Load backend/.env when present; real environment variables take precedence.
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


@dataclass(frozen=True)
class Settings:
    """Configuration values that can be overridden with environment variables."""

    app_name: str = os.getenv("NEXUS_APP_NAME", "NEXUS API")
    app_version: str = os.getenv("NEXUS_APP_VERSION", "0.1.0")
    api_prefix: str = os.getenv("NEXUS_API_PREFIX", "/api")
    cors_origins: tuple[str, ...] = (
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    )
    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    gemini_timeout_seconds: int = max(1, int(os.getenv("GEMINI_TIMEOUT_SECONDS", "60")))
    gemini_retry_attempts: int = max(1, min(3, int(os.getenv("GEMINI_RETRY_ATTEMPTS", "3"))))
    gemini_retry_base_delay_seconds: float = max(
        0.0, float(os.getenv("GEMINI_RETRY_BASE_DELAY_SECONDS", "1"))
    )
    pdf_max_extracted_characters: int = max(
        1, int(os.getenv("PDF_MAX_EXTRACTED_CHARACTERS", "100000"))
    )
    gemini_max_document_context_characters: int = max(
        1, int(os.getenv("GEMINI_MAX_DOCUMENT_CONTEXT_CHARACTERS", "150000"))
    )


settings = Settings()
