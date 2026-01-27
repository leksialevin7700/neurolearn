"""
NeuroLearn Backend API
FastAPI application for adaptive learning platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.api.routes import quiz_router, learning_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    print("NeuroLearn Backend Starting...")
    print(f"Environment: {settings.ENVIRONMENT}")
    yield
    print("NeuroLearn Backend Shutting Down...")


# Initialize FastAPI app
app = FastAPI(
    title="NeuroLearn API",
    description="AI-Powered Adaptive Learning Platform Backend",
    version="1.0.0",
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

# Include routers
app.include_router(quiz_router, prefix="/api/v1", tags=["Quiz"])
app.include_router(learning_router, prefix="/api/v1", tags=["Learning"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "NeuroLearn Backend",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "adk_enabled": settings.ADK_ENABLED
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
