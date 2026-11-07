import { NextRequest, NextResponse } from 'next/server';
import { getStoredProducts, setStoredProducts } from '@/lib/server-data';
import { Product } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const availableOnly = searchParams.get('available_only') === 'true';
  const skip = parseInt(searchParams.get('skip') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let products = getStoredProducts().filter((p) => p.is_active);

  if (category) {
    products = products.filter((p) =>
      p.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  if (search) {
    const s = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s)
    );
  }

  if (availableOnly) {
    products = products.filter((p) => p.stock_quantity > 0);
  }

  const total = products.length;
  const paginated = products.slice(skip, skip + limit);

  return NextResponse.json({ products: paginated, total });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const products = getStoredProducts();

    const newProduct: Product = {
      id: Date.now(),
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      category: body.category,
      stock_quantity: parseInt(body.stock_quantity, 10),
      image_url: body.image_url || null,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    products.unshift(newProduct);
    setStoredProducts(products);

    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json(
      { detail: 'Erro ao criar produto' },
      { status: 400 }
    );
  }
}
