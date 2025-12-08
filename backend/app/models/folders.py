from pydantic import BaseModel
from datetime import datetime

class RenameFolderRequest(BaseModel):
    old_name: str
    new_name: str

class UpdateDescriptionRequest(BaseModel):
    folder_name: str
    description: str

class FolderMetadata(BaseModel):
    name: str
    objects: dict[str, int] = {} # Key: Object ID, Value: Num Segmentations
    description: str = ""
    upload_date: datetime