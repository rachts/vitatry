"""
Project: Vitamend
Creator: Rachit Kumar Tiwari
"""
from dataclasses import dataclass
from typing import Any, List
import asyncio

import cv2
import numpy as np
import pytesseract
from starlette.concurrency import run_in_threadpool
from pyzbar.pyzbar import decode as qr_decode


@dataclass
class Preprocessed:
    gray: np.ndarray
    thresh: np.ndarray


def preprocess_image(img_bgr: np.ndarray) -> Preprocessed:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    th = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 35, 11)
    return Preprocessed(gray=gray, thresh=th)


async def _image_to_data(img: np.ndarray) -> dict:
    def _run(x):
        return pytesseract.image_to_data(x, output_type=pytesseract.Output.DICT)
    try:
        return await asyncio.to_thread(_run, img)
    except AttributeError:
        return await run_in_threadpool(_run, img)


async def ocr_with_conf_async(th_img: np.ndarray):
    data = await _image_to_data(th_img)
    words: List[str] = [w for w in data.get("text", []) if isinstance(w, str) and w.strip()]
    text = " ".join(words)
    confs = []
    for c in data.get("conf", []):
        try:
            if c not in ("-1", "", None):
                confs.append(float(c))
        except Exception:
            continue
    avg_conf = float(np.mean(confs) / 100.0) if confs else 0.0

    class Res:
        def __init__(self, text: str, avg_conf: float) -> None:
            self.text = text
            self.avg_conf = avg_conf

    return Res(text, avg_conf)


def _decode_qr_sync(img_bgr: np.ndarray) -> str:
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    codes = qr_decode(rgb)
    parts = []
    for c in codes:
        try:
            parts.append(c.data.decode("utf-8", errors="ignore"))
        except Exception:
            continue
    return " ".join(parts).strip()


async def decode_qr_text_async(img_gray: np.ndarray) -> str:
    bgr = cv2.cvtColor(img_gray, cv2.COLOR_GRAY2BGR)
    try:
        return await asyncio.to_thread(_decode_qr_sync, bgr)
    except AttributeError:
        return await run_in_threadpool(_decode_qr_sync, bgr)


def bhattacharyya_tamper_score(gray: np.ndarray, thresh: np.ndarray) -> float:
    h, w = gray.shape[:2]
    if h < 10 or w < 10:
        return 0.0
    left = gray[:, : w // 2]
    right = gray[:, w // 2 :]
    ha = cv2.calcHist([left], [0], None, [256], [0, 256])
    ha = cv2.normalize(ha, ha).flatten()
    hb = cv2.calcHist([right], [0], None, [256], [0, 256])
    hb = cv2.normalize(hb, hb).flatten()
    dist = cv2.compareHist(ha, hb, cv2.HISTCMP_BHATTACHARYYA)
    return float(dist)
