import { NextResponse } from 'next/server';
import { getStoredProducts } from '@/lib/server-data';

export async function GET() {
  const products = getStoredProducts().filter((p) => p.is_active);
  const categories = Array.from(new Set(products.map((p) => p.category))).sort();
  return NextResponse.json(categories);
}
