"""PDF upload validation and text extraction endpoint."""

from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.schemas.documents import DocumentExtractResponse
from app.services.pdf_extraction import PDFExtractionError, extract_pdf_text

router = APIRouter()

MAX_PDF_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_PDF_PAGES = 100
UPLOAD_CHUNK_BYTES = 64 * 1024


async def _read_upload_bounded(upload: UploadFile) -> bytes:
    chunks: list[bytes] = []
    total_bytes = 0
    while True:
        chunk = await upload.read(min(UPLOAD_CHUNK_BYTES, MAX_PDF_UPLOAD_BYTES + 1 - total_bytes))
        if not chunk:
            break
        total_bytes += len(chunk)
        if total_bytes > MAX_PDF_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail="PDF uploads are limited to 10 MB.",
            )
        chunks.append(chunk)
    return b"".join(chunks)


def _display_filename(filename: str | None) -> str:
    # Treat both slash styles as separators; this value is only returned for display.
    basename = (filename or "").replace("\\", "/").rsplit("/", 1)[-1]
    basename = "".join(character for character in basename if character.isprintable()).strip()
    return basename[:255] or "document.pdf"


@router.post("/documents/extract", response_model=DocumentExtractResponse, tags=["documents"])
async def extract_document(file: UploadFile = File(...)) -> DocumentExtractResponse:
    """Extract selectable text from a bounded PDF upload in memory."""
    try:
        filename = _display_filename(file.filename)
        content_type = (file.content_type or "").lower().split(";", 1)[0].strip()
        if content_type not in {"application/pdf", "application/octet-stream", ""}:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Upload a PDF file with an application/pdf content type.",
            )

        content = await _read_upload_bounded(file)
        try:
            extracted_text, page_count = extract_pdf_text(
                content,
                max_pages=MAX_PDF_PAGES,
                max_characters=settings.pdf_max_extracted_characters,
            )
        except PDFExtractionError as error:
            raise HTTPException(status_code=error.status_code, detail=error.message) from None

        return DocumentExtractResponse(
            document_id=str(uuid4()),
            filename=filename,
            page_count=page_count,
            extracted_text=extracted_text,
            character_count=len(extracted_text),
        )
    finally:
        await file.close()
