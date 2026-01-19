// Implementação do Authorization Code Flow para o Mercado Livre
// Este fluxo permite que o vendedor autorize sua aplicação a acessar os produtos dele

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const ML_API_BASE = 'https://api.mercadolibre.com';
const CLIENT_ID = process.env.ML_CLIENT_ID;
const CLIENT_SECRET = process.env.ML_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3001/oauth/callback';

// Armazenar tokens (em produção, use um banco de dados)
let userAccessToken = null;
let userRefreshToken = null;
let tokenExpiresAt = null;

// Passo 1: Gerar URL de autorização
app.get('/oauth/authorize', (req, res) => {
  const authUrl = new URL(`${ML_API_BASE}/authorization`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  // Escopos necessários para ler produtos
  authUrl.searchParams.set('scope', 'read');
  
  res.json({
    message: 'Acesse esta URL para autorizar a aplicação:',
    url: authUrl.toString(),
    instructions: [
      '1. O vendedor deve acessar a URL acima',
      '2. Fazer login na conta do Mercado Livre',
      '3. Autorizar a aplicação',
      '4. Será redirecionado de volta com um código',
      '5. O código será trocado por um access_token'
    ]
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

    // Obter informações do usuário
    const userResponse = await fetch(`${ML_API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${userAccessToken}`,
      },
    });

    const userData = await userResponse.json();

    res.json({
      success: true,
      message: 'Autorização concluída com sucesso!',
      user: {
        id: userData.id,
        nickname: userData.nickname,
      },
      token_expires_in: tokenData.expires_in,
      note: 'Agora você pode usar /api/products/authorized para buscar produtos'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno', message: error.message });
  }
});

// Passo 3: Buscar produtos usando o token do usuário autorizado
app.get('/api/products/authorized', async (req, res) => {
  if (!userAccessToken) {
    return res.status(401).json({
      error: 'Nenhum usuário autorizado',
      message: 'Acesse /oauth/authorize primeiro para autorizar a aplicação'
    });
  }

  // Verificar se token expirou
  if (Date.now() >= tokenExpiresAt) {
    if (!userRefreshToken) {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Reautorize a aplicação em /oauth/authorize'
      });
    }

    // Renovar token
    try {
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

      if (refreshResponse.ok) {
        const tokenData = await refreshResponse.json();
        userAccessToken = tokenData.access_token;
        userRefreshToken = tokenData.refresh_token;
        tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000);
      }
    } catch (error) {
      return res.status(401).json({ error: 'Erro ao renovar token', message: error.message });
    }
  }

  try {
    // Buscar produtos do usuário autorizado
    const response = await fetch(`${ML_API_BASE}/users/me/items/search?status=active&limit=50`, {
      headers: {
        'Authorization': `Bearer ${userAccessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error: 'Erro ao buscar produtos', details: error });
    }

    const data = await response.json();
    
    // Buscar detalhes dos produtos
    if (data.results && data.results.length > 0) {
      const itemsResponse = await fetch(`${ML_API_BASE}/items?ids=${data.results.slice(0, 20).join(',')}`, {
        headers: {
          'Authorization': `Bearer ${userAccessToken}`,
        },
      });

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        return res.json({
          total: data.paging?.total || 0,
          results: itemsData,
        });
      }
    }

    res.json({
      total: data.paging?.total || 0,
      results: [],
      item_ids: data.results || [],
    });
  } catch (error) {
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

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🔐 OAuth Server rodando em http://localhost:${PORT}`);
  console.log(`\n📋 Para autorizar:`);
  console.log(`   1. Acesse: http://localhost:${PORT}/oauth/authorize`);
  console.log(`   2. Use a URL retornada para autorizar`);
  console.log(`   3. Após autorizar, use: http://localhost:${PORT}/api/products/authorized`);
});
