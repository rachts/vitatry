"""
Project: Vitamend
Creator: Rachit Kumar Tiwari
"""
import os
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_ocr_check():
    sample = os.path.join(os.path.dirname(__file__), "fixtures", "sample_strip.jpg")
    assert os.path.exists(sample)
    with open(sample, "rb") as f:
        resp = client.post(
            "/api/ocr-check",
            files={"file": ("sample_strip.jpg", f, "image/jpeg")},
        )
    assert resp.status_code == 200
    data = resp.json()
    for key in ["expiry", "batch", "qr_expiry", "expired", "tampered", "confidence", "needs_review"]:
        assert key in data
    assert isinstance(data["expired"], bool)
    assert isinstance(data["tampered"], bool)
    assert isinstance(data["confidence"], float)
    assert isinstance(data["needs_review"], bool)
