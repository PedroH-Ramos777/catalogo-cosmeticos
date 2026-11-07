"""Ponto de entrada da aplicação FastAPI — Catálogo Digital de Perfumaria."""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from app.routers import products, orders, auth
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.STORE_NAME,
    description=(
        "API do Catálogo Digital de Perfumaria e Cosméticos "
        "— Pedidos via WhatsApp"
    ),
    version="1.0.0",
)

# Montar pasta estática para servir fotos enviadas
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
os.makedirs(os.path.join(static_dir, "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# CORS — permitir acesso de origens locais, rede Wi-Fi (mobile) e deploys (Vercel, Render)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|.*\.vercel\.app|.*\.onrender\.com)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(auth.router)


@app.on_event("startup")
def on_startup():
    """Cria as tabelas do banco de dados e popula produtos iniciais se vazio."""
    init_db()
    try:
        from app.seed import seed_database
        seed_database()
    except Exception as e:
        print(f"Aviso ao verificar seed: {e}")


@app.get("/", tags=["Status"])
def root():
    """Health check e informações básicas da API."""
    return {
        "status": "online",
        "store": settings.STORE_NAME,
        "docs": "/docs",
        "version": "1.0.0",
    }
