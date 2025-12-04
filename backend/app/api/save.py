from fastapi import APIRouter, HTTPException
from app.services.mask_store import MASK_STORE
from app.models.save import SaveSegmentationsPNGRequest, SaveSegmentationsJSONRequest
from app.utils.validation import safe_folder_path
from app.utils.paths import SEGMENTATIONS_DIR
from app.utils.cocos import COCO_LABELS
import os
import json
import cv2
import numpy as np

router = APIRouter(prefix="/save", tags=["save"])

@router.post("/segmentations-png")
async def save_segmentations_png(req: SaveSegmentationsPNGRequest):
    folder = req.folder
    folder_path = safe_folder_path(req.folder)
    save_negatives = req.save_negatives

    if folder not in MASK_STORE.store:
        raise HTTPException(404, detail="No masks found for the given folder")

    save_dir = SEGMENTATIONS_DIR / folder
    save_dir.mkdir(parents=True, exist_ok=True)

    obj_meta = MASK_STORE.objects.get(folder, {})
    saved_files = 0

    global_obj_ids = MASK_STORE.get_global_object_ids(folder)

    for frame_idx, obj_masks in MASK_STORE.store[folder].items():
        for obj_id in global_obj_ids:

            mask = obj_masks.get(obj_id)

            if mask is None and not save_negatives:
                continue

            if mask is None:
                some_mask = next(iter(obj_masks.values()))
                h, w = some_mask.shape
                mask = np.zeros((h, w), dtype=np.uint8)

            mask_img = (mask * 255).astype("uint8")

            class_id = obj_meta.get(obj_id, {}).get("class_id", -1)
            if class_id in COCO_LABELS:
                class_name = COCO_LABELS[class_id]
            else:
                class_name = "unknown"
            folder_name = f"{obj_id}_{class_name}"

            obj_dir = save_dir / folder_name
            obj_dir.mkdir(parents=True, exist_ok=True)

            out_path = obj_dir / f"{frame_idx:05d}.png"
            cv2.imwrite(str(out_path), mask_img)
            saved_files += 1

    return {
        "status": "success",
        "folder": req.folder,
        "save_negatives": req.save_negatives,
        "saved": saved_files,
        "output_dir": str(save_dir),
    }


@router.post("/segmentations-json")
async def save_segmentations_json(req: SaveSegmentationsJSONRequest):
    folder = req.folder
    folder_path = safe_folder_path(folder)
    save_negatives = req.save_negatives

    if folder not in MASK_STORE.store:
        raise HTTPException(404, detail="No masks found for the given folder")

    save_dir = SEGMENTATIONS_DIR / folder
    save_dir.mkdir(parents=True, exist_ok=True)

    obj_meta = MASK_STORE.objects.get(folder, {})
    saved_files = 0

    global_obj_ids = MASK_STORE.get_global_object_ids(folder)

    for frame_idx, obj_masks in MASK_STORE.store[folder].items():

        for obj_id in global_obj_ids:
            mask = obj_masks.get(obj_id)

            if mask is None and not save_negatives:
                continue

            if mask is None:
                sample_mask = next(iter(obj_masks.values()))
                h, w = sample_mask.shape
                mask = np.zeros((h, w), dtype=np.uint8)

            class_id = obj_meta.get(obj_id, {}).get("class_id", -1)
            if class_id in COCO_LABELS:
                class_name = COCO_LABELS[class_id]
            else:
                class_name = "unknown"
            folder_name = f"{obj_id}_{class_name}"

            obj_dir = save_dir / folder_name
            obj_dir.mkdir(parents=True, exist_ok=True)

            out_path = obj_dir / f"{frame_idx:05d}.json"

            with open(out_path, "w") as f:
                json.dump(mask.tolist(), f)

            saved_files += 1

    return {
        "status": "success",
        "folder": folder,
        "saved": saved_files,
        "save_negatives": save_negatives,
        "output_dir": str(save_dir),
    }
