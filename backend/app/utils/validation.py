from fastapi import HTTPException
from pathlib import Path
from app.utils.paths import UPLOADS_DIR

def safe_folder_path(folder_name: str) -> Path:
    resolved = (UPLOADS_DIR / folder_name).resolve()

    if not str(resolved).startswith(str(UPLOADS_DIR.resolve())):
        raise HTTPException(400, detail="Invalid folder name")
    
    return resolved