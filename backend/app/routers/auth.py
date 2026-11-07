"""Router de autenticação — login do administrador com JWT."""

from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import LoginRequest, TokenResponse
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from app.config import get_settings

router = APIRouter(prefix="/api/v1/auth", tags=["Autenticação"])

# Hash da senha do admin é gerado na primeira execução
_admin_password_hash: str | None = None


def _get_admin_hash() -> str:
    """Retorna (e cacheia) o hash da senha do administrador."""
    global _admin_password_hash
    if _admin_password_hash is None:
        settings = get_settings()
        _admin_password_hash = get_password_hash(settings.ADMIN_PASSWORD)
    return _admin_password_hash


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest):
    """
    Autentica o administrador e retorna um token JWT.
    """
    settings = get_settings()

    if credentials.username != settings.ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
        )

    if not verify_password(credentials.password, _get_admin_hash()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
        )

    access_token = create_access_token(data={"sub": credentials.username})
    return TokenResponse(access_token=access_token)
