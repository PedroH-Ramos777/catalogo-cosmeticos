import {
  Product,
  ProductListResponse,
  OrderCreate,
  CheckoutResponse,
  LoginResponse,
  OrderResponse,
} from '@/types';

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return '/api/v1';
}

async function fetchWithFallback(endpoint: string, options?: RequestInit): Promise<Response> {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const primaryUrl = `${base}${endpoint}`;

  try {
    const res = await fetch(primaryUrl, options);
    if (res.ok) return res;

    // Se deu erro HTTP e a base era externa, tenta a rota interna do Next.js
    if (base !== '/api/v1' && typeof window !== 'undefined') {
      const fallbackUrl = `/api/v1${endpoint}`;
      const fallbackRes = await fetch(fallbackUrl, options);
      if (fallbackRes.ok) return fallbackRes;
    }
    return res;
  } catch (err) {
    // Se a conexão falhou totalmente (ex: backend offline) e era externo, tenta rota interna
    if (base !== '/api/v1' && typeof window !== 'undefined') {
      const fallbackUrl = `/api/v1${endpoint}`;
      return await fetch(fallbackUrl, options);
    }
    throw err;
  }
}

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  availableOnly?: boolean;
}): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.availableOnly) query.append('available_only', 'true');

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await fetchWithFallback(`/products${queryString}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Falha ao carregar produtos');
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetchWithFallback('/products/categories', {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Falha ao carregar categorias');
  return res.json();
}

export async function fetchProductById(id: number): Promise<Product> {
  const res = await fetchWithFallback(`/products/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Produto não encontrado');
  return res.json();
}

export async function createCheckout(order: OrderCreate): Promise<CheckoutResponse> {
  const res = await fetchWithFallback('/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Falha ao processar checkout');
  }
  return data;
}

export async function loginAdmin(username: string, password: string): Promise<LoginResponse> {
  const res = await fetchWithFallback('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Usuário ou senha incorretos');
  }
  return data;
}

export async function createProduct(
  product: Omit<Product, 'id' | 'is_active' | 'created_at' | 'updated_at'>,
  token: string
): Promise<Product> {
  const res = await fetchWithFallback('/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Erro ao criar produto');
  return data;
}

export async function updateProduct(
  id: number,
  product: Partial<Product>,
  token: string
): Promise<Product> {
  const res = await fetchWithFallback(`/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Erro ao atualizar produto');
  return data;
}

export async function uploadProductImage(file: File, token: string): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetchWithFallback('/products/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Falha no upload da imagem');
  return data;
}

export async function deleteProduct(id: number, token: string): Promise<void> {
  const res = await fetchWithFallback(`/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Erro ao desativar produto');
}

export async function fetchOrders(): Promise<OrderResponse[]> {
  const res = await fetchWithFallback('/orders', {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Falha ao carregar pedidos');
  return res.json();
}
