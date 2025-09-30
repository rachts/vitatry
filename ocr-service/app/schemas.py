"""
Project: Vitamend
Creator: Rachit Kumar Tiwari
"""
from typing import Optional
from pydantic import BaseModel, Field


class OCRCheckResponse(BaseModel):
    expiry: Optional[str] = Field(None)
    batch: Optional[str] = Field(None)
    qr_expiry: Optional[str] = Field(None)
    expired: bool
    tampered: bool
    confidence: float
    needs_review: bool
