"""
Application Configuration
Centralized settings management using pydantic-settings
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "NeuroLearn Backend"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    # ADK Configuration
    ADK_ENABLED: bool = True
    ADK_API_KEY: str = os.getenv("ADK_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Database (if needed)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # AI Model Settings
    DEFAULT_MODEL: str = "gemini-1.5-flash"
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 2000
    
    # Quiz Thresholds
    PASS_THRESHOLD: float = 0.7  # 70% to pass
    REVISION_THRESHOLD: float = 0.5  # Below 50% needs revision
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
