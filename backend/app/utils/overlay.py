import numpy as np
import cv2
from app.utils.cocos import COCO_LABELS

MASK_COLORS = [
    (255, 0, 0),
    (0, 255, 0),
    (0, 0, 255),
    (255, 255, 0),
    (255, 0, 255),
    (0, 255, 255),
]

def make_overlay(image, masks, obj_meta=None, show_class=False):
    overlay = image.copy()

    for obj_id, mask in masks.items():
        if mask is None:
            continue

        color = MASK_COLORS[obj_id % len(MASK_COLORS)]
        overlay[mask > 0] = color

        if show_class and obj_meta:
            class_id = obj_meta.get(obj_id, {}).get("class_id", obj_id)
            text = f"ID:{obj_id} {COCO_LABELS.get(class_id, class_id)}"
            overlay = draw_label_on_mask(overlay, mask, text, color)

    return cv2.addWeighted(image, 0.7, overlay, 0.3, 0)

def draw_label_on_mask(overlay, mask, text, color):
    ys, xs = np.where(mask > 0)

    if len(xs) == 0:
        return overlay

    cx = int(xs.mean())
    cy = int(ys.mean())

    cv2.putText(
        overlay, text, (cx, cy),
        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,0), 3, cv2.LINE_AA
    )

    cv2.putText(
        overlay, text, (cx, cy),
        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2, cv2.LINE_AA
    )

    return overlay
