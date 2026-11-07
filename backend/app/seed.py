"""
Script de seed — popula o banco com produtos de exemplo realistas.

Uso:
    cd backend
    python -m app.seed
"""

from app.database import SessionLocal, init_db
from app.models.product import Product

SAMPLE_PRODUCTS: list[dict] = [
    {
        "name": "Perfume Essencial Natura 100ml",
        "description": "Fragrância marcante e sofisticada com notas amadeiradas. Ideal para uso diário e ocasiões especiais.",
        "price": 189.90,
        "category": "Perfumes",
        "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80",
        "stock_quantity": 15,
    },
    {
        "name": "Hidratante Corporal TodoDia Natura 400ml",
        "description": "Hidratação intensa com manteiga de karité. Deixa a pele macia e perfumada por horas.",
        "price": 45.90,
        "category": "Hidratantes",
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
        "stock_quantity": 25,
    },
    {
        "name": "Base Líquida Vult HD 30ml",
        "description": "Cobertura média a alta com acabamento natural. Longa duração e proteção FPS 15.",
        "price": 39.90,
        "category": "Maquiagem",
        "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
        "stock_quantity": 20,
    },
    {
        "name": "Shampoo Reconstrutor SOS Cachos 300ml",
        "description": "Fórmula com queratina e óleo de coco para reconstrução capilar. Define e revitaliza os cachos.",
        "price": 32.90,
        "category": "Cuidados Capilares",
        "image_url": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80",
        "stock_quantity": 30,
    },
    {
        "name": "Desodorante Corporal Spray 150ml",
        "description": "Proteção e perfumação prolongada para o corpo todo. Fragrância revigorante e refrescante.",
        "price": 24.90,
        "category": "Cuidados Corporais",
        "image_url": "https://images.unsplash.com/photo-1608248597359-0027f6cfb5e1?w=600&auto=format&fit=crop&q=80",
        "stock_quantity": 28,
    },
    {
        "name": "Perfume Malbec Gold Boticário 100ml",
        "description": "Fragrância amadeirada com notas quentes de âmbar e café. Elegância e sofisticação pura.",
        "price": 269.90,
        "category": "Perfumes",
        "image_url": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80",
        "stock_quantity": 10,
    },
    {
        "name": "Creme Facial Hidratante Revitalizante 50g",
        "description": "Tratamento facial com ácido hialurônico e vitamina C. Nutre e renova o viço natural da pele.",
        "price": 119.90,
        "category": "Cuidados Corporais",
        "image_url": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80",
        "stock_quantity": 12,
    },
    {
        "name": "Batom Matte Avon Power Stay",
        "description": "Cor intensa com acabamento matte aveludado. Longa duração de até 16h sem borrar ou transferir.",
        "price": 29.90,
        "category": "Maquiagem",
        "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80",
        "stock_quantity": 22,
    },
    {
        "name": "Máscara Capilar Nutrição Intensa 300g",
        "description": "Hidratação profunda com óleo de argan e pantenol. Restaura fios danificados e ressecados.",
        "price": 42.90,
        "category": "Cuidados Capilares",
        "image_url": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80",
        "stock_quantity": 18,
    },
    {
        "name": "Colônia Floral Fresca 75ml",
        "description": "Fragrância leve e divertida com notas florais e frutais. Perfeita para o pós-banho e dias quentes.",
        "price": 89.90,
        "category": "Perfumes",
        "image_url": "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80",
        "stock_quantity": 14,
    },
]


def seed_database(force_update: bool = False):
    """Popula o banco com os produtos de exemplo ou atualiza fotos."""
    init_db()
    db = SessionLocal()
    try:
        existing_count = db.query(Product).count()
        if existing_count > 0 and not force_update:
            print(f"ℹ️ O banco já contém {existing_count} produtos cadastrados.")
            return

        if force_update:
            # Atualiza URLs dos produtos existentes
            for item in SAMPLE_PRODUCTS:
                prod = db.query(Product).filter(Product.name == item["name"]).first()
                if prod:
                    prod.image_url = item["image_url"]
                    prod.description = item["description"]
                    prod.price = item["price"]
                else:
                    db.add(Product(**item))
            db.commit()
            print("✅ Produtos atualizados com fotos em alta definição!")
            return

        for product_data in SAMPLE_PRODUCTS:
            product = Product(**product_data)
            db.add(product)

        db.commit()
        print(f"✅ Seed concluído! {len(SAMPLE_PRODUCTS)} produtos cadastrados com sucesso.")
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao popular banco de dados: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    force = "--force" in sys.argv
    seed_database(force_update=force)
