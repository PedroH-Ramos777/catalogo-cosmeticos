# Guia de Deploy Gratuito em Produção — Vercel + Render

Este guia ensina como colocar seu **Catálogo de Cosméticos com tema iOS Liquid Glass** no ar na internet de forma 100% gratuita, com HTTPS seguro, CDN rápida e pedidos via WhatsApp funcionando em qualquer smartphone no Brasil.

---

## 📌 Visão Geral da Arquitetura de Deploy

- **Frontend (Vitrine do Cliente + Painel Admin)**: Hospedado na **[Vercel](https://vercel.com)** (Next.js 16 + Tailwind CSS).
- **Backend (API REST + Banco SQLite + WhatsApp)**: Hospedado no **[Render](https://render.com)** (FastAPI + Uvicorn).

---

## Passo 1: Subir o Código para o seu GitHub

O repositório Git local já está inicializado e com o commit pronto! Agora só precisamos enviar para a sua conta do GitHub:

1. Acesse **[github.com/new](https://github.com/new)** no seu navegador.
2. Crie um novo repositório com o nome: `catalogo-cosmeticos` (pode ser Público ou Privado).
3. No seu terminal (ou PowerShell na pasta do projeto), rode os comandos:
   ```bash
   git remote add origin https://github.com/PedroH-Ramos777/catalogo-cosmeticos.git
   git push -u origin main
   ```
*(Se você já usa autenticação via SSH ou token pessoal, o push será imediato).*

---

## Passo 2: Publicar o Backend no Render (Grátis)

1. Acesse **[render.com](https://render.com)** e faça login com sua conta do GitHub.
2. No painel, clique em **New +** no canto superior direito e selecione **Web Service**.
3. Selecione o repositório `catalogo-cosmeticos` que você acabou de subir.
4. Preencha as configurações conforme abaixo:
   - **Name**: `catalogo-cosmeticos-api` (ou outro nome de sua preferência)
   - **Region**: Qualquer uma (ex: *Ohio (US East)* ou *Frankfurt*)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python -m app.seed`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Em **Environment Variables** (Variáveis de Ambiente), adicione:
   - `SECRET_KEY`: `sua-chave-super-secreta-producao-2026`
   - `ADMIN_PHONE`: `5583994159831`
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: `admin123` (ou a senha que preferir)
   - `STORE_NAME`: `Catálogo Express Cosméticos`
   - `DATABASE_URL`: `sqlite:///./catalogo.db`
6. Clique no botão **Deploy Web Service**.
7. Aguarde 2 minutos. Quando o status mudar para **Live**, copie a URL gerada no topo da página.
   - Exemplo: `https://catalogo-cosmeticos-api.onrender.com`

---

## Passo 3: Publicar o Frontend na Vercel (Grátis)

1. Acesse **[vercel.com](https://vercel.com)** e faça login com seu GitHub.
2. Clique em **Add New...** -> **Project**.
3. Localize e clique em **Import** no repositório `catalogo-cosmeticos`.
4. Na tela de configuração de importação:
   - **Framework Preset**: Deixe selecionado *Next.js*.
   - **Root Directory**: Clique no botão **Edit** e selecione a pasta **`frontend`**, depois clique em **Continue**.
5. Abra a seção **Environment Variables** e adicione:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://catalogo-cosmeticos-api.onrender.com/api/v1` *(substitua pela URL real que o Render gerou no Passo 2, terminando com `/api/v1`)*.
6. Clique no botão **Deploy**!
7. Em cerca de 1 minuto, a Vercel finalizará a compilação e apresentará a tela de comemoração com seu domínio público!
   - Exemplo: `https://catalogo-cosmeticos.vercel.app`

---

## Passo 4: Testando a Usabilidade no Celular

1. Abra o link gerado pela Vercel no **Safari** (se estiver usando iPhone) ou no **Chrome** (se estiver no Android).
2. **Experiência de App Nativo (PWA)**:
   - No iPhone: toque no ícone de **Compartilhar** (quadrado com seta) -> **Adicionar à Tela de Início**.
   - No Android: toque nos três pontinhos -> **Adicionar à Tela Inicial / Instalar Aplicativo**.
3. O catálogo abrirá sem barra de navegação, com as cores roxas luxuosas, refração de vidro líquido (*liquid glass*), dock inferior dinâmico e gaveta deslizante estilo iOS.
4. Faça um pedido de teste e clique em **Enviar Pedido via WhatsApp**:
   - O WhatsApp abrirá direto na conversa com o número **`+55 (83) 99415-9831`** com a comanda formatada, itens, totais, parcelamento e endereço!
5. Para acessar o painel administrativo de qualquer celular ou computador, basta acessar:
   `https://sua-url-na-vercel.app/admin` (usuário: `admin` | senha definida no Render).
