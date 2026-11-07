import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '@/lib/server-data';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return NextResponse.json({
        access_token: `admin_token_${Date.now()}`,
        token_type: 'bearer',
      });
    }

    return NextResponse.json(
      { detail: 'Usuário ou senha incorretos' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { detail: 'Erro ao autenticar' },
      { status: 400 }
    );
  }
}
