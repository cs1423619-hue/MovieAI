from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import settings
from app.database import Base, engine
from app import models  # noqa: F401
from app.main_routes import router as api_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MovieAI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

public_dir = Path(__file__).resolve().parent / "static"
if public_dir.exists():
    app.mount("/static", StaticFiles(directory=str(public_dir)), name="static")

@app.get("/health")
def health():
    return {"status": "ok", "service": "MovieAI backend"}
