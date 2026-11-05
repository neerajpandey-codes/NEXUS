"""Mocked tests for chat validation and Gemini error handling."""

import asyncio
from dataclasses import replace
from types import SimpleNamespace
from unittest.mock import MagicMock, Mock

import httpx
import pytest
from pydantic import ValidationError

from app.api.routes import chat as chat_route
from app.core.config import settings
from app.main import app
from app.schemas.chat import ChatHistoryTurn, ChatRequest
from app.services import gemini_chat


def post_chat(payload: object) -> httpx.Response:
    async def send_request() -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            return await client.post(f"{settings.api_prefix}/chat", json=payload)

    return asyncio.run(send_request())


def test_chat_returns_mocked_provider_response(monkeypatch: pytest.MonkeyPatch) -> None:
    configured = replace(settings, gemini_api_key="test-key", gemini_model="test-model")
    generate = Mock(return_value="A mocked answer.")
    monkeypatch.setattr(chat_route, "settings", configured)
    monkeypatch.setattr(chat_route, "generate_gemini_reply", generate)

    response = post_chat({"message": "Hello", "history": []})

    assert response.status_code == 200
    assert response.json() == {"response": "A mocked answer."}
    generate.assert_called_once_with(
        "Hello",
        history=[],
        document_context=[],
        api_key="test-key",
        model="test-model",
        timeout_seconds=configured.gemini_timeout_seconds,
        retry_attempts=configured.gemini_retry_attempts,
        retry_base_delay_seconds=configured.gemini_retry_base_delay_seconds,
    )


def test_chat_rejects_blank_message_before_provider_call(monkeypatch: pytest.MonkeyPatch) -> None:
    generate = Mock()
    monkeypatch.setattr(chat_route, "settings", replace(settings, gemini_api_key="test-key"))
    monkeypatch.setattr(chat_route, "generate_gemini_reply", generate)

    response = post_chat({"message": "   "})

    assert response.status_code == 422
    generate.assert_not_called()


def test_chat_reports_missing_server_key(monkeypatch: pytest.MonkeyPatch) -> None:
    generate = Mock()
    monkeypatch.setattr(chat_route, "settings", replace(settings, gemini_api_key=None))
    monkeypatch.setattr(chat_route, "generate_gemini_reply", generate)

    response = post_chat({"message": "Hello"})

    assert response.status_code == 503
    assert response.json()["detail"] == "AI chat is not configured on the server."
    generate.assert_not_called()


