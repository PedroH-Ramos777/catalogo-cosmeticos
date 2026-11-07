"""Schemas Pydantic para autenticação e tokens JWT."""

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Schema para requisição de login do administrador."""

    username: str = Field(..., examples=["admin"])
    password: str = Field(..., examples=["admin123"])


class TokenResponse(BaseModel):
    """Schema de resposta contendo o token de acesso JWT."""

    access_token: str
    token_type: str = "bearer"
