from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import images, upload, folders, segmentation, save
from fastapi.staticfiles import StaticFiles
from app.utils.paths import UPLOADS_DIR

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

static_app = CORSMiddleware(
    StaticFiles(directory=str(UPLOADS_DIR)),
    allow_origins=["http://localhost:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", static_app, name="static")

app.include_router(images.router, prefix="/api")
app.include_router(folders.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(segmentation.router, prefix="/api")
app.include_router(save.router, prefix="/api")