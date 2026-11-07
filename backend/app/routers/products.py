"""Router de produtos — CRUD completo para o catálogo de perfumaria."""

import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.product import Product
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
)
from app.utils.security import get_current_admin

router = APIRouter(prefix="/api/v1/products", tags=["Produtos"])


@router.post("/upload")
def upload_product_image(
    file: UploadFile = File(...),
    admin: str = Depends(get_current_admin),
):
    """Faz upload de imagem do produto e retorna a URL acessível."""
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de imagem inválido. Formatos permitidos: JPG, PNG, WEBP, GIF",
        )

    filename = f"{uuid.uuid4().hex}{ext}"
    static_uploads = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "static",
        "uploads",
    )
    os.makedirs(static_uploads, exist_ok=True)
    filepath = os.path.join(static_uploads, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/static/uploads/{filename}"}


@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Cadastra um novo produto. Requer autenticação de admin."""
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.get("/", response_model=ProductListResponse)
def list_products(
    category: Optional[str] = Query(None, description="Filtrar por categoria"),
    search: Optional[str] = Query(None, description="Buscar por nome"),
    available_only: bool = Query(
        False, description="Mostrar apenas produtos em estoque"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Lista produtos com filtros opcionais. Rota pública."""
    query = db.query(Product).filter(Product.is_active == True)  # noqa: E712

    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if available_only:
        query = query.filter(Product.stock_quantity > 0)

    total = query.count()
    products = (
        query.order_by(Product.category, Product.name)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return ProductListResponse(products=products, total=total)


@router.get("/categories", response_model=list[str])
def list_categories(db: Session = Depends(get_db)):
    """Lista todas as categorias únicas de produtos ativos."""
    categories = (
        db.query(Product.category)
        .filter(Product.is_active == True)  # noqa: E712
        .distinct()
        .order_by(Product.category)
        .all()
    )
    return [c[0] for c in categories]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Retorna detalhes de um produto específico."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado",
        )
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Atualiza um produto existente. Requer autenticação."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado",
        )

    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Desativa um produto (soft delete). Requer autenticação."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado",
        )
    product.is_active = False
    db.commit()
