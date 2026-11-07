"""Utilitário para geração de links e mensagens do WhatsApp."""

import urllib.parse


def generate_whatsapp_link(
    admin_phone: str,
    order_data: dict,
    items_detail: list,
    total_price: float,
) -> tuple[str, str]:
    """
    Gera a mensagem formatada e o link do WhatsApp para envio da comanda.

    Args:
        admin_phone: Número de telefone do administrador (apenas dígitos com DDI).
        order_data: Dicionário com os dados do pedido (nome, telefone, endereço, etc.).
        items_detail: Lista de dicionários com detalhes dos itens (name, quantity, subtotal).
        total_price: Valor total do pedido.

    Returns:
        tuple: (whatsapp_url, message_text) — link clicável e texto da mensagem.
    """
    items_text = ""
    for item in items_detail:
        items_text += (
            f"• {item['quantity']}x {item['name']} - R$ {item['subtotal']:.2f}\n"
        )

    payment_info = order_data["payment_method"]
    if (
        order_data["payment_method"] == "Cartão de Crédito"
        and order_data.get("installments", 1) > 1
    ):
        installment_value = total_price / order_data["installments"]
        payment_info += (
            f" ({order_data['installments']}x de R$ {installment_value:.2f})"
        )

    message = (
        f"🛍️ *NOVO PEDIDO DE PERFUMARIA*\n\n"
        f"👤 *Cliente:* {order_data['customer_name']}\n"
        f"📱 *Telefone:* {order_data['customer_phone']}\n\n"
        f"📦 *ITENS DO PEDIDO:*\n"
        f"{items_text}\n"
        f"💰 *Total:* R$ {total_price:.2f}\n\n"
        f"📍 *ENDEREÇO DE ENTREGA:*\n"
        f"Endereço: {order_data['street']}, Nº {order_data['number']}\n"
        f"Bairro: {order_data['neighborhood']}\n"
        f"Complemento: {order_data.get('complement') or 'Nenhum'}\n\n"
        f"💳 *FORMA DE PAGAMENTO:*\n"
        f"{payment_info}\n\n"
        f"Aguardando confirmação do pedido! ✨"
    )

    # Garante que o telefone contenha apenas dígitos e o DDI 55 do Brasil
    clean_phone = "".join(filter(str.isdigit, str(admin_phone)))
    if len(clean_phone) in (10, 11) and not clean_phone.startswith("55"):
        clean_phone = f"55{clean_phone}"

    encoded_message = urllib.parse.quote(message)
    whatsapp_url = f"https://wa.me/{clean_phone}?text={encoded_message}"

    return whatsapp_url, message
