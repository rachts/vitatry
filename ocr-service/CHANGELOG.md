## 1.0.0

- Implemented FastAPI OCR endpoint /api/ocr-check with pytesseract and OpenCV.
- Non-blocking OCR via asyncio.to_thread.
- Async MongoDB with Motor; startup ping; best-effort insert with logging fallback.
- Input validation: type, size, pixel limit, OCR timeout.
- Tamper detection via histogram Bhattacharyya distance.
- Date parsing (OCR and QR); mismatch handling and final expiry selection.
- Single integration test and pinned requirements.
