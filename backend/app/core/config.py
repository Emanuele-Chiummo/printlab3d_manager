from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    API_V1_STR: str = "/api/v1"

    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "printlab"
    POSTGRES_USER: str = "printlab"
    POSTGRES_PASSWORD: str = "printlab"

    SECRET_KEY: str = "CHANGE_ME_IN_PROD"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # allow both a JSON-style list (used by pydantic) or a comma-separated string
    # (`http://a,http://b`) from the environment.  PydanticSettings attempts to
    # decode complex values as JSON *before* running our validator, which meant a
    # plain comma string triggered a JSONDecodeError during container startup.
    # Using Union[str, list[str]] defers parsing to our validator.
    CORS_ORIGINS: str | list[str] = ["http://localhost:8080", "http://localhost:5173", "http://localhost"]

    ADMIN_EMAIL: str = "admin@printlab.local"
    ADMIN_PASSWORD: str = "admin123"

    LOG_LEVEL: str = "INFO"

    # Preventivo settings (Excel mapping)
    fattore_rischio: float = 0.10
    costo_energia_kwh: float = 0.30
    costo_orario_manodopera: float = 25
    iva_perc: float = 0.22
    overhead_perc: float = 0.10
    margine_perc: float = 0.30
    consumabili_fissi_eur: float = 1.00

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, v):
        # v may be a JSON string, an already-parsed list, or a comma-separated
        # string.  We try JSON first then fall back to simple splitting.
        if isinstance(v, str):
            try:
                import json

                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
                # if JSON decoded to something else, fall through to split
            except Exception:
                # ignore and try comma-split
                pass
            return [s.strip() for s in v.split(",") if s.strip()]
        return v


settings = Settings()
