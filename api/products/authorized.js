import { getToken, updateToken } from '../lib/supabase.js';

const ML_API_BASE = 'https://api.mercadolibre.com';

async function refreshToken(token) {
  const CLIENT_ID = process.env.ML_CLIENT_ID;
  const CLIENT_SECRET = process.env.ML_CLIENT_SECRET;

  const response = await fetch(`${ML_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: token.refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const tokenData = await response.json();
  await updateToken(token.seller_id, tokenData);

  return tokenData.access_token;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    let token = await getToken();

    if (!token) {
      return res.status(401).json({
        error: 'Nenhum usuário autorizado',
        message: 'Acesse /api/oauth/authorize primeiro'
      });
    }

    let accessToken = token.access_token;

    // Refresh token if expired
    if (token.expired && token.refresh_token) {
      try {
        accessToken = await refreshToken(token);
      } catch (error) {
        return res.status(401).json({
          error: 'Token expirado',
          message: 'Reautorize em /api/oauth/authorize'
        });
      }
    }

    // Fetch user's products
    const response = await fetch(`${ML_API_BASE}/users/me/items/search?status=active&limit=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error: 'Erro ao buscar produtos', details: error });
    }

    const data = await response.json();

    // Fetch product details
    if (data.results && data.results.length > 0) {
      const itemIds = data.results.slice(0, 20).join(',');
      const itemsResponse = await fetch(`${ML_API_BASE}/items?ids=${itemIds}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        return res.json({
          total: data.paging?.total || 0,
          results: itemsData.map(item => item.body).filter(Boolean),
        });
      }
    }

    res.json({
      total: data.paging?.total || 0,
      results: [],
      item_ids: data.results || [],
    });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Erro interno', message: error.message });
  }
}
