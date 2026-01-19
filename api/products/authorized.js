const { getToken, updateToken } = require('../lib/supabase.js');

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

module.exports = async function handler(req, res) {
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
    const sellerId = token.seller_id;

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

    // Fetch all item IDs with pagination
    let allItemIds = [];
    let offset = 0;
    const limit = 50;
    let total = 0;

    // First request to get total
    const firstResponse = await fetch(`${ML_API_BASE}/users/${sellerId}/items/search?status=active&limit=${limit}&offset=0`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!firstResponse.ok) {
      const error = await firstResponse.text();
      return res.status(firstResponse.status).json({ error: 'Erro ao buscar produtos', details: error });
    }

    const firstData = await firstResponse.json();
    total = firstData.paging?.total || 0;
    allItemIds = firstData.results || [];

    // Fetch remaining pages if needed (up to 200 items max)
    while (allItemIds.length < total && allItemIds.length < 200) {
      offset += limit;
      const pageResponse = await fetch(`${ML_API_BASE}/users/${sellerId}/items/search?status=active&limit=${limit}&offset=${offset}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (pageResponse.ok) {
        const pageData = await pageResponse.json();
        allItemIds = allItemIds.concat(pageData.results || []);
      } else {
        break;
      }
    }

    // Fetch product details in batches of 20
    const allProducts = [];
    for (let i = 0; i < allItemIds.length; i += 20) {
      const batch = allItemIds.slice(i, i + 20);
      const itemsResponse = await fetch(`${ML_API_BASE}/items?ids=${batch.join(',')}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        allProducts.push(...itemsData.map(item => item.body).filter(Boolean));
      }
    }

    res.json({
      total: total,
      fetched: allProducts.length,
      results: allProducts,
    });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Erro interno', message: error.message });
  }
};
