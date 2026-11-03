"""Response model for the health check endpoint."""

from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """A simple, validated response describing API availability."""

    status: Literal["ok"]
    service: str
    version: str
