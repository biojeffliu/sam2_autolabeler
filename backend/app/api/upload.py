from fastapi import APIRouter, UploadFile, File, HTTPException
import zipfile
import shutil
from app.utils.paths import UPLOADS_DIR
from pathlib import Path

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
        if item.is_dir()
    ]
    if not extracted_items:
        raise HTTPException(400, "No folder found inside zip.")

    original_folder = extracted_items[0]
    original_name = original_folder.name

    final_path = UPLOADS_DIR / original_name
    if final_path.exists():
        shutil.rmtree(final_path)

    shutil.move(str(original_folder), str(final_path))

    shutil.rmtree(temp_dir)
        
    return {
        "status": "ok",
        "dataset_name": original_name,
        "path": str(final_path)
    }