def test_chat_returns_safe_provider_error(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(chat_route, "settings", replace(settings, gemini_api_key="test-key"))
    monkeypatch.setattr(
        chat_route,
        "generate_gemini_reply",
        Mock(side_effect=gemini_chat.GeminiProviderError(
            "provider_overloaded", 503, "Temporary high demand."
        )),
    )

    response = post_chat({"message": "Hello"})

    assert response.status_code == 503
    assert response.json()["detail"] == {
        "code": "gemini_provider_error",
        "category": "provider_overloaded",
        "provider_status": 503,
        "message": "Gemini is temporarily busy. Please try again shortly.",
    }


def test_chat_returns_friendly_provider_timeout(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(chat_route, "settings", replace(settings, gemini_api_key="test-key"))
    monkeypatch.setattr(
        chat_route,
        "generate_gemini_reply",
        Mock(side_effect=gemini_chat.GeminiProviderError(
            "provider_timeout", 504, "Raw provider message"
        )),
    )

    response = post_chat({"message": "Hello"})

    assert response.status_code == 504
    assert response.json()["detail"]["category"] == "provider_timeout"
    assert response.json()["detail"]["message"] == (
        "Gemini is taking too long to respond. Please try again shortly."
    )


def test_adapter_classifies_provider_error_and_redacts_key(monkeypatch: pytest.MonkeyPatch) -> None:
    client = MagicMock()
    client.__enter__.return_value = client
    provider_error = RuntimeError("provider failed")
    provider_error.code = 503  # type: ignore[attr-defined]
    provider_error.message = "High demand; api_key=secret-test-value"  # type: ignore[attr-defined]
    client.models.generate_content.side_effect = provider_error
    monkeypatch.setattr(gemini_chat.genai, "Client", Mock(return_value=client))

    with pytest.raises(gemini_chat.GeminiProviderError) as raised:
        gemini_chat.generate_gemini_reply(
            "Hello", api_key="secret-test-value", model="test-model", timeout_seconds=10
        )

    assert raised.value.category == "provider_overloaded"
    assert raised.value.provider_status == 503
    assert "High demand" in raised.value.diagnostic_message
    assert "secret-test-value" not in raised.value.diagnostic_message


def test_chat_returns_timeout_error(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(chat_route, "settings", replace(settings, gemini_api_key="test-key"))
    monkeypatch.setattr(
        chat_route,
        "generate_gemini_reply",
        Mock(side_effect=gemini_chat.GeminiTimeoutError()),
    )

    response = post_chat({"message": "Hello"})

    assert response.status_code == 504
    assert "too long" in response.json()["detail"]


def test_sdk_adapter_uses_configured_model_and_timeout(monkeypatch: pytest.MonkeyPatch) -> None:
    client = MagicMock()
    client.__enter__.return_value = client
    client.models.generate_content.return_value = SimpleNamespace(text="Gemini answer")
    client_factory = Mock(return_value=client)
    monkeypatch.setattr(gemini_chat.genai, "Client", client_factory)

    reply = gemini_chat.generate_gemini_reply(
        "Hello",
        api_key="test-key",
        model="test-model",
        timeout_seconds=12,
    )

    assert reply == "Gemini answer"
    client_factory.assert_called_once()
    assert client_factory.call_args.kwargs["api_key"] == "test-key"
    assert client_factory.call_args.kwargs["http_options"].timeout == 12000
    assert client_factory.call_args.kwargs["http_options"].retry_options.attempts == 1
    client.models.generate_content.assert_called_once_with(
        model="test-model",
        contents=[gemini_chat.types.Content(
            role="user", parts=[gemini_chat.types.Part(text="Hello")]
        )],
    )


def test_sdk_adapter_preserves_history_order_and_maps_roles(monkeypatch: pytest.MonkeyPatch) -> None:
    client = MagicMock()
    client.__enter__.return_value = client
    client.models.generate_content.return_value = SimpleNamespace(text="Follow-up answer")
    monkeypatch.setattr(gemini_chat.genai, "Client", Mock(return_value=client))
    history = [
        ChatHistoryTurn(role="user", content="First user turn"),
        ChatHistoryTurn(role="assistant", content="First assistant answer"),
        ChatHistoryTurn(role="user", content="Second user turn"),
    ]

    gemini_chat.generate_gemini_reply(
        "Current user turn", history=history, api_key="test-key", model="test-model",
        timeout_seconds=10,
    )

    submitted = client.models.generate_content.call_args.kwargs["contents"]
    assert [(turn.role, turn.parts[0].text) for turn in submitted] == [
        ("user", "First user turn"),
        ("model", "First assistant answer"),
        ("user", "Second user turn"),
        ("user", "Current user turn"),
    ]


def test_chat_request_accepts_empty_history() -> None:
    request = ChatRequest(message="Hello", history=[])

    assert request.history == []


def test_chat_request_rejects_invalid_history_role() -> None:
    with pytest.raises(ValidationError):
        ChatRequest.model_validate({
            "message": "Hello",
            "history": [{"role": "system", "content": "You are a system"}],
        })


@pytest.mark.parametrize(
    "payload",
    [
        {"message": "x" * 8001},
        {"message": "Hello", "history": [{"role": "user", "content": "x" * 8001}]},
        {"message": "Hello", "history": [{"role": "assistant", "content": "   "}]},
        {"message": "Hello", "history": [{"role": "user", "content": "turn"}] * 21},
    ],
)
def test_chat_request_enforces_message_and_history_limits(payload: dict[str, object]) -> None:
    with pytest.raises(ValidationError):
        ChatRequest.model_validate(payload)


@pytest.mark.parametrize(
    ("provider_status", "expected_category"),
    [(503, "provider_overloaded"), (504, "provider_timeout")],
)
def test_sdk_adapter_retries_transient_gateway_errors_with_exponential_backoff(
    monkeypatch: pytest.MonkeyPatch,
    provider_status: int,
    expected_category: str,
) -> None:
    client = MagicMock()
    client.__enter__.return_value = client
    overload = RuntimeError("temporary overload")
    overload.code = provider_status  # type: ignore[attr-defined]
    overload.message = "The provider temporarily failed."  # type: ignore[attr-defined]
    client.models.generate_content.side_effect = [
        overload,
        overload,
        SimpleNamespace(text="Recovered answer"),
    ]
    monkeypatch.setattr(gemini_chat.genai, "Client", Mock(return_value=client))
    sleep = Mock()
    monkeypatch.setattr(gemini_chat.time, "sleep", sleep)
    assert gemini_chat._safe_provider_error(overload, "test-key").category == expected_category

    reply = gemini_chat.generate_gemini_reply(
        "Hello", api_key="test-key", model="test-model", timeout_seconds=10,
        retry_attempts=3, retry_base_delay_seconds=0.5,
    )

    assert reply == "Recovered answer"
    assert client.models.generate_content.call_count == 3
    assert [call.args[0] for call in sleep.call_args_list] == [0.5, 1.0]
    # The error was transient and converted into a successful response.
    assert expected_category in ("provider_overloaded", "provider_timeout")


def test_sdk_adapter_stops_after_limited_gateway_retries(monkeypatch: pytest.MonkeyPatch) -> None:
    client = MagicMock()
    client.__enter__.return_value = client
    overload = RuntimeError("temporary overload")
    overload.code = 504  # type: ignore[attr-defined]
    overload.message = "Try again later."  # type: ignore[attr-defined]
    client.models.generate_content.side_effect = overload
    monkeypatch.setattr(gemini_chat.genai, "Client", Mock(return_value=client))
    monkeypatch.setattr(gemini_chat.time, "sleep", Mock())

    with pytest.raises(gemini_chat.GeminiProviderError) as raised:
        gemini_chat.generate_gemini_reply(
            "Hello", api_key="test-key", model="test-model", timeout_seconds=10,
            retry_attempts=8, retry_base_delay_seconds=0,
        )

    assert raised.value.provider_status == 504
    assert client.models.generate_content.call_count == 3


def test_sdk_adapter_keeps_retries_within_overall_deadline(monkeypatch: pytest.MonkeyPatch) -> None:
    client = MagicMock()
    client.__enter__.return_value = client
    overload = RuntimeError("temporary gateway failure")
    overload.code = 504  # type: ignore[attr-defined]
    overload.message = "Gateway timeout."  # type: ignore[attr-defined]
    client.models.generate_content.side_effect = overload
    monkeypatch.setattr(gemini_chat.genai, "Client", Mock(return_value=client))
    clock = [100.0]

    def advance(seconds: float) -> None:
        clock[0] += seconds

    monkeypatch.setattr(gemini_chat.time, "monotonic", lambda: clock[0])
    monkeypatch.setattr(gemini_chat.time, "sleep", advance)

    with pytest.raises(gemini_chat.GeminiTimeoutError):
        gemini_chat.generate_gemini_reply(
            "Hello", api_key="test-key", model="test-model", timeout_seconds=2,
            retry_attempts=3, retry_base_delay_seconds=1,
        )

    assert client.models.generate_content.call_count == 2
    assert clock[0] == 101.0
