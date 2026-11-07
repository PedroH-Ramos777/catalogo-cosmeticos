"""Schemas Pydantic para produtos do catálogo de perfumaria."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    """Schema base com os campos comuns de produto."""

    name: str = Field(
        ..., min_length=1, max_length=200, examples=["Perfume Essencial Natura 100ml"]
    )
    description: str = Field(
        ...,
        min_length=1,
        examples=["Fragrância amadeirada intensa com toques de especiarias."],
    )
    price: float = Field(..., gt=0, examples=[189.90])
    category: str = Field(
        ..., min_length=1, max_length=100, examples=["Perfumes"]
    )
    image_url: Optional[str] = Field(
        None, max_length=500, examples=["https://exemplo.com/imagem.jpg"]
    )
    stock_quantity: int = Field(..., ge=0, examples=[15])


class ProductCreate(ProductBase):
    """Schema para criação de um novo produto."""

    pass


class ProductUpdate(BaseModel):
    """Schema para atualização parcial de um produto."""

    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    image_url: Optional[str] = Field(None, max_length=500)
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    """Schema de resposta com os dados completos do produto."""

    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    """Schema de resposta para listagem paginada de produtos."""

    products: list[ProductResponse]
    total: int
