const ML_API_BASE = 'https://api.mercadolibre.com';

module.exports = function handler(req, res) {
  const CLIENT_ID = process.env.ML_CLIENT_ID;
  const REDIRECT_URI = process.env.REDIRECT_URI;

  if (!CLIENT_ID || !REDIRECT_URI) {
    return res.status(500).json({
      error: 'Configuração incompleta',
      message: 'ML_CLIENT_ID ou REDIRECT_URI não configurados'
    });
  }

  const authUrl = new URL(`${ML_API_BASE}/authorization`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);

  res.redirect(302, authUrl.toString());
};
