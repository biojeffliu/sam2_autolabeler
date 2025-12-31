from fastapi import APIRouter, HTTPException
from app.services.model_service import ModelService

router = APIRouter(prefix="/ml_models", tags=["ml_models"])
svc = ModelService()

@router.get("")
def list_models():
    models = []

    for m in svc.list_models():
        try:
            checkpoints = svc.list_checkpoints(m["id"])
            num_checkpoints = len(checkpoints)
        except Exception:
            num_checkpoints = 0
        print(m)

        models.append({
                "id": m["id"],
                "name": m["name"],
                "task": m["task"],
                "family": m["family"],
                "size": m.get("size"),
                "params_m": m["params_m"],
                "stride": m["stride"],
                "source": m["source"],
                "pretrained": m["pretrained"],
                "fine_tunable": m["fine_tunable"],
                "best_checkpoint_id": "best",
                "num_checkpoints": num_checkpoints,
            })

    return {"models": models}

@router.get("/{model_id}")
def get_model(model_id: str):
    try:
        m = svc.get_model(model_id)
    except KeyError:
        raise HTTPException(404, detail="Model not found")
    
    return {
        "id": m["id"],
        "name": m["name"],
        "task": m["task"],
        "family": m["family"],
        "size": m.get("size"),
        "params_m": m["params_m"],
        "stride": m["stride"],
        "source": m["source"],
        "pretrained": m["pretrained"],
        "fine_tunable": m["fine_tunable"],
        "datasets": m.get("datasets"),
        "created_at": m.get("created_at"),
    }

@router.get("/{model_id}/checkpoints")
def list_checkpoints(model_id: str):
    try:
        cps = svc.list_checkpoints(model_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Model not found")

    out = []
    for c in cps:
        out.append({
            "id": c["id"],
            "label": c["label"],
            "epoch": c.get("epoch"),
            "recommended": c.get("recommended", False),
        })

    return {
        "model_id": model_id,
        "checkpoints": out,
    }