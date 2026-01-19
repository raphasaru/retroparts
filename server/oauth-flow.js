// Implementação do Authorization Code Flow para o Mercado Livre
// Este fluxo permite que o vendedor autorize sua aplicação a acessar os produtos dele

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// URLs da API do Mercado Livre
const ML_API_BASE = 'https://api.mercadolibre.com';
// URL de autenticação para Brasil (IMPORTANTE: diferente da API)
const ML_AUTH_URL = 'https://auth.mercadolivre.com.br';

const CLIENT_ID = process.env.ML_CLIENT_ID;
const CLIENT_SECRET = process.env.ML_CLIENT_SECRET;
// Usa a mesma porta que o servidor está rodando
const PORT = process.env.PORT || 3001;
const REDIRECT_URI = process.env.REDIRECT_URI || `http://localhost:${PORT}/oauth/callback`;

// Armazenar tokens (em produção, use um banco de dados)
let userAccessToken = null;
let userRefreshToken = null;
let tokenExpiresAt = null;
let authorizedUserId = null;

// Passo 1: Gerar URL de autorização
app.get('/oauth/authorize', (req, res) => {
  // URL correta para Brasil: auth.mercadolivre.com.br
  const authUrl = new URL(`${ML_AUTH_URL}/authorization`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  
  res.json({
    message: 'Acesse esta URL para autorizar a aplicação:',
    url: authUrl.toString(),
    redirect_uri_configured: REDIRECT_URI,
    instructions: [
      '1. O vendedor deve acessar a URL acima',
      '2. Fazer login na conta do Mercado Livre',
      '3. Autorizar a aplicação',
      '4. Será redirecionado de volta com um código',
      '5. O código será trocado por um access_token'
    ],
    important: 'Certifique-se de que o redirect_uri está configurado no DevCenter do ML!'
  });
});

// Passo 2: Callback - receber o código e trocar por token
app.get('/oauth/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({ error: 'Autorização negada', details: error });
  }

  if (!code) {
    return res.status(400).json({ error: 'Código de autorização não fornecido' });
  }

  try {
    // Trocar código por token
    const tokenResponse = await fetch(`${ML_API_BASE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      return res.status(400).json({ error: 'Erro ao obter token', details: error });
    }

    const tokenData = await tokenResponse.json();
    
    // Salvar tokens
    userAccessToken = tokenData.access_token;
    userRefreshToken = tokenData.refresh_token;
    tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000);
    authorizedUserId = tokenData.user_id;

    console.log('✅ Token obtido com sucesso!');
    console.log('   User ID:', tokenData.user_id);

    // Obter informações do usuário
    const userResponse = await fetch(`${ML_API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${userAccessToken}`,
      },
    });

    const userData = await userResponse.json();

    // Retornar página HTML bonita de sucesso
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Autorização Concluída</title>
        <style>
          body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; }
          .info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; }
          code { background: #e9ecef; padding: 2px 6px; border-radius: 4px; }
          h1 { color: #28a745; }
        </style>
      </head>
      <body>
        <div class="success">
          <h1>✅ Autorização Concluída!</h1>
          <p><strong>Usuário:</strong> ${userData.nickname || 'N/A'}</p>
          <p><strong>ID:</strong> ${userData.id}</p>
          <p><strong>Token expira em:</strong> ${Math.round(tokenData.expires_in / 3600)} horas</p>
        </div>
        <div class="info">
          <h3>Próximos passos:</h3>
          <p>Agora você pode buscar os produtos usando:</p>
          <p><code>GET /api/products/authorized</code></p>
          <p>Ou acesse: <a href="/api/products/authorized">/api/products/authorized</a></p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno', message: error.message });
  }
});

// Função para renovar token se necessário
async function ensureValidToken() {
  if (!userAccessToken) {
    throw new Error('Nenhum usuário autorizado');
  }

  // Verificar se token expirou (com margem de 5 minutos)
  if (Date.now() >= (tokenExpiresAt - 300000)) {
    if (!userRefreshToken) {
      throw new Error('Token expirado e sem refresh token');
    }

    console.log('🔄 Renovando token...');
    const refreshResponse = await fetch(`${ML_API_BASE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: userRefreshToken,
      }),
    });

    if (!refreshResponse.ok) {
      throw new Error('Erro ao renovar token');
    }

    const tokenData = await refreshResponse.json();
    userAccessToken = tokenData.access_token;
    userRefreshToken = tokenData.refresh_token;
    tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000);
    console.log('✅ Token renovado com sucesso');
  }

  return userAccessToken;
}

// Passo 3: Buscar produtos usando o token do usuário autorizado
app.get('/api/products/authorized', async (req, res) => {
  try {
    const token = await ensureValidToken();
    console.log('🔍 Buscando produtos do usuário autorizado...');

    // Primeiro, buscar lista de IDs dos produtos
    const allItemIds = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore && offset < 1000) {
      const searchResponse = await fetch(
        `${ML_API_BASE}/users/me/items/search?status=active&limit=${limit}&offset=${offset}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!searchResponse.ok) {
        const error = await searchResponse.text();
        console.error('Erro na busca:', error);
        break;
      }

      const searchData = await searchResponse.json();
      allItemIds.push(...(searchData.results || []));
      
      const total = searchData.paging?.total || 0;
      offset += limit;
      hasMore = offset < total;

      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`📦 Encontrados ${allItemIds.length} IDs de produtos`);

    if (allItemIds.length === 0) {
      return res.json({ results: [], total: 0 });
    }

    // Buscar detalhes dos produtos em lotes de 20
    const allProducts = [];
    for (let i = 0; i < allItemIds.length; i += 20) {
      const batchIds = allItemIds.slice(i, i + 20);
      const itemsResponse = await fetch(
        `${ML_API_BASE}/items?ids=${batchIds.join(',')}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        // A resposta é um array de {code, body}
        for (const item of itemsData) {
          if (item.code === 200 && item.body) {
            allProducts.push(item.body);
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Retornando ${allProducts.length} produtos com detalhes`);

    res.json({
      results: allProducts,
      total: allProducts.length,
    });
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.message.includes('Nenhum usuário autorizado')) {
      return res.status(401).json({
        error: 'Nenhum usuário autorizado',
        message: 'Acesse /oauth/authorize primeiro para autorizar a aplicação',
        authorize_url: '/oauth/authorize'
      });
    }

    res.status(500).json({ error: 'Erro interno', message: error.message });
  }
});

// Status da autorização
app.get('/oauth/status', (req, res) => {
  res.json({
    authorized: !!userAccessToken,
    token_expires_at: tokenExpiresAt ? new Date(tokenExpiresAt).toISOString() : null,
    has_refresh_token: !!userRefreshToken,
  });
});

app.listen(PORT, () => {
  console.log(`🔐 OAuth Server rodando em http://localhost:${PORT}`);
  console.log(`\n📋 Para autorizar:`);
  console.log(`   1. Acesse: http://localhost:${PORT}/oauth/authorize`);
  console.log(`   2. Use a URL retornada para autorizar`);
  console.log(`   3. Após autorizar, use: http://localhost:${PORT}/api/products/authorized`);
});
