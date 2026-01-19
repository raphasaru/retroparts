import { getToken } from '../lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const token = await getToken();

    if (!token) {
      return res.json({
        authorized: false,
        message: 'Nenhum vendedor autorizado'
      });
    }

    res.json({
      authorized: !token.expired,
      expired: token.expired || false,
      user_nickname: token.user_nickname,
      expires_at: token.expires_at,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno', message: error.message });
  }
}
