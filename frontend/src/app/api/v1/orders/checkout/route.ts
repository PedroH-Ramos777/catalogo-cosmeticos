import { NextRequest, NextResponse } from 'next/server';
import {
  getStoredProducts,
  setStoredProducts,
  getStoredOrders,
  setStoredOrders,
  generateWhatsAppLink,
  ADMIN_PHONE,
} from '@/lib/server-data';
import { OrderCreate, OrderResponse, OrderItemResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderCreate = await request.json();

    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { detail: 'A sacola está vazia.' },
        { status: 400 }
      );
    }

    const products = getStoredProducts();
    const itemsDetail: Array<{ name: string; quantity: number; subtotal: number }> = [];
    const orderItems: OrderItemResponse[] = [];
    let totalPrice = 0;

    // Validate and deduct stock
    for (const item of orderData.items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product || !product.is_active) {
        return NextResponse.json(
          { detail: `Produto ID ${item.product_id} não encontrado.` },
          { status: 400 }
        );
      }

      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          {
            detail: `Estoque insuficiente para "${product.name}". Disponível: ${product.stock_quantity}`,
          },
          { status: 400 }
        );
      }

      const subtotal = product.price * item.quantity;
      totalPrice += subtotal;
      product.stock_quantity -= item.quantity;

      itemsDetail.push({
        name: product.name,
        quantity: item.quantity,
        subtotal,
      });

      orderItems.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    // Save updated stock
    setStoredProducts(products);

    // Generate WhatsApp Link
    const { whatsappUrl, messageText } = generateWhatsAppLink(
      ADMIN_PHONE,
      orderData,
      itemsDetail,
      totalPrice
    );

    const newOrder: OrderResponse = {
      id: Date.now(),
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      street: orderData.street,
      number: orderData.number,
      neighborhood: orderData.neighborhood,
      complement: orderData.complement || null,
      payment_method: orderData.payment_method,
      installments: orderData.installments || 1,
      total_price: totalPrice,
      whatsapp_url: whatsappUrl,
      items: orderItems,
      created_at: new Date().toISOString(),
    };

    const orders = getStoredOrders();
    orders.unshift(newOrder);
    setStoredOrders(orders);

    return NextResponse.json(
      {
        order: newOrder,
        whatsapp_url: whatsappUrl,
        message_text: messageText,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { detail: 'Erro ao processar checkout' },
      { status: 500 }
    );
  }
}
