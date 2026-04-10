from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "API Diagnóstico Cáncer de Piel (Híbrido)"
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173/",
        "http://127.0.0.1:5173/",
    ]

settings = Settings()