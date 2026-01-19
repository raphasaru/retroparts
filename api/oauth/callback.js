import { saveToken } from '../lib/supabase.js';

const ML_API_BASE = 'https://api.mercadolibre.com';

export default async function handler(req, res) {
  const { code, error: authError } = req.query;

  if (authError) {
    return res.redirect(`/?error=${encodeURIComponent('Autorização negada')}`);
  }

  if (!code) {
    return res.redirect(`/?error=${encodeURIComponent('Código não fornecido')}`);
  }

  const CLIENT_ID = process.env.ML_CLIENT_ID;
  const CLIENT_SECRET = process.env.ML_CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;

  try {
    // Exchange code for token
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
      console.error('Token error:', error);
      return res.redirect(`/?error=${encodeURIComponent('Erro ao obter token')}`);
    }

    const tokenData = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch(`${ML_API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    // Save token to Supabase
    const { error: saveError } = await saveToken(tokenData, userData);

    if (saveError) {
      console.error('Save error:', saveError);
      return res.redirect(`/?error=${encodeURIComponent('Erro ao salvar token')}`);
    }

    // Redirect to success page
    res.redirect(`/?success=true&user=${encodeURIComponent(userData.nickname)}`);
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect(`/?error=${encodeURIComponent('Erro interno')}`);
  }
}
