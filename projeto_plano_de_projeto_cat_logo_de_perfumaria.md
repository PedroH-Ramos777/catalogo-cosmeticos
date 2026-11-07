# Plano de Projeto: Catálogo Digital de Perfumaria e Cosméticos (via WhatsApp)

## 1. Visão Geral do Projeto

O **Catálogo Express de Cosméticos** é uma evolução do nosso conceito anterior de pedidos via WhatsApp. A ferramenta foi desenhada para consultores independentes, revendedores (marcas como Natura, Avon, Jequiti, Mary Kay) e pequenas lojas de perfumaria que desejam profissionalizar suas vendas nas redes sociais sem a complexidade de um e-commerce tradicional com gateway de pagamento integrado.

O objetivo é permitir que o lojista crie seu catálogo de forma simples, gere um link exclusivo para fixar nas redes sociais (Instagram, TikTok, Bio) ou enviar diretamente para clientes, e receba os pedidos organizados e prontos para fechamento via WhatsApp.

---

## 2. Principais Funcionalidades

### A. Área Administrativa (Gestão do Lojista)
* **Gestão de Produtos (CRUD Completo):**
  * Cadastro de nome do produto, descrição detalhada, preço e categoria (ex: Perfumes, Hidratantes, Maquiagem).
  * Upload/Link de foto do produto.
  * Controle de quantidade em estoque (com alerta visual quando o estoque estiver baixo).
* **Geração e Compartilhamento de Link:**
  * Um botão rápido para copiar o link personalizado da vitrine/catálogo do lojista.
  * Instruções fáceis para fixar o link na bio do Instagram ou status do WhatsApp.
* **Gestão de Pedidos (Visualização):**
  * Painel opcional para acompanhar os pedidos que foram encaminhados para o WhatsApp.

### B. Área do Cliente (Vitrine e Checkout)
* **Navegação Fluida no Catálogo:**
  * Visualização em grade (cards) otimizada para dispositivos móveis (smartphones).
  * Filtros por categoria e busca por nome.
  * Indicador de disponibilidade em estoque para cada item.
* **Carrinho de Compras Interativo:**
  * Adição e remoção de itens com atualização em tempo real do valor total.
* **Checkout Simplificado:**
  * Preenchimento de dados de entrega (Endereço, Bairro, Número, Complemento).
  * Seleção do **método de pagamento** (Pix, Dinheiro, Cartão de Crédito/Débito).
  * Seleção do **número de parcelas** (caso aplicável para cartão).
* **Integração com WhatsApp:**
  * Ao finalizar, o sistema formata automaticamente uma mensagem estruturada contendo o resumo dos produtos, valor total, endereço de entrega e opção de pagamento escolhida, abrindo direto o chat do WhatsApp do administrador com o pedido pronto para envio.

---

## 3. Especificação Detalhada do Backend (FastAPI)

### A. Estrutura de Pastas Sugerida

```text
backend/
├── app/
│   ├── main.py              # Instância do FastAPI e inclusão das rotas
│   ├── database.py          # Configuração da conexão com o banco de dados (SQLAlchemy)
│   ├── models/              # Modelos de Tabelas do Banco (ORMs)
│   │   └── product.py
│   ├── schemas/             # Schemas de Validação e DTOs (Pydantic)
│   │   ├── product.py
│   │   └── order.py
│   ├── routers/             # Endpoints / Controladores de Rotas
│   │   ├── products.py
│   │   └── orders.py
│   └── utils/              # Funções utilitárias (gerador de link WhatsApp, etc.)
│       └── whatsapp.py
└── requirements.txt
```

---

### B. Modelagem de Dados (Schemas Pydantic)

#### 1. Schema do Produto (`app/schemas/product.py`)

```python
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional

class ProductBase(BaseModel):
    name: str = Field(..., example="Perfume Essencial Natura 100ml")
    description: str = Field(..., example="Fragrância amadeirada intensa com toques de especiarias.")
    price: float = Field(..., gt=0, example=189.90)
    category: str = Field(..., example="Perfumes")
    image_url: Optional[str] = Field(None, example="https://exemplo.com/imagem.jpg")
    stock_quantity: int = Field(..., ge=0, example=15)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
```

#### 2. Schema do Pedido & Comanda (`app/schemas/order.py`)

```python
from pydantic import BaseModel, Field
from typing import List, Optional

class OrderItem(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    customer_name: str = Field(..., example="Maria Silva")
    customer_phone: str = Field(..., example="83999998888")
    street: str = Field(..., example="Rua das Flores")
    number: str = Field(..., example="123")
    neighborhood: str = Field(..., example="Centro")
    complement: Optional[str] = Field(None, example="Apto 101")
    payment_method: str = Field(..., example="Cartão de Crédito") # Pix, Dinheiro, Cartão de Crédito
    installments: Optional[int] = Field(1, ge=1, le=12, example=3) # Número de parcelas
    items: List[OrderItem]

class WhatsAppLinkResponse(BaseModel):
    whatsapp_url: str
    message_text: str
```

