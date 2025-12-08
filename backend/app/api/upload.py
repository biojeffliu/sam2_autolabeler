from fastapi import APIRouter, UploadFile, File, HTTPException
import zipfile
import shutil
from app.utils.paths import UPLOADS_DIR
from pathlib import Path
import json
from datetime import datetime

router = APIRouter(prefix="/upload")

@router.post("/")
async def receive_folder_and_copy(file: UploadFile = File(...)):
    temp_dir = UPLOADS_DIR / "temp_extract"
    temp_dir.mkdir(exist_ok=True)

    zip_path = temp_dir / file.filename
    with open(zip_path, "wb") as f:
        f.write(await file.read())

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(temp_dir)

    zip_path.unlink()

    extracted_items = [
        item for item in temp_dir.iterdir() 
        if item.is_dir() and not item.name.startswith("__")
    ]
    if not extracted_items:
        raise HTTPException(400, "No folder found inside zip.")

    original_folder = extracted_items[0]
    original_name = original_folder.name

    final_path = UPLOADS_DIR / original_name
    if final_path.exists():
        shutil.rmtree(final_path)

    shutil.move(str(original_folder), str(final_path))

    metadata = {
        "name": original_name,
        "objects": {},
        "description": "",
        "upload_date": datetime.now().isoformat()
    }

    metadata_path = final_path / "metadata.json"

    try:
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)
    except Exception as e:
        print(f"Failed to write metadata: {e}")

    if temp_dir.exists():
        shutil.rmtree(temp_dir)
        
    return {
        "status": "ok",
        "dataset_name": original_name,
        "path": str(final_path)
    }