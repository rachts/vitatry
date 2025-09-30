"""
Project: Vitamend
Creator: Rachit Kumar Tiwari
"""
import os
import pytest
from motor.motor_asyncio import AsyncIOMotorClient


@pytest.mark.anyio
async def test_db_ping_or_skip():
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=1500)
    try:
        await client.admin.command("ping")
    except Exception:
        pytest.skip("MongoDB not reachable; skipping ping.")
