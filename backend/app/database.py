"""Configuração do banco de dados com SQLAlchemy 2.0."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.config import get_settings

settings = get_settings()

# Para SQLite, é necessário desabilitar a verificação de thread
connect_args: dict = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependência do FastAPI que fornece uma sessão do banco de dados.

    Garante que a sessão será fechada ao final da requisição.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Cria todas as tabelas no banco de dados a partir dos modelos registrados."""
    Base.metadata.create_all(bind=engine)
