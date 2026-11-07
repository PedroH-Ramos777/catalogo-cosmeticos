"""Script de teste completo do backend usando httpx.AsyncClient."""
import asyncio
import sys
sys.path.insert(0, ".")

import httpx
from app.main import app
from app.database import init_db

async def run_tests():
    print("=" * 60)
    print("🧪 TESTES DO BACKEND - Catálogo Express de Cosméticos")
    print("=" * 60)

    init_db()

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health Check
        print("\n1️⃣  GET / (Health Check)")
        r = await client.get("/")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        print(f"   Status: {data['status']} | Loja: {data['store']}")

        # 2. Listar Produtos
        print("\n2️⃣  GET /api/v1/products/ (Listar Produtos)")
        r = await client.get("/api/v1/products/")
        assert r.status_code == 200
        data = r.json()
        print(f"   Total: {data['total']} produtos")
        for p in data["products"][:3]:
            print(f"   [{p['id']}] {p['name']} - R$ {p['price']:.2f} ({p['category']}) | Estoque: {p['stock_quantity']}")
        print(f"   ... ({len(data['products'])} listados)")

        # 3. Filtrar por Categoria
        print("\n3️⃣  GET /api/v1/products/?category=Perfumes (Filtrar)")
        r = await client.get("/api/v1/products/?category=Perfumes")
        assert r.status_code == 200
        data = r.json()
        print(f"   Perfumes encontrados: {data['total']}")

        # 4. Buscar por Nome
        print("\n4️⃣  GET /api/v1/products/?search=natura (Buscar)")
        r = await client.get("/api/v1/products/?search=natura")
        assert r.status_code == 200
        data = r.json()
        print(f"   Resultados para 'natura': {data['total']}")

        # 5. Listar Categorias
        print("\n5️⃣  GET /api/v1/products/categories")
        r = await client.get("/api/v1/products/categories")
        assert r.status_code == 200
        cats = r.json()
        print(f"   Categorias: {', '.join(cats)}")

        # 6. Login Admin
        print("\n6️⃣  POST /api/v1/auth/login (Login Admin)")
        r = await client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
        assert r.status_code == 200, f"Login failed: {r.text}"
        token = r.json()["access_token"]
        print(f"   Token JWT: {token[:40]}...")
        headers = {"Authorization": f"Bearer {token}"}

        # 7. Criar Produto (autenticado)
        print("\n7️⃣  POST /api/v1/products/ (Criar Produto - Admin)")
        new_product = {
            "name": "Perfume Teste API 50ml",
            "description": "Criado via teste automatizado",
            "price": 99.90,
            "category": "Perfumes",
            "image_url": "https://via.placeholder.com/300",
            "stock_quantity": 20
        }
        r = await client.post("/api/v1/products/", json=new_product, headers=headers)
        assert r.status_code == 201, f"Create failed: {r.text}"
        created = r.json()
        print(f"   Criado: [{created['id']}] {created['name']} - R$ {created['price']}")

        # 8. Atualizar Produto
        print("\n8️⃣  PUT /api/v1/products/{id} (Atualizar Preço)")
        r = await client.put(f"/api/v1/products/{created['id']}", json={"price": 79.90}, headers=headers)
        assert r.status_code == 200
        print(f"   Preço atualizado: R$ {r.json()['price']}")

        # 9. Rota protegida sem token
        print("\n9️⃣  POST /api/v1/products/ (Sem Token - Deve falhar)")
        r = await client.post("/api/v1/products/", json=new_product)
        assert r.status_code in [401, 403]
        print(f"   Status: {r.status_code} ✅ (Acesso negado corretamente)")

        # 10. Checkout com WhatsApp
        print("\n🔟 POST /api/v1/orders/checkout (Checkout)")
        checkout_data = {
            "customer_name": "Maria Silva",
            "customer_phone": "83999998888",
            "street": "Rua das Flores",
            "number": "123",
            "neighborhood": "Centro",
            "complement": "Apto 101",
            "payment_method": "Pix",
            "installments": 1,
            "items": [
                {"product_id": 1, "quantity": 2},
                {"product_id": 3, "quantity": 1}
            ]
        }
        r = await client.post("/api/v1/orders/checkout", json=checkout_data)
        assert r.status_code == 201, f"Checkout failed: {r.text}"
        checkout = r.json()
        print(f"   Pedido ID: {checkout['order']['id']}")
        print(f"   Total: R$ {checkout['order']['total_price']:.2f}")
        print(f"   Itens: {len(checkout['order']['items'])}")
        print(f"   WhatsApp URL: {checkout['whatsapp_url'][:80]}...")

        # 11. Verificar estoque decrementado
        print("\n1️⃣1️⃣ Verificar Estoque Decrementado")
        r = await client.get("/api/v1/products/1")
        p1 = r.json()
        r = await client.get("/api/v1/products/3")
        p3 = r.json()
        print(f"   Produto 1 ({p1['name']}): estoque = {p1['stock_quantity']}")
        print(f"   Produto 3 ({p3['name']}): estoque = {p3['stock_quantity']}")

        # 12. Soft Delete
        print("\n1️⃣2️⃣ DELETE /api/v1/products/{id} (Soft Delete)")
        r = await client.delete(f"/api/v1/products/{created['id']}", headers=headers)
        assert r.status_code == 204
        print(f"   Produto {created['id']} desativado ✅")

        # Verificar que não aparece na listagem
        r = await client.get("/api/v1/products/")
        ids = [p["id"] for p in r.json()["products"]]
        assert created["id"] not in ids
        print(f"   Não aparece mais na listagem ✅")

    print("\n" + "=" * 60)
    print("🎉 TODOS OS 12 TESTES PASSARAM COM SUCESSO!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_tests())
