"""Bounded, in-memory extraction of text from uploaded PDF bytes."""

from io import BytesIO

from pypdf import PdfReader


class PDFExtractionError(Exception):
    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.message = message


def extract_pdf_text(
    content: bytes,
    *,
    max_pages: int,
    max_characters: int,
) -> tuple[str, int]:
    """Validate and extract bounded text without creating a filesystem path."""
    if not content.startswith(b"%PDF-"):
        raise PDFExtractionError(400, "The uploaded file does not have a valid PDF signature.")

    try:
        with BytesIO(content) as stream:
            reader = PdfReader(stream, strict=False)
            if reader.is_encrypted:
                raise PDFExtractionError(422, "Password-protected PDFs are not supported.")
            page_count = len(reader.pages)
            if page_count == 0:
                raise PDFExtractionError(422, "The PDF does not contain any pages.")
            if page_count > max_pages:
                raise PDFExtractionError(413, f"PDFs are limited to {max_pages} pages.")

            text_parts: list[str] = []
            character_count = 0
            for page in reader.pages:
                page_text = page.extract_text() or ""
                if not page_text.strip():
                    continue
                separator = "\n\n" if text_parts else ""
                character_count += len(separator) + len(page_text)
                if character_count > max_characters:
                    raise PDFExtractionError(
                        413,
                        f"Extracted PDF text is limited to {max_characters} characters.",
                    )
                text_parts.extend((separator, page_text))

            extracted_text = "".join(text_parts).strip()
            if not extracted_text:
                raise PDFExtractionError(422, "No selectable text was found in the PDF.")
            if len(extracted_text) > max_characters:
                raise PDFExtractionError(
                    413,
                    f"Extracted PDF text is limited to {max_characters} characters.",
                )
            return extracted_text, page_count
    except PDFExtractionError:
        raise
    except Exception:
        # Parser exceptions may contain file details; return a generic safe message.
        raise PDFExtractionError(422, "The PDF is malformed or could not be read.") from None
