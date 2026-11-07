export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string | null;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface OrderCreate {
  customer_name: string;
  customer_phone: string;
  street: string;
  number: string;
  neighborhood: string;
  complement?: string | null;
  payment_method: 'Pix' | 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito';
  installments?: number;
  items: OrderItemCreate[];
}

export interface OrderItemResponse {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  customer_name: string;
  customer_phone: string;
  street: string;
  number: string;
  neighborhood: string;
  complement?: string | null;
  payment_method: string;
  installments: number;
  total_price: number;
  whatsapp_url?: string | null;
  items: OrderItemResponse[];
  created_at: string;
}

export interface CheckoutResponse {
  order: OrderResponse;
  whatsapp_url: string;
  message_text: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

