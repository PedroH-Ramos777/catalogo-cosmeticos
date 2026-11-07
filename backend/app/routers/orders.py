"""Router de pedidos — checkout com geração de link WhatsApp."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderResponse, CheckoutResponse
from app.utils.whatsapp import generate_whatsapp_link
from app.config import get_settings

router = APIRouter(prefix="/api/v1/orders", tags=["Pedidos"])

VALID_PAYMENT_METHODS = [
    "Pix",
    "Dinheiro",
    "Cartão de Crédito",
    "Cartão de Débito",
]


@router.post(
    "/checkout",
    response_model=CheckoutResponse,
    status_code=status.HTTP_201_CREATED,
)
def checkout(order_data: OrderCreate, db: Session = Depends(get_db)):
    """
    Processa o checkout:
    1. Valida produtos e estoque
    2. Decrementa estoque atomicamente
    3. Cria o pedido no banco
    4. Gera link do WhatsApp com a comanda formatada
    """
    settings = get_settings()

    # Validar método de pagamento
    if order_data.payment_method not in VALID_PAYMENT_METHODS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Método de pagamento inválido. "
                f"Opções: {', '.join(VALID_PAYMENT_METHODS)}"
            ),
        )

    # Validar parcelas (só para cartão de crédito)
    if (
        order_data.payment_method != "Cartão de Crédito"
        and order_data.installments
        and order_data.installments > 1
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parcelamento disponível apenas para Cartão de Crédito",
        )

    # Buscar e validar produtos
    items_detail: list[dict] = []
    total_price: float = 0.0
    order_items: list[OrderItem] = []

    for item in order_data.items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id, Product.is_active == True)  # noqa: E712
            .with_for_update()
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Produto ID {item.product_id} não encontrado "
                    "ou indisponível"
                ),
            )

        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Estoque insuficiente para '{product.name}'. "
                    f"Disponível: {product.stock_quantity}, "
                    f"Solicitado: {item.quantity}"
                ),
            )

        subtotal = product.price * item.quantity
        total_price += subtotal

        # Decrementar estoque
        product.stock_quantity -= item.quantity

        items_detail.append(
            {
                "name": product.name,
                "quantity": item.quantity,
                "price": product.price,
                "subtotal": subtotal,
            }
        )

        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                product_price=product.price,
                quantity=item.quantity,
                subtotal=subtotal,
            )
        )

    # Gerar link WhatsApp
    order_dict = order_data.model_dump()
    whatsapp_url, message_text = generate_whatsapp_link(
        admin_phone=settings.ADMIN_PHONE,
        order_data=order_dict,
        items_detail=items_detail,
        total_price=total_price,
    )

    # Criar pedido no banco
    db_order = Order(
        customer_name=order_data.customer_name,
        customer_phone=order_data.customer_phone,
        street=order_data.street,
        number=order_data.number,
        neighborhood=order_data.neighborhood,
        complement=order_data.complement,
        payment_method=order_data.payment_method,
        installments=order_data.installments or 1,
        total_price=total_price,
        whatsapp_url=whatsapp_url,
    )
    db_order.items = order_items

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return CheckoutResponse(
        order=db_order,
        whatsapp_url=whatsapp_url,
        message_text=message_text,
    )


@router.get("/", response_model=list[OrderResponse])
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Lista todos os pedidos (para o painel admin). Pode ser protegida futuramente."""
    orders = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return orders
