from fastapi import APIRouter, HTTPException
from app.utils.paths import UPLOADS_DIR
import re

router = APIRouter(prefix="/images")

def extract_number(filename):
    match = re.search(r'\d+', filename)
    return int(match.group()) if match else -1

@router.get("/")
async def get_images(folder: str):
    folder_path = (UPLOADS_DIR / folder).resolve()

    if not str(folder_path).startswith(str(UPLOADS_DIR.resolve())):
        raise HTTPException(400, detail="Invalid folder name")

    if not folder_path.exists():
        raise HTTPException(404, detail="Folder not found")
    
    image_paths = sorted([p for p in folder_path.iterdir() if p.suffix.lower() in [".jpg", ".jpeg", ".png"]],
    key=lambda p: extract_number(p.name))

    image_urls = [f"/static/{folder}/{img.name}" for img in image_paths]

    return {"images": image_urls}


