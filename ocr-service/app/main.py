"""
Project: Vitamend
Creator: Rachit Kumar Tiwari
"""
import os
import asyncio
from datetime import date, datetime
from calendar import monthrange
from typing import Any, Optional

import cv2
import numpy as np
import pytesseract
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from dateutil import parser as dateparser
from dotenv import load_dotenv
from starlette.concurrency import run_in_threadpool

from .db import get_db, ping_db, close_db
from .ocr import (
    preprocess_image,
    ocr_with_conf_async,
    decode_qr_text_async,
    bhattacharyya_tamper_score,
)
from .schemas import OCRCheckResponse
from .utils import (
    allowed_content_type,
    ensure_max_bytes,
    parse_expiry_candidates,
    normalize_date,
    sanitize_text,
    extract_batch_code,
)

load_dotenv()

TESSERACT_CMD = os.getenv("TESSERACT_CMD")
if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

OCR_CONF_THRESHOLD = float(os.getenv("OCR_CONF_THRESHOLD", "0.70"))
MAX_IMAGE_PIXELS = int(os.getenv("MAX_IMAGE_PIXELS", str(8000 * 8000)))
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(8 * 1024 * 1024)))
OCR_TIMEOUT_SECONDS = float(os.getenv("OCR_TIMEOUT_SECONDS", "10.0"))
UPLOADS_DIR = os.getenv("UPLOADS_DIR", "ocr-service/uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

app = FastAPI(title="Vitamend OCR & Tamper Service", version="1.0.0")


def _imdecode_safe(buf: bytes) -> np.ndarray:
    arr = np.frombuffer(buf, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image data")
    return img


def _validate_image_dims(img: np.ndarray) -> None:
    h, w = img.shape[:2]
    if h * w > MAX_IMAGE_PIXELS:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Image too large")


def _is_expired(exp: date) -> bool:
    y, m = exp.year, exp.month
    last_day = date(y, m, monthrange(y, m)[1])
    return date.today() > last_day


async def _run_with_timeout(coro, timeout: float, message: str):
    try:
        return await asyncio.wait_for(coro, timeout=timeout)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT, detail=message)


@app.on_event("startup")
async def startup_event():
    await ping_db()


@app.on_event("shutdown")
async def shutdown_event():
    await close_db()


@app.get("/health")
async def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@app.post("/api/ocr-check", response_model=OCRCheckResponse)
async def ocr_check(file: UploadFile = File(...), db=Depends(get_db)) -> JSONResponse:
    if not allowed_content_type(file.content_type):
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Unsupported image type")
    raw = await file.read()
    ensure_max_bytes(raw, MAX_UPLOAD_BYTES)

    try:
        img = await run_in_threadpool(_imdecode_safe, raw)
        _validate_image_dims(img)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not decode image") from e

    try:
        proc = await run_in_threadpool(preprocess_image, img)
        ocr_res, qr_text = await _run_with_timeout(
            asyncio.gather(ocr_with_conf_async(proc.thresh), decode_qr_text_async(proc.gray)),
            OCR_TIMEOUT_SECONDS,
            "OCR timed out",
        )
        text = ocr_res.text or ""
        avg_conf = float(ocr_res.avg_conf)

        batch = extract_batch_code(text)
        expiry_ocr: Optional[date] = None
        candidates = parse_expiry_candidates(text)
        if candidates:
            try:
                expiry_ocr = normalize_date(candidates[0])
            except Exception:
                expiry_ocr = None

        expiry_qr: Optional[date] = None
        if qr_text:
            try:
                dt = dateparser.parse(qr_text, fuzzy=True, default=datetime.utcnow())
                expiry_qr = date(dt.year, dt.month, dt.day)
            except Exception:
                expiry_qr = None

        mismatch = bool(expiry_qr and expiry_ocr and expiry_qr != expiry_ocr)
        final_expiry: Optional[date] = expiry_qr or expiry_ocr

        tamper_score = await run_in_threadpool(bhattacharyya_tamper_score, proc.gray, proc.thresh)
        tampered = bool(tamper_score > 0.5)

        expired = bool(final_expiry and _is_expired(final_expiry))
        needs_review = bool((avg_conf < OCR_CONF_THRESHOLD) or tampered or mismatch or (final_expiry is None))

        safe_text = sanitize_text(text, max_len=2000)

        doc: dict[str, Any] = {
            "filename": file.filename,
            "content_type": file.content_type,
            "avg_conf": avg_conf,
            "batch": batch,
            "expiry_ocr": expiry_ocr.isoformat() if expiry_ocr else None,
            "expiry_qr": expiry_qr.isoformat() if expiry_qr else None,
            "final_expiry": final_expiry.isoformat() if final_expiry else None,
            "mismatch": mismatch,
            "tampered": tampered,
            "expired": expired,
            "needs_review": needs_review,
            "raw_text": safe_text,
            "created_at": datetime.utcnow(),
        }

        try:
            await db["ocr_results"].insert_one(doc)
        except Exception:
            pass

        if needs_review:
            try:
                ts = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
                base = os.path.splitext(os.path.basename(file.filename or "upload"))[0]
                path = os.path.join(UPLOADS_DIR, f"{base}-{ts}.txt")
                with open(path, "w", encoding="utf-8") as f:
                    f.write(safe_text)
            except Exception:
                pass

        resp = {
            "expiry": doc["final_expiry"],
            "batch": batch,
            "qr_expiry": doc["expiry_qr"],
            "expired": expired,
            "tampered": tampered,
            "confidence": round(avg_conf, 4),
            "needs_review": needs_review,
        }
        return JSONResponse(status_code=200, content=resp)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e
