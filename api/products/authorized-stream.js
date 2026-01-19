const { getToken, updateToken } = require('../lib/supabase.js');

const ML_API_BASE = 'https://api.mercadolibre.com';
const BATCH_SIZE = 100; // Products per batch

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
  res.setHeader('Content-Type', 'application/json');

  const batch = parseInt(req.query.batch || '0');
  const batchSize = parseInt(req.query.batchSize || BATCH_SIZE.toString());

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

    // Get total count (cached or fetch)
    // For now, we'll fetch a batch of item IDs
    const limit = 50;
    const offset = batch * batchSize;
    
    // Fetch item IDs for this batch
    const searchResponse = await fetch(`${ML_API_BASE}/users/${sellerId}/items/search?status=active&limit=${limit}&offset=${offset}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      return res.status(searchResponse.status).json({ error: 'Erro ao buscar produtos', details: error });
    }

    const searchData = await searchResponse.json();
    const total = searchData.paging?.total || 0;
    const itemIds = searchData.results || [];

    // Fetch product details for this batch
    const products = [];
    for (let i = 0; i < itemIds.length && i < batchSize; i += 20) {
      const batch = itemIds.slice(i, i + 20);
      const itemsResponse = await fetch(`${ML_API_BASE}/items?ids=${batch.join(',')}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        products.push(...itemsData.map(item => item.body).filter(Boolean));
      }
    }

    res.json({
      batch: batch,
      batchSize: batchSize,
      total: total,
      fetched: products.length,
      hasMore: offset + products.length < total,
      results: products,
    });
  } catch (error) {
    console.error('Products stream error:', error);
    res.status(500).json({ error: 'Erro interno', message: error.message });
  }
};
