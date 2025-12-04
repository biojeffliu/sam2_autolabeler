from fastapi import APIRouter, HTTPException
from app.utils.paths import UPLOADS_DIR
import os

router = APIRouter(prefix="/folders", tags=["folders"])

@router.get("/")
async def list_folders():
    if not UPLOADS_DIR.exists():
        raise HTTPException(500, detail="Uploads directory missing")
    
    folders = [name for name in os.listdir(UPLOADS_DIR) if (UPLOADS_DIR / name).is_dir()]

    return {"folders": folders}