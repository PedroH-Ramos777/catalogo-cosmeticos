import { NextResponse } from 'next/server';
import { getStoredOrders } from '@/lib/server-data';

export async function GET() {
  const orders = getStoredOrders();
  return NextResponse.json(orders);
}
