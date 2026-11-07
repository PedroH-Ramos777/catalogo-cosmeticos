# 🛍️ Catálogo Express de Cosméticos & Perfumaria (via WhatsApp)

Aplicação completa desenvolvida para consultores independentes, revendedores de marcas (Natura, Avon, Boticário, Jequiti, Mary Kay) e pequenas lojas que desejam profissionalizar suas vendas nas redes sociais sem a complexidade de um e-commerce tradicional com gateway de pagamento integrado.

---

## 🚀 Como Iniciar o Projeto com 1 Clique

Na raiz do projeto, clique duas vezes no arquivo:
* **`iniciar_tudo.bat`**: Inicia o Backend (porta 8000) e o Frontend (porta 3000) automaticamente em duas janelas.

Ou inicie separadamente:
1. **`iniciar_backend.bat`** → Roda o servidor FastAPI em `http://127.0.0.1:8000`
2. **`iniciar_frontend.bat`** → Roda o servidor Next.js em `http://localhost:3000`

---

## 🌐 Links de Acesso

* **Vitrine do Cliente (Loja):** [http://localhost:3000](http://localhost:3000)
* **Painel Administrativo do Lojista:** [http://localhost:3000/admin](http://localhost:3000/admin)
* **Documentação Interativa da API (Swagger UI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🔑 Credenciais Padrão do Administrador

* **Usuário:** `admin`
* **Senha:** `admin123`
* *(Você pode alterar o usuário, senha e número do WhatsApp no arquivo `backend/.env`)*

---

## ✨ Funcionalidades Entregues

### 1. Vitrine do Cliente (`/`)
* **Design Mobile-First:** Otimizado para smartphones, navegadores do Instagram e TikTok.
* **Filtros e Busca em Tempo Real:** Pesquise pelo nome do produto e filtre por categorias (Perfumes, Hidratantes, Maquiagem, Cuidados Capilares, Cuidados Corporais).
* **Filtro de Disponibilidade:** Exibe apenas itens com estoque positivo.
* **Sacola de Compras Interativa:** Adicione itens, ajuste quantidades respeitando o estoque e veja o subtotal atualizado instantaneamente.
* **Checkout Descomplicado:**
  * Preenchimento de endereço de entrega (Rua, Número, Bairro, Complemento).
  * Seleção da forma de pagamento: **Pix**, **Dinheiro**, **Cartão de Crédito** (com seletor de parcelas de 1x a 12x) e **Cartão de Débito**.
* **Integração com WhatsApp:** Ao clicar em finalizar, o backend decrementa o estoque dos produtos no banco de dados, registra o pedido e redireciona direto para o chat do WhatsApp com a mensagem formatada contendo o resumo dos produtos, total e endereço.

### 2. Painel do Lojista (`/admin`)
* **Autenticação Segura:** Login protegido via JWT (JSON Web Tokens).
* **Cards de Indicadores (Métricas):**
  * Total de produtos cadastrados
  * Alerta de estoque baixo (itens com 5 ou menos unidades)
  * Valor total acumulado do estoque em R$
  * Histórico de pedidos enviados
* **Gestão de Produtos (CRUD Completo):**
  * Cadastro de novos produtos com foto, preço, categoria e estoque.
  * Edição de produtos existentes.
  * Desativação (soft delete) com 1 clique.
* **Botão "Copiar Link da Vitrine":** Copia a URL do catálogo com feedback visual para colar na bio do Instagram ou enviar em listas de transmissão.
* **Histórico de Pedidos:** Acompanhamento de todas as comandas geradas, com botão direto para reabrir a conversa no WhatsApp.

---

## 🛠️ Tecnologias Utilizadas

### Backend
* **FastAPI 0.115:** Framework web assíncrono e veloz em Python.
* **SQLAlchemy 2.0:** Mapeamento objeto-relacional (ORM) moderno.
* **SQLite:** Banco de dados relacional leve e sem configuração de servidor.
* **Pydantic v2:** Validação rigorosa de tipos e esquemas de dados.
* **Bcrypt & Python-Jose:** Hashing seguro de senhas e geração de tokens JWT.

### Frontend
* **Next.js 16 (App Router):** Framework React moderno com renderização rápida.
* **Tailwind CSS v4:** Estilização com design system responsivo e elegante.
* **Zustand:** Gerenciamento do estado global do carrinho com persistência em `localStorage`.
* **Lucide React:** Conjunto moderno de ícones vetoriais.

---

## 🧪 Testes Automatizados

O backend possui uma suíte completa com **12 testes automatizados** cobrindo:
1. Health Check
2. Listagem de produtos
3. Filtragem por categoria
4. Busca por nome
5. Listagem de categorias únicas
6. Login de administrador (JWT)
7. Criação autenticada de produto
8. Atualização de produto
9. Bloqueio de rotas protegidas sem token
10. Checkout completo com geração de comanda WhatsApp
11. Baixa atômica de estoque
12. Soft-delete de produtos

Para rodar os testes a qualquer momento:
```bash
cd backend
.\venv\Scripts\python.exe -u test_backend.py
```

