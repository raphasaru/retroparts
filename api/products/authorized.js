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

    // Fetch remaining pages - ML API has a limit of ~1000-1050 results
    let attempts = 0;
    const maxAttempts = 100; // Safety limit
    const ML_PAGINATION_LIMIT = 1000; // Known ML API limit
    console.log(`📦 Total de produtos: ${total}, Primeira página: ${allItemIds.length}`);
    
    while (allItemIds.length < total && attempts < maxAttempts && allItemIds.length < ML_PAGINATION_LIMIT) {
      offset += limit;
      attempts++;
      const pageResponse = await fetch(`${ML_API_BASE}/users/${sellerId}/items/search?status=active&limit=${limit}&offset=${offset}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (pageResponse.ok) {
        const pageData = await pageResponse.json();
        const newIds = pageData.results || [];
        if (newIds.length === 0) break; // No more results
        allItemIds = allItemIds.concat(newIds);
        console.log(`📦 Página ${attempts + 1}: +${newIds.length} produtos (Total: ${allItemIds.length}/${total})`);
      } else {
        const errorText = await pageResponse.text();
        const errorData = JSON.parse(errorText);
        // If it's the pagination limit error, stop gracefully
        if (errorData.error === 'bad_request' && errorText.includes('Invalid limit and offset')) {
          console.warn(`⚠️ Limite de paginação da API atingido em ${allItemIds.length} produtos`);
          break;
        }
        console.error(`❌ Erro na página ${attempts + 1}:`, errorText);
        break;
      }
    }
    
    console.log(`✅ Total de IDs coletados: ${allItemIds.length} de ${total}`);
    
    // Try to fetch additional products using alternative strategy if we hit the limit
    if (allItemIds.length < total && allItemIds.length >= ML_PAGINATION_LIMIT - 50) {
      console.log(`🔄 Tentando buscar produtos adicionais com estratégia alternativa...`);
      
      // Strategy: Try to fetch by searching in the seller's category (retrovisores: MLB1747)
      // This might bypass the pagination limit
      try {
        const categoryResponse = await fetch(`${ML_API_BASE}/sites/MLB/search?seller_id=${sellerId}&category=MLB1747&limit=50&offset=0`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          const categoryIds = (categoryData.results || []).map(item => item.id);
          const newIds = categoryIds.filter(id => !allItemIds.includes(id));
          
          if (newIds.length > 0) {
            console.log(`📦 Estratégia alternativa: +${newIds.length} produtos únicos encontrados`);
            allItemIds = allItemIds.concat(newIds);
            
            // Try to get more pages from category search
            let catOffset = 50;
            while (catOffset < 1000 && newIds.length > 0) {
              const catPageResponse = await fetch(`${ML_API_BASE}/sites/MLB/search?seller_id=${sellerId}&category=MLB1747&limit=50&offset=${catOffset}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
              });
              
              if (catPageResponse.ok) {
                const catPageData = await catPageResponse.json();
                const catPageIds = (catPageData.results || []).map(item => item.id);
                const uniqueNewIds = catPageIds.filter(id => !allItemIds.includes(id));
                
                if (uniqueNewIds.length === 0) break;
                
                allItemIds = allItemIds.concat(uniqueNewIds);
                console.log(`📦 Categoria página ${catOffset/50 + 1}: +${uniqueNewIds.length} produtos únicos`);
                catOffset += 50;
              } else {
                break;
              }
            }
          }
        }
      } catch (altError) {
        console.warn('⚠️ Estratégia alternativa falhou:', altError.message);
      }
      
      console.log(`✅ Total após estratégia alternativa: ${allItemIds.length} de ${total}`);
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

    const response = {
      total: total,
      fetched: allProducts.length,
      results: allProducts,
    };

    // Add warning if we couldn't fetch all products due to API limits
    if (allItemIds.length < total && allItemIds.length >= ML_PAGINATION_LIMIT - 50) {
      response.warning = `A API do Mercado Livre limita a paginação a ~${ML_PAGINATION_LIMIT} resultados. Foram buscados ${allProducts.length} de ${total} produtos.`;
      response.hasMore = true;
      response.apiLimit = ML_PAGINATION_LIMIT;
    }

    res.json(response);
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Erro interno', message: error.message });
  }
};
