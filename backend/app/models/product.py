"""Modelo SQLAlchemy para a tabela de produtos."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Product(Base):
    """Representa um produto no catálogo de perfumaria."""

    __tablename__ = "products"

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    name: str = Column(String(200), nullable=False)
    description: str = Column(Text, nullable=False)
    price: float = Column(Float, nullable=False)
    category: str = Column(String(100), nullable=False)
    image_url: str | None = Column(String(500), nullable=True)
    stock_quantity: int = Column(Integer, nullable=False, default=0)
    is_active: bool = Column(Boolean, default=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime | None = Column(DateTime, onupdate=datetime.utcnow)

    # Relacionamento com itens de pedido
    order_items = relationship("OrderItem", back_populates="product")

    def __repr__(self) -> str:
        return f"<Product(id={self.id}, name='{self.name}', price={self.price})>"
