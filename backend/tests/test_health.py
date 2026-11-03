"""Tests for the public health check endpoint."""

import asyncio

import httpx
import pytest

from app.main import app
from app.core.config import settings


def test_health_returns_service_status() -> None:
    async def request_health() -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            return await client.get(f"{settings.api_prefix}/health")

    response = asyncio.run(request_health())

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
    }


@pytest.mark.parametrize(
    "origin",
    ["http://localhost:5173", "http://127.0.0.1:5173"],
)
def test_health_allows_vite_frontend_origins(origin: str) -> None:
    async def send_preflight() -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            return await client.options(
                f"{settings.api_prefix}/health",
                headers={
                    "Origin": origin,
                    "Access-Control-Request-Method": "GET",
                },
            )

    response = asyncio.run(send_preflight())

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin
    allowed_methods = response.headers["access-control-allow-methods"]
    assert "GET" in allowed_methods
    assert "POST" in allowed_methods
