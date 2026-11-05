"""Response schema for extracted PDF document text."""

from pydantic import BaseModel


class DocumentExtractResponse(BaseModel):
    document_id: str
    filename: str
    page_count: int
    extracted_text: str
    character_count: int
