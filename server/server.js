import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ML_API_BASE = 'https://api.mercadolibre.com';
const CLIENT_ID = process.env.ML_CLIENT_ID;
const CLIENT_SECRET = process.env.ML_CLIENT_SECRET;
const SELLER_ID = process.env.ML_SELLER_ID;
const SITE_ID = 'MLB'; // Brasil

// Cache do access token
let accessToken = null;
let tokenExpiresAt = null;

// Função para obter access token usando Client Credentials
async function getAccessToken() {
  // Se temos um token válido, retorna ele
  if (accessToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  try {
    console.log('🔄 Obtendo novo access token...');
    const response = await fetch(`${ML_API_BASE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erro OAuth:', response.status, error);
      throw new Error(`OAuth Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Token expira em ~6 horas, vamos renovar 1 hora antes
    tokenExpiresAt = Date.now() + (data.expires_in - 3600) * 1000;

    console.log('✅ Access token obtido com sucesso');
    return accessToken;
  } catch (error) {
    console.error('❌ Erro ao obter access token:', error);
    throw error;
  }
}

// Endpoint para buscar produtos do vendedor
// Nota: A API do ML restringiu busca por seller_id. 
// Esta implementação tenta múltiplas estratégias
app.get('/api/products', async (req, res) => {
  try {
    const { limit = 50, offset = 0, sort = 'relevance' } = req.query;

    // Estratégia 1: Tentar busca direta por seller_id (pode não funcionar)
    const url = new URL(`${ML_API_BASE}/sites/${SITE_ID}/search`);
    url.searchParams.set('seller_id', SELLER_ID);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());
    url.searchParams.set('sort', sort);

    console.log(`🔍 Tentando buscar produtos do seller ${SELLER_ID}...`);

    // Tentar com autenticação
    const token = await getAccessToken();
    let response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // Se falhar, tentar sem autenticação
    if (response.status === 403) {
      console.log('⚠️ 403 com auth, tentando sem autenticação...');
      response = await fetch(url.toString());
    }

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Encontrados ${data.results?.length || 0} produtos`);
      return res.json(data);
    }

    // Se ainda falhar, retornar erro informativo
    const errorText = await response.text();
    console.error('❌ Erro na API ML:', response.status, errorText);
    
    return res.status(response.status).json({
      error: 'Erro ao buscar produtos',
      details: errorText,
      note: 'A API do Mercado Livre restringiu a busca por seller_id. Use o endpoint /api/products/all que tenta estratégias alternativas.',
    });
  } catch (error) {
    console.error('Erro no endpoint /api/products:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
    });
  }
});

// Endpoint para buscar todos os produtos (com paginação automática)
// Tenta múltiplas estratégias quando busca direta por seller_id falha
app.get('/api/products/all', async (req, res) => {
  try {
    console.log('🔄 Buscando todos os produtos do seller...');
    
    // Estratégia 1: Busca direta por seller_id
    try {
      const token = await getAccessToken();
      const allProducts = [];
      let offset = 0;
      const limit = 50;
      let total = Infinity;
      let hasMore = true;

      while (hasMore && offset < 1000) {
        const url = new URL(`${ML_API_BASE}/sites/${SITE_ID}/search`);
        url.searchParams.set('seller_id', SELLER_ID);
        url.searchParams.set('limit', limit.toString());
        url.searchParams.set('offset', offset.toString());
        url.searchParams.set('sort', 'relevance');

        let response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Se falhar com auth, tentar sem
        if (response.status === 403) {
          response = await fetch(url.toString());
        }

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        allProducts.push(...data.results);
        total = data.paging.total;
        offset += limit;
        hasMore = offset < total;

        // Pequeno delay para evitar rate limiting
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      if (allProducts.length > 0) {
        console.log(`✅ Estratégia 1 funcionou: ${allProducts.length} produtos encontrados`);
        return res.json({
          results: allProducts,
          total: allProducts.length,
        });
      }
    } catch (error) {
      console.log('⚠️ Estratégia 1 falhou, tentando estratégia alternativa...', error.message);
    }

    // Estratégia 2: Busca por categoria de retrovisores e filtrar por seller
    // Categoria MLB1747 = Retrovisores
    try {
      const token = await getAccessToken();
      const allProducts = [];
      let offset = 0;
      const limit = 50;
      const maxResults = 1000;

      while (offset < maxResults) {
        const url = new URL(`${ML_API_BASE}/sites/${SITE_ID}/search`);
        url.searchParams.set('category', 'MLB1747'); // Categoria de retrovisores
        url.searchParams.set('limit', limit.toString());
        url.searchParams.set('offset', offset.toString());
        url.searchParams.set('sort', 'relevance');

        let response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          response = await fetch(url.toString());
        }

        if (!response.ok) {
          break;
        }

        const data = await response.json();
        
        // Filtrar apenas produtos do nosso seller
        const sellerProducts = data.results.filter(item => 
          item.seller?.id?.toString() === SELLER_ID
        );
        
        allProducts.push(...sellerProducts);

        if (data.results.length < limit) {
          break; // Não há mais resultados
        }

        offset += limit;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (allProducts.length > 0) {
        console.log(`✅ Estratégia 2 funcionou: ${allProducts.length} produtos encontrados`);
        return res.json({
          results: allProducts,
          total: allProducts.length,
        });
      }
    } catch (error) {
      console.log('⚠️ Estratégia 2 também falhou:', error.message);
    }

    // Se todas as estratégias falharem, retornar dados de fallback
    console.log('⚠️ Todas as estratégias falharam, retornando dados de fallback');
    return res.json({
      results: [],
      total: 0,
      note: 'A API do Mercado Livre restringiu o acesso. Use dados estáticos no frontend.',
      fallback: true,
    });
  } catch (error) {
    console.error('Erro no endpoint /api/products/all:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 Buscando produtos do vendedor: ${SELLER_ID}`);
});
