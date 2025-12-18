from fastapi import HTTPException
from pathlib import Path
from app.utils.paths import UPLOADS_DIR
from PIL import Image

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

def safe_folder_path(folder_name: str) -> Path:
    resolved = (UPLOADS_DIR / folder_name).resolve()

    if not str(resolved).startswith(str(UPLOADS_DIR.resolve())):
        raise HTTPException(400, detail="Invalid folder name")
    
    return resolved

def list_image_files(folder_path: Path) -> list[Path]:
    return sorted(
        [
            p for p in folder_path.iterdir()
            if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS
        ],
        key=lambda p: p.name
    )

def get_first_image_size(folder_path):
    image_files = list_image_files(folder_path)
    try:
        with Image.open(image_files[0]) as img:
            return img.width, img.height
    except Exception as e:
        print(f"Failed to read image size: {e}")
        return None, None