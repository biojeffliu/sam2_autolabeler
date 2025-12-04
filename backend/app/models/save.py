from pydantic import BaseModel

class SaveSegmentationsPNGRequest(BaseModel):
    folder: str
    save_negatives: bool

class SaveSegmentationsJSONRequest(BaseModel):
    folder: str
    save_negatives: bool