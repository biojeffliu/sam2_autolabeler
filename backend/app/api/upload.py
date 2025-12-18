from fastapi import APIRouter, UploadFile, File, HTTPException
import zipfile
import shutil
from app.utils.paths import UPLOADS_DIR
from app.utils.validation import list_image_files, get_first_image_size
from pathlib import Path
import json
import uuid
from datetime import datetime

router = APIRouter(prefix="/upload")

@router.post("/")
async def receive_folder_and_copy(file: UploadFile = File(...)):
    temp_dir = UPLOADS_DIR / f"temp_extract_{uuid.uuid4().hex}"
    temp_dir.mkdir(parents=True, exist_ok=True)

    zip_path = temp_dir / file.filename
    with open(zip_path, "wb") as f:
        f.write(await file.read())

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(temp_dir)

    zip_path.unlink()

    folders = [p for p in temp_dir.iterdir() if p.is_dir() and not p.name.startswith("__")]

    if len(folders) != 1:
        raise HTTPException(
            400,
            "ZIP must contain exactly one root folder with images."
        )

    original_folder = folders[0]
    original_name = original_folder.name

    final_path = UPLOADS_DIR / original_name
    if final_path.exists():
        shutil.rmtree(final_path)

    shutil.move(str(original_folder), str(final_path))

    images = list_image_files(final_path)

    width, height = get_first_image_size(final_path)

    metadata = {
        "name": original_name,
        "objects": {},
        "description": "",
        "upload_date": datetime.now().isoformat(),
        "num_frames": len(images),
        "width": width,
        "height": height
    }

    metadata_path = final_path / "metadata.json"
    tmp_metadata = metadata_path.with_suffix(".json.tmp")
    with open(tmp_metadata, "w") as f:
        json.dump(metadata, f, indent=2)
    tmp_metadata.replace(metadata_path)
    shutil.rmtree(temp_dir)
        
    return {
        "status": "ok",
        "dataset_name": original_name,
        "path": str(final_path)
    }