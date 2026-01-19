const ML_API_BASE = 'https://api.mercadolibre.com';

export default function handler(req, res) {
  const CLIENT_ID = process.env.ML_CLIENT_ID;
  const REDIRECT_URI = process.env.REDIRECT_URI;

  const authUrl = new URL(`${ML_API_BASE}/authorization`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);

  // Redirect directly to ML authorization
  res.redirect(302, authUrl.toString());
}
