from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = "sqlite:///./planner.db"  # Default to SQLite for local dev
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # CORS - parse as string and split
    ALLOWED_ORIGINS_STR: str = "http://localhost:3000,http://localhost:3001,http://localhost:8000"
    
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS_STR.split(",")]
    
    # Application
    PROJECT_NAME: str = "Deep Focus Planner API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Email Configuration
    EMAIL_PROVIDER: str = "sendgrid"  # sendgrid or smtp
    SENDGRID_API_KEY: str = ""
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@deepfocusplanner.com"
    EMAIL_FROM_NAME: str = "Deep Focus Planner"
    
    # OAuth Configuration
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    APPLE_CLIENT_ID: str = ""
    APPLE_TEAM_ID: str = ""
    APPLE_KEY_ID: str = ""
    APPLE_PRIVATE_KEY: str = ""
    
    # Token Expiry
    EMAIL_VERIFICATION_EXPIRE_HOURS: int = 24
    PASSWORD_RESET_EXPIRE_HOURS: int = 1
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra='ignore'
    )


settings = Settings()
