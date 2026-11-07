"""Modelos SQLAlchemy para as tabelas de pedidos e itens de pedido."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Order(Base):
    """Representa um pedido realizado pelo cliente."""

    __tablename__ = "orders"

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    customer_name: str = Column(String(200), nullable=False)
    customer_phone: str = Column(String(20), nullable=False)
    street: str = Column(String(300), nullable=False)
    number: str = Column(String(20), nullable=False)
    neighborhood: str = Column(String(100), nullable=False)
    complement: str | None = Column(String(200), nullable=True)
    payment_method: str = Column(String(50), nullable=False)
    installments: int = Column(Integer, default=1)
    total_price: float = Column(Float, nullable=False)
    whatsapp_url: str | None = Column(Text, nullable=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)

    # Relacionamento com itens do pedido
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Order(id={self.id}, customer='{self.customer_name}', total={self.total_price})>"


class OrderItem(Base):
    """Representa um item dentro de um pedido (snapshot do produto no momento da compra)."""

    __tablename__ = "order_items"

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    order_id: int = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id: int = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name: str = Column(String(200), nullable=False)
    product_price: float = Column(Float, nullable=False)
    quantity: int = Column(Integer, nullable=False)
    subtotal: float = Column(Float, nullable=False)

    # Relacionamentos
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

    def __repr__(self) -> str:
        return f"<OrderItem(id={self.id}, product='{self.product_name}', qty={self.quantity})>"
