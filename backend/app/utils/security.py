"""Utilitários de segurança: hashing de senhas, criação e validação de tokens JWT."""

import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import get_settings

# Esquema de segurança Bearer para extração do token no header Authorization
security_scheme = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha em texto plano corresponde ao hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Gera o hash bcrypt da senha."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """
    Cria um token JWT com os dados fornecidos.

    Args:
        data: Dicionário com os claims do token (ex: {"sub": "admin"}).
        expires_delta: Tempo de expiração customizado. Se None, usa o padrão das configurações.

    Returns:
        Token JWT codificado como string.
    """
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> str:
    """
    Dependency do FastAPI que valida o token JWT.

    Retorna o username do admin autenticado.
    Lança HTTP 401 se o token for inválido ou expirado.
    """
    settings = get_settings()
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception
