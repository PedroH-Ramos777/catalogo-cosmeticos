import { Product, OrderResponse } from '@/types';

export const ADMIN_PHONE = process.env.ADMIN_PHONE || '5583994159831';
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Perfume Essencial Natura 100ml',
    description: 'Fragrância marcante e sofisticada com notas amadeiradas. Ideal para uso diário e ocasiões especiais.',
    price: 189.9,
    category: 'Perfumes',
    image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 15,
    is_active: true,
  },
  {
    id: 2,
    name: 'Hidratante Corporal TodoDia Natura 400ml',
    description: 'Hidratação intensa com manteiga de karité. Deixa a pele macia e perfumada por horas.',
    price: 45.9,
    category: 'Hidratantes',
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 25,
    is_active: true,
  },
  {
    id: 3,
    name: 'Base Líquida Vult HD 30ml',
    description: 'Cobertura média a alta com acabamento natural. Longa duração e proteção FPS 15.',
    price: 39.9,
    category: 'Maquiagem',
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 20,
    is_active: true,
  },
  {
    id: 4,
    name: 'Shampoo Reconstrutor SOS Cachos 300ml',
    description: 'Fórmula com queratina e óleo de coco para reconstrução capilar. Define e revitaliza os cachos.',
    price: 32.9,
    category: 'Cuidados Capilares',
    image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 30,
    is_active: true,
  },
  {
    id: 5,
    name: 'Desodorante Corporal Spray 150ml',
    description: 'Proteção e perfumação prolongada para o corpo todo. Fragrância revigorante e refrescante.',
    price: 24.9,
    category: 'Cuidados Corporais',
    image_url: 'https://images.unsplash.com/photo-1608248597359-0027f6cfb5e1?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 28,
    is_active: true,
  },
  {
    id: 6,
    name: 'Perfume Malbec Gold Boticário 100ml',
    description: 'Fragrância amadeirada com notas quentes de âmbar e café. Elegância e sofisticação pura.',
    price: 269.9,
    category: 'Perfumes',
    image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 10,
    is_active: true,
  },
  {
    id: 7,
    name: 'Creme Facial Hidratante Revitalizante 50g',
    description: 'Tratamento facial com ácido hialurônico e vitamina C. Nutre e renova o viço natural da pele.',
    price: 119.9,
    category: 'Cuidados Corporais',
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 12,
    is_active: true,
  },
  {
    id: 8,
    name: 'Batom Matte Avon Power Stay',
    description: 'Cor intensa com acabamento matte aveludado. Longa duração de até 16h sem borrar ou transferir.',
    price: 29.9,
    category: 'Maquiagem',
    image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 22,
    is_active: true,
  },
  {
    id: 9,
    name: 'Máscara Capilar Nutrição Intensa 300g',
    description: 'Hidratação profunda com óleo de argan e pantenol. Restaura fios danificados e ressecados.',
    price: 42.9,
    category: 'Cuidados Capilares',
    image_url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 18,
    is_active: true,
  },
  {
    id: 10,
    name: 'Colônia Floral Fresca 75ml',
    description: 'Fragrância leve e divertida com notas florais e frutais. Perfeita para o pós-banho e dias quentes.',
    price: 89.9,
    category: 'Perfumes',
    image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 14,
    is_active: true,
  },
];

// In-memory data store for serverless execution
declare global {
  // eslint-disable-next-line no-var
  var __CATALOGO_PRODUCTS: Product[] | undefined;
  // eslint-disable-next-line no-var
  var __CATALOGO_ORDERS: OrderResponse[] | undefined;
}

export function getStoredProducts(): Product[] {
  if (!global.__CATALOGO_PRODUCTS) {
    global.__CATALOGO_PRODUCTS = [...INITIAL_PRODUCTS];
  }
  return global.__CATALOGO_PRODUCTS;
}

export function setStoredProducts(products: Product[]): void {
  global.__CATALOGO_PRODUCTS = products;
}

export function getStoredOrders(): OrderResponse[] {
  if (!global.__CATALOGO_ORDERS) {
    global.__CATALOGO_ORDERS = [];
  }
  return global.__CATALOGO_ORDERS;
}

export function setStoredOrders(orders: OrderResponse[]): void {
  global.__CATALOGO_ORDERS = orders;
}

export function generateWhatsAppLink(
  adminPhone: string,
  orderData: {
    customer_name: string;
    customer_phone: string;
    street: string;
    number: string;
    neighborhood: string;
    complement?: string | null;
    payment_method: string;
    installments?: number;
  },
  itemsDetail: Array<{ name: string; quantity: number; subtotal: number }>,
  totalPrice: number
): { whatsappUrl: string; messageText: string } {
  let itemsText = '';
  for (const item of itemsDetail) {
    itemsText += `• ${item.quantity}x ${item.name} - R$ ${item.subtotal.toFixed(2)}\n`;
  }

  let paymentInfo = orderData.payment_method;
  if (orderData.payment_method === 'Cartão de Crédito' && (orderData.installments || 1) > 1) {
    const installments = orderData.installments || 1;
    const installmentValue = totalPrice / installments;
    paymentInfo += ` (${installments}x de R$ ${installmentValue.toFixed(2)})`;
  }

  const message =
    `🛍️ *NOVO PEDIDO DE PERFUMARIA*\n\n` +
    `👤 *Cliente:* ${orderData.customer_name}\n` +
    `📱 *Telefone:* ${orderData.customer_phone}\n\n` +
    `📦 *ITENS DO PEDIDO:*\n` +
    `${itemsText}\n` +
    `💰 *Total:* R$ ${totalPrice.toFixed(2)}\n\n` +
    `📍 *ENDEREÇO DE ENTREGA:*\n` +
    `Endereço: ${orderData.street}, Nº ${orderData.number}\n` +
    `Bairro: ${orderData.neighborhood}\n` +
    `Complemento: ${orderData.complement || 'Nenhum'}\n\n` +
    `💳 *FORMA DE PAGAMENTO:*\n` +
    `${paymentInfo}\n\n` +
    `Aguardando confirmação do pedido! ✨`;

  let cleanPhone = adminPhone.replace(/\D/g, '');
  if ((cleanPhone.length === 10 || cleanPhone.length === 11) && !cleanPhone.startsWith('55')) {
    cleanPhone = `55${cleanPhone}`;
  }

  const encoded = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

  return { whatsappUrl, messageText: message };
}
