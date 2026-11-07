"""Módulo de schemas Pydantic para validação de dados da API."""

from app.schemas.product import (
    ProductBase,
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
)
from app.schemas.order import (
    OrderItemCreate,
    OrderCreate,
    OrderItemResponse,
    OrderResponse,
    CheckoutResponse,
)
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
)

__all__ = [
    # Produtos
    "ProductBase",
    "ProductCreate",
    "ProductUpdate",
    "ProductResponse",
    "ProductListResponse",
    # Pedidos
    "OrderItemCreate",
    "OrderCreate",
    "OrderItemResponse",
    "OrderResponse",
    "CheckoutResponse",
    # Autenticação
    "LoginRequest",
    "TokenResponse",
]
