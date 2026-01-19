# Integração com API do Mercado Livre

## ✅ O que foi implementado

1. **Backend Server** (`/server`)
   - Servidor Express.js com autenticação OAuth
   - Endpoints para buscar produtos do vendedor RETROPARTS
   - Cache automático de access tokens
   - Múltiplas estratégias de busca quando a API restringe acesso

2. **Frontend atualizado**
   - Serviço atualizado para usar o backend
   - Fallback automático para dados estáticos se o backend falhar

## 🚀 Como usar

### 1. Iniciar o backend

```bash
cd server
npm install
npm start
```

O servidor estará em `http://localhost:3001`

### 2. Iniciar o frontend

```bash
cd app
npm run dev
```

O frontend estará em `http://localhost:5174` (ou outra porta)

## ⚠️ Limitações da API do ML

A API do Mercado Livre **restringiu** a busca por `seller_id` mesmo com autenticação OAuth. O backend tenta:

1. **Estratégia 1**: Busca direta por seller_id (geralmente falha com 403)
2. **Estratégia 2**: Busca por categoria e filtra pelo seller (pode funcionar)

## 🔧 Soluções alternativas

Se a API continuar bloqueando, você pode:

1. **Usar dados estáticos**: O frontend já tem fallback com produtos reais
2. **Buscar por item_id individual**: Se você tiver uma lista de IDs dos produtos
3. **Web scraping**: Usar Puppeteer/Playwright (pode violar ToS do ML)
4. **API oficial do vendedor**: Se o vendedor tiver acesso à API própria do ML

## 📝 Credenciais configuradas

- **Client ID**: 8791609677471815
- **Secret Key**: (configurado no .env)
- **Seller ID**: 260093601 (RETROPARTS)

## 🔐 Segurança

⚠️ **IMPORTANTE**: O arquivo `.env` contém credenciais sensíveis. Nunca commite ele no Git!

O arquivo `.gitignore` já está configurado para ignorar `.env`.
