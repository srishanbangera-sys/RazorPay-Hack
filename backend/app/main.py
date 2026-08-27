from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.seed import seed_db
from app.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed deterministic demo data
    Base.metadata.create_all(bind=engine)
    seed_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Agent-Transactable Merchant: Bounded Autonomous AI Commerce with Deterministic Mandate Enforcement",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "mandate_engine": "active"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
