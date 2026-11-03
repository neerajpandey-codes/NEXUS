"""Health check endpoint used to confirm that the API is running."""

from fastapi import APIRouter

from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
def get_health() -> HealthResponse:
    """Return a small status document; this endpoint checks no dependencies."""
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
    )