---

### C. Definição dos Endpoints do Backend

#### 1. Rotas de Produtos (`/api/v1/products`)

* **`POST /api/v1/products/`**
  * **Descrição:** Cadastra um novo produto na perfumaria.
  * **Acesso:** Área do Administrador.
  * **Validação:** Checa se preço > 0 e estoque >= 0.

* **`GET /api/v1/products/`**
  * **Descrição:** Lista os produtos cadastrados (com suporte a filtro por categoria e parâmetro `available_only=true` para ocultar itens fora de estoque no catálogo do cliente).
  * **Acesso:** Público (Vitrine do Cliente) e Adm.

* **`GET /api/v1/products/{product_id}`**
  * **Descrição:** Retorna os detalhes de um produto específico.

* **`PUT /api/v1/products/{product_id}`**
  * **Descrição:** Atualiza dados do produto (ex: ajustar preço, foto ou repor estoque).

* **`DELETE /api/v1/products/{product_id}`**
  * **Descrição:** Desativa/Remove o produto da vitrine.

---

#### 2. Rotas de Checkout e Integração com WhatsApp (`/api/v1/orders`)

* **`POST /api/v1/orders/checkout`**
  * **Descrição:** Recebe os dados do carrinho do cliente, decrementa automaticamente o estoque dos produtos no banco de dados e gera a URL formatada do WhatsApp com a comanda de entrega.
  * **Retorno:** Estrutura pronta com o link oficial do WhatsApp (`https://wa.me/55...`).

---

### D. Lógica de Geração da Comanda para o WhatsApp (`app/utils/whatsapp.py`)

Abaixo está o módulo que compõe o texto formatado para envio direto ao vendedor:

```python
import urllib.parse

def generate_whatsapp_link(admin_phone: str, order_data: dict, items_detail: list, total_price: float) -> str:
    """
    Gera a mensagem formatada para envio da comanda via WhatsApp.
    """
    items_text = ""
    for item in items_detail:
        items_text += f"• {item['quantity']}x {item['name']} - R$ {item['subtotal']:.2f}\n"

    payment_info = order_data['payment_method']
    if order_data['payment_method'] == "Cartão de Crédito" and order_data.get('installments'):
        payment_info += f" ({order_data['installments']}x)"

    message = (
        f"🛍️ *NOVO PEDIDO DE PERFUMARIA*\n\n"
        f"👤 *Cliente:* {order_data['customer_name']}\n"
        f"📱 *Telefone:* {order_data['customer_phone']}\n\n"
        f"📦 *ITENS DO PEDIDO:*\n"
        f"{items_text}\n"
        f"💰 *Total:* R$ {total_price:.2f}\n\n"
        f"📍 *ENDEREÇO DE ENTREGA:*\n"
        f"Endereço: {order_data['street']}, Nº {order_data['number']}\n"
        f"Bairro: {order_data['neighborhood']}\n"
        f"Complemento: {order_data.get('complement', 'Nenhum')}\n\n"
        f"💳 *FORMA DE PAGAMENTO:*\n"
        f"{payment_info}\n\n"
        f"Aguardando confirmação do pedido! ✨"
    )

    encoded_message = urllib.parse.quote(message)
    return f"https://wa.me/{admin_phone}?text={encoded_message}"
```

---

## 4. Sugestão de Arquitetura Tecnológica

* **Backend:** **FastAPI (Python)** — Leve, rápido, com documentação automática (Swagger UI) e validações robustas com Pydantic.
* **Frontend:** **React / Next.js com Tailwind CSS** — Interface moderna, altamente responsiva (mobile-first).
* **Banco de Dados:** **SQLite ou PostgreSQL** — Com SQLAlchemy (ORM) para persistência segura dos dados e estoque.

---

## 5. Fases de Desenvolvimento (Cronograma Sugerido)

1. **Fase 1: Configuração do FastAPI e Banco de Dados**
   * Configurar a estrutura base do projeto, modelos Pydantic e conexão SQLAlchemy.
2. **Fase 2: Rotas de CRUD de Produtos (Área Adm)**
   * Implementar o cadastro de produtos e rotas de atualização de estoque.
3. **Fase 3: Lógica de Checkout e Comanda WhatsApp**
   * Desenvolver o endpoint de checkout, baixa automática de estoque e gerador de link do WhatsApp.
4. **Fase 4: Frontend React & Integração**
   * Construção das telas da vitrine e da área do administrador para gerenciamento e cópia do link do catálogo.