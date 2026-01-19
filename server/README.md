# Backend Server - RETROPARTS

Servidor backend para integração com a API do Mercado Livre usando OAuth.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente criando um arquivo `.env` na pasta `server/`:

```env
ML_CLIENT_ID=8791609677471815
ML_CLIENT_SECRET=Esht83fxcWv22wLOpteQunGOksD1taaY
ML_SELLER_ID=260093601
PORT=3001
```

3. Inicie o servidor:

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

O servidor estará rodando em `http://localhost:3001`

## Endpoints

- `GET /health` - Health check
- `GET /api/products` - Buscar produtos com paginação
  - Query params: `limit`, `offset`, `sort`
- `GET /api/products/all` - Buscar todos os produtos (com paginação automática)

## Como funciona

O servidor:
1. Obtém um access token usando OAuth Client Credentials
2. Cacheia o token (renova automaticamente quando expira)
3. Faz requisições autenticadas à API do Mercado Livre
4. Retorna os produtos para o frontend
