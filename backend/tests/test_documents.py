"""Tests for bounded PDF upload and text extraction."""

import asyncio
from io import BytesIO

import httpx
import pytest
from pypdf import PdfWriter

from app.api.routes import documents as documents_route
from app.core.config import settings
from app.main import app


def _text_pdf(text: str = "Hello from this PDF.") -> bytes:
    escaped = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    stream = f"BT /F1 12 Tf 72 720 Td ({escaped}) Tj ET".encode("ascii")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    content = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(content))
        content.extend(f"{index} 0 obj\n".encode() + obj + b"\nendobj\n")
    xref_offset = len(content)
    content.extend(f"xref\n0 {len(offsets)}\n".encode())
    content.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        content.extend(f"{offset:010d} 00000 n \n".encode())
    content.extend(
        f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode()
    )
    return bytes(content)


def _blank_pdf(page_count: int = 1, password: str | None = None) -> bytes:
    writer = PdfWriter()
    for _ in range(page_count):
        writer.add_blank_page(width=612, height=792)
    if password:
        writer.encrypt(password)
    output = BytesIO()
    writer.write(output)
    return output.getvalue()


def _post_document(
    content: bytes,
    *,
    filename: str = "sample.pdf",
    content_type: str = "application/pdf",
) -> httpx.Response:
    async def send_request() -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            return await client.post(
                f"{settings.api_prefix}/documents/extract",
                files={"file": (filename, content, content_type)},
            )

    return asyncio.run(send_request())


def test_extracts_text_from_valid_pdf() -> None:
    response = _post_document(_text_pdf())

    assert response.status_code == 200
    result = response.json()
    assert result["document_id"]
    assert result["filename"] == "sample.pdf"
    assert result["page_count"] == 1
    assert result["extracted_text"] == "Hello from this PDF."
    assert result["character_count"] == len(result["extracted_text"])


def test_rejects_invalid_pdf_signature() -> None:
    response = _post_document(b"not a PDF", content_type="application/pdf")

    assert response.status_code == 400
    assert "signature" in response.json()["detail"]


def test_rejects_incorrect_mime_type() -> None:
    response = _post_document(_text_pdf(), content_type="text/plain")

    assert response.status_code == 415


def test_rejects_oversized_upload() -> None:
    response = _post_document(b"%PDF-" + b"x" * documents_route.MAX_PDF_UPLOAD_BYTES)

    assert response.status_code == 413


def test_rejects_pdf_over_page_limit() -> None:
    response = _post_document(_blank_pdf(documents_route.MAX_PDF_PAGES + 1))

    assert response.status_code == 413
    assert "pages" in response.json()["detail"]


def test_rejects_malformed_pdf() -> None:
    response = _post_document(b"%PDF-1.4\nnot a valid PDF structure")

    assert response.status_code == 422
    assert "malformed" in response.json()["detail"]


def test_rejects_encrypted_pdf() -> None:
    response = _post_document(_blank_pdf(password="test-password"))

    assert response.status_code == 422
    assert "Password-protected" in response.json()["detail"]


def test_rejects_pdf_without_selectable_text() -> None:
    response = _post_document(_blank_pdf())

    assert response.status_code == 422
    assert "No selectable text" in response.json()["detail"]


def test_rejects_extracted_text_over_configured_limit(monkeypatch: pytest.MonkeyPatch) -> None:
    from dataclasses import replace

    monkeypatch.setattr(
        documents_route,
        "settings",
        replace(settings, pdf_max_extracted_characters=8),
    )
    response = _post_document(_text_pdf("This text is too long."))

    assert response.status_code == 413
    assert "characters" in response.json()["detail"]


def test_sanitizes_filename_without_using_it_as_a_path() -> None:
    response = _post_document(_text_pdf(), filename="../../private/report.pdf")

    assert response.status_code == 200
    assert response.json()["filename"] == "report.pdf"
