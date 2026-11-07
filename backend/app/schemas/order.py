"""Schemas Pydantic para pedidos e itens de pedido."""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class OrderItemCreate(BaseModel):
    """Schema para criação de um item dentro do pedido."""

    product_id: int
    quantity: int = Field(..., gt=0, le=100)


class OrderCreate(BaseModel):
    """Schema para criação de um novo pedido (checkout)."""

    customer_name: str = Field(
        ..., min_length=1, max_length=200, examples=["Maria Silva"]
    )
    customer_phone: str = Field(
        ..., min_length=10, max_length=20, examples=["83999998888"]
    )
    street: str = Field(
        ..., min_length=1, max_length=300, examples=["Rua das Flores"]
    )
    number: str = Field(..., min_length=1, max_length=20, examples=["123"])
    neighborhood: str = Field(
        ..., min_length=1, max_length=100, examples=["Centro"]
    )
    complement: Optional[str] = Field(
        None, max_length=200, examples=["Apto 101"]
    )
    payment_method: str = Field(
        ..., examples=["Pix"]
    )  # Pix, Dinheiro, Cartão de Crédito, Cartão de Débito
    installments: Optional[int] = Field(1, ge=1, le=12, examples=[3])
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderItemResponse(BaseModel):
    """Schema de resposta para um item do pedido."""

    id: int
    product_id: int
    product_name: str
    product_price: float
    quantity: int
    subtotal: float

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    """Schema de resposta com os dados completos do pedido."""

    id: int
    customer_name: str
    customer_phone: str
    street: str
    number: str
    neighborhood: str
    complement: Optional[str]
    payment_method: str
    installments: int
    total_price: float
    whatsapp_url: Optional[str]
    items: List[OrderItemResponse]
    created_at: datetime

    model_config = {"from_attributes": True}


class CheckoutResponse(BaseModel):
    """Schema de resposta do checkout com link do WhatsApp."""

    order: OrderResponse
    whatsapp_url: str
    message_text: str
