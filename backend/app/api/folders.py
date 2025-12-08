from fastapi import APIRouter, HTTPException
from app.utils.paths import UPLOADS_DIR
from app.models.folders import RenameFolderRequest, FolderMetadata, UpdateDescriptionRequest
import os
import shutil
from datetime import datetime
import json

router = APIRouter(prefix="/folders", tags=["folders"])

METADATA_FILENAME = "metadata.json"

@router.get("/", response_model=dict[str, list[FolderMetadata]])
async def list_folders():
    if not UPLOADS_DIR.exists():
        raise HTTPException(500, detail="Uploads directory missing")
    
    folder_names = [name for name in os.listdir(UPLOADS_DIR) if (UPLOADS_DIR / name).is_dir()]

    metadata_list = [load_metadata(name) for name in folder_names]
    
    metadata_list.sort(key=lambda x: x.upload_date, reverse=True)

    return {"folders": metadata_list}

@router.delete("/delete")
async def delete_folders(folder: str):
    if not UPLOADS_DIR.exists():
        raise HTTPException(500, detail="Uploads directory missing")
    
    folder_path = UPLOADS_DIR / folder
    
    if not folder_path.exists() or not folder_path.is_dir():
        raise HTTPException(404, detail="Folder not found")

    if UPLOADS_DIR.resolve() not in folder_path.resolve().parents:
         raise HTTPException(403, detail="Invalid folder path")
    
    try:
        shutil.rmtree(folder_path)
    except OSError as e:
        raise HTTPException(500, detail=f"Error deleting folder: {str(e)}")
    
    return {"message": f"Folder '{folder}' deleted successfully"}

@router.put("/rename")
async def rename_folder(req: RenameFolderRequest):
    if not UPLOADS_DIR.exists():
        raise HTTPException(500, detail="Uploads directory missing")
    
    old_name = os.path.basename(req.old_name)
    new_name = os.path.basename(req.new_name)

    old_path = UPLOADS_DIR / old_name
    new_path = UPLOADS_DIR / new_name

    if not old_path.exists():
        raise HTTPException(404, detail="Original folder not found")
    
    if new_path.exists():
        raise HTTPException(409, detail="A folder with the new name already exists")
    
    if UPLOADS_DIR.resolve() not in new_path.resolve().parents:
         raise HTTPException(403, detail="Invalid folder path")
    
    try:
        old_path.rename(new_path)
        try:
            meta = load_metadata(new_name)
            meta.name = new_name
            save_metadata(new_name, meta)
        except Exception as e:
            print(f"Warning: Failed to update metadata name: {e}")
    except OSError as e:
        raise HTTPException(500, detail=f"Error renaming folder: {str(e)}")
    
    return {"message": "Folder renamed successfully", "new_name": new_name}

@router.post("/description")
async def update_description(req: UpdateDescriptionRequest):
    folder_path = UPLOADS_DIR / req.folder_name
    if not folder_path.exists():
        raise HTTPException(404, detail="Folder not found")
    
    meta = load_metadata(req.folder_name)
    meta.description = req.description
    save_metadata(req.folder_name, meta)
    
    return {"message": "Description updated", "metadata": meta}


def get_metadata_path(folder_name: str):
    return UPLOADS_DIR / folder_name / METADATA_FILENAME


def load_metadata(folder_name: str) -> FolderMetadata:
    folder_path = UPLOADS_DIR / folder_name
    file_path = folder_path / METADATA_FILENAME
    
    if not file_path.exists():
        try:
            ctime = os.path.getctime(folder_path)
            created_at = datetime.fromtimestamp(ctime)
        except:
            created_at = datetime.now()

        default_data = FolderMetadata(
            name=folder_name,
            objects={},
            description="",
            upload_date=created_at
        )
        save_metadata(folder_name, default_data)
        return default_data

    try:
        with open(file_path, "r") as f:
            data = json.load(f)
        return FolderMetadata(**data)
    except Exception as e:
        print(f"Error loading metadata for {folder_name}: {e}")
        return FolderMetadata(name=folder_name, upload_date=datetime.now())
    
def save_metadata(folder_name: str, data: FolderMetadata):
    file_path = get_metadata_path(folder_name)
    with open(file_path, "w") as f:
        f.write(data.model_dump_json(indent=2))