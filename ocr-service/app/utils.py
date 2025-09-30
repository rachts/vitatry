"""
Project: Vitamend
Creator: Rachit Kumar Tiwari
"""
import re
from typing import List, Optional
from datetime import date
from dateutil import parser as dateparser


def allowed_content_type(ct: Optional[str]) -> bool:
    if not ct:
        return False
    ct = ct.lower()
    return ct in {"image/jpeg", "image/jpg", "image/png", "image/webp"}


def ensure_max_bytes(raw: bytes, max_bytes: int) -> None:
    if not isinstance(raw, (bytes, bytearray)):
        raise ValueError("Invalid file content")
    if len(raw) == 0:
        raise ValueError("Empty file")
    if len(raw) > max_bytes:
        raise ValueError("File too large")


DATE_PATTERNS = [
    r"(?:0[1-9]|[12]\d|3[01])[-/](?:0[1-9]|1[0-2])[-/](?:20\d{2}|\d{2})",
    r"(?:0[1-9]|1[0-2])[-/](?:20\d{2}|\d{2})",
    r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}",
]


def parse_expiry_candidates(text: str) -> List[str]:
    if not text:
        return []
    t = text.lower()
    found: List[str] = []
    for pat in DATE_PATTERNS:
        found.extend(re.findall(pat, t))
    return found


def normalize_date(s: str) -> date:
    dt = dateparser.parse(s, fuzzy=True, dayfirst=True)
    y, m, d = dt.year, dt.month, dt.day
    return date(y, m, d)


def sanitize_text(s: str, max_len: int = 2000) -> str:
    if not s:
        return ""
    return s.replace("\x00", " ").strip()[:max_len]


def extract_batch_code(text: str) -> Optional[str]:
    if not text:
        return None
    m = re.search(r"(?:batch(?:\s*no)?|lot)[:#]?\s*([A-Za-z0-9\-_\/]{3,24})", text, flags=re.IGNORECASE)
    return m.group(1) if m else None
