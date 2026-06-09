from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    APP_ENV: str = "development"
    SECRET_KEY: str = "dev-secret-change-me"
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    DATABASE_URL: str = "postgresql+asyncpg://capitalhouse:capitalhouse_dev@localhost:5432/capitalhouse"
    REDIS_URL: str = "redis://:redis_dev@localhost:6379/0"
    MEILI_URL: str = "http://localhost:7700"
    MEILI_MASTER_KEY: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    RESEND_API_KEY: str = ""
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "capital-house-media"
    R2_PUBLIC_URL: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    MYFATOORAH_API_KEY: str = ""
    MYFATOORAH_BASE_URL: str = "https://apitest.myfatoorah.com"
    FRONTEND_URL: str = "http://localhost:3001"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
