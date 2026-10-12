import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
from app.seed import seed_database
from app.services.gemini_service import gemini_service

from app.api.routes import (
    auth,
    plants,
    identify,
    diagnose,
    reminders,
    growth,
    chat,
    notifications,
    articles,
    dashboard,
    calendar
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Ensure database schema is created and seeded
    try:
        seed_database()
    except Exception as e:
        print(f"Startup database initialization error: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FloraAI: Production AI-Powered Plant Care, Disease Diagnostics, and Botanical Assistant",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev frontends
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded static media files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Routers under /api
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(plants.router, prefix=settings.API_V1_STR)
app.include_router(identify.router, prefix=settings.API_V1_STR)
app.include_router(diagnose.router, prefix=settings.API_V1_STR)
app.include_router(reminders.router, prefix=settings.API_V1_STR)
app.include_router(growth.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(articles.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(calendar.router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["System Health"])
def healthcheck():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "gemini_ai_configured": gemini_service.is_configured(),
        "active_model": settings.GEMINI_MODEL,
        "mode": "Live Vision" if gemini_service.is_configured() else "Intelligent Botanical Engine (Offline Ready)",
        "upload_directory": settings.UPLOAD_DIR
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to FloraAI API. Visit /docs for the interactive Swagger documentation.",
        "health": "/api/health"
    }
