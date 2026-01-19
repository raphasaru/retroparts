// Script de teste para verificar se conseguimos buscar um produto específico por ID
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const ML_API_BASE = 'https://api.mercadolibre.com';
const CLIENT_ID = process.env.ML_CLIENT_ID;
const CLIENT_SECRET = process.env.ML_CLIENT_SECRET;

// Teste 1: Obter access token
async function getToken() {
  const response = await fetch(`${ML_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  
  const data = await response.json();
  return data.access_token;
}

// Teste 2: Buscar produto específico por ID (geralmente funciona)
async function testItemById(itemId) {
  const token = await getToken();
  const response = await fetch(`${ML_API_BASE}/items/${itemId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  return response;
}

// Teste 3: Buscar produtos do seller usando /users/{id}/items/search
async function testUserItems() {
  const token = await getToken();
  const response = await fetch(`${ML_API_BASE}/users/260093601/items/search?status=active&limit=10`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  return response;
}

console.log('🧪 Testando diferentes endpoints da API ML...\n');

// Teste 1: Token
console.log('1️⃣ Testando obtenção de token...');
try {
  const token = await getToken();
  console.log('✅ Token obtido:', token.substring(0, 20) + '...');
} catch (error) {
  console.log('❌ Erro ao obter token:', error.message);
  process.exit(1);
}

// Teste 2: Item específico
console.log('\n2️⃣ Testando busca por item_id específico...');
try {
  const response = await testItemById('MLB3726818227');
  const data = await response.json();
  if (response.ok) {
    console.log('✅ Item encontrado:', data.title);
    console.log('   Seller ID:', data.seller_id);
  } else {
    console.log('❌ Erro:', data);
  }
} catch (error) {
  console.log('❌ Erro:', error.message);
}

// Teste 3: Items do usuário
console.log('\n3️⃣ Testando /users/{id}/items/search...');
try {
  const response = await testUserItems();
  const data = await response.json();
  if (response.ok) {
    console.log('✅ Items encontrados:', data.results?.length || 0);
    console.log('   Primeiros IDs:', data.results?.slice(0, 5));
  } else {
    console.log('❌ Erro:', data);
  }
} catch (error) {
  console.log('❌ Erro:', error.message);
}
