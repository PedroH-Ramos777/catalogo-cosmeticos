"""Configurações da aplicação carregadas a partir de variáveis de ambiente."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações gerais do projeto, lidas do arquivo .env."""

    SECRET_KEY: str = "sua-chave-secreta-aqui-mude-em-producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 horas

    ADMIN_PHONE: str = "5583994159831"
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"

    STORE_NAME: str = "Catálogo Express Cosméticos"
    DATABASE_URL: str = "sqlite:///./catalogo.db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


@lru_cache
def get_settings() -> Settings:
    """Retorna a instância de configurações cacheada (singleton)."""
    return Settings()
