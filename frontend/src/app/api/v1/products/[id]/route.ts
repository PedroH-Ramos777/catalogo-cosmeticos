import { NextRequest, NextResponse } from 'next/server';
import { getStoredProducts, setStoredProducts } from '@/lib/server-data';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  const product = getStoredProducts().find((p) => p.id === productId);

  if (!product) {
    return NextResponse.json(
      { detail: 'Produto não encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return NextResponse.json(
      { detail: 'Produto não encontrado' },
      { status: 404 }
    );
  }

  const body = await request.json();
  const updated = {
    ...products[index],
    ...body,
    price: body.price !== undefined ? parseFloat(body.price) : products[index].price,
    stock_quantity:
      body.stock_quantity !== undefined
        ? parseInt(body.stock_quantity, 10)
        : products[index].stock_quantity,
    updated_at: new Date().toISOString(),
  };

  products[index] = updated;
  setStoredProducts(products);

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return NextResponse.json(
      { detail: 'Produto não encontrado' },
      { status: 404 }
    );
  }

  products[index].is_active = false;
  setStoredProducts(products);

  return NextResponse.json({ detail: 'Produto desativado com sucesso' });
}
