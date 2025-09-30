# Vitamend OCR & Tamper Service

FastAPI microservice for OCR and tamper detection using pytesseract and OpenCV. Non-blocking OCR, async MongoDB (Motor), single integration test.

## Quick start

1. python -m venv .venv && source .venv/bin/activate
2. pip install -r requirements.txt
3. cp .env.example .env and set MONGO_URI, TESSERACT_CMD if needed
4. uvicorn app.main:app --reload
5. Single test only:
   pytest tests/test_ocr_check.py::test_ocr_check --maxfail=1 -q

## Endpoint

POST /api/ocr-check (multipart/form-data):
- file: image/jpeg|png|webp up to 25MB; pixel limit via MAX_IMAGE_PIXELS.

Response:
{
  "expiry": "YYYY-MM-DD" | null,
  "batch": string | null,
  "qr_expiry": "YYYY-MM-DD" | null,
  "expired": bool,
  "tampered": bool,
  "confidence": number (0..1),
  "needs_review": bool,
  "mismatch": bool,
  "tamper_score": number
}

## Notes

- OCR and heavy image ops run in a thread to avoid blocking the event loop.
- DB writes are best-effort; failures are logged and don't break the request.
- When needs_review=true a text dump is saved under uploads/.
