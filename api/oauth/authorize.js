// URL de autenticação para Brasil (IMPORTANTE: diferente da API)
const ML_AUTH_URL = 'https://auth.mercadolivre.com.br';

module.exports = function handler(req, res) {
  const CLIENT_ID = process.env.ML_CLIENT_ID;
  const REDIRECT_URI = process.env.REDIRECT_URI || 'https://retroparts.vercel.app/api/oauth/callback';

  if (!CLIENT_ID) {
    return res.status(500).json({
      error: 'Configuração incompleta',
      message: 'ML_CLIENT_ID não configurado nas variáveis de ambiente da Vercel'
    });
  }

  // URL correta para Brasil: auth.mercadolivre.com.br (não api.mercadolibre.com)
  const authUrl = new URL(`${ML_AUTH_URL}/authorization`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);

  console.log('Redirecting to:', authUrl.toString());
  res.redirect(302, authUrl.toString());
};
