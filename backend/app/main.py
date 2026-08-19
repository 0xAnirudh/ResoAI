import os
import sys
import logging
from pathlib import Path

# Ensure root directory and backend directory are in sys.path
root_dir = str(Path(__file__).resolve().parent.parent.parent)
backend_dir = str(Path(__file__).resolve().parent.parent)
for p in [root_dir, backend_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.mongodb import db_manager
from app.api.routes import chat, health

# Configure Logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing application resources...")
    await db_manager.connect()
    yield
    logger.info("Shutting down application resources...")
    await db_manager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for frontend integration (supporting Vercel deployments, Render, and Localhost)
ALLOWED_ORIGINS = [
    "https://resoai.vercel.app",
    "https://reso-ai.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https?:\/\/([a-zA-Z0-9_-]+\.)*(vercel\.app|onrender\.com|localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Register API Routers (supports both /api prefix and root endpoints)
app.include_router(health.router, prefix=settings.API_PREFIX, tags=["Health"])
app.include_router(chat.router, prefix=settings.API_PREFIX, tags=["Chat"])
app.include_router(health.router, tags=["Health Direct"])
app.include_router(chat.router, tags=["Chat Direct"])

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)

