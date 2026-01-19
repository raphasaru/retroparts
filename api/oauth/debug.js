const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  // Check env vars
  const envCheck = {
    SUPABASE_URL: supabaseUrl ? '✅ Configurado' : '❌ Faltando',
    SUPABASE_ANON_KEY: supabaseKey ? '✅ Configurado' : '❌ Faltando',
    ML_CLIENT_ID: process.env.ML_CLIENT_ID ? '✅ Configurado' : '❌ Faltando',
    ML_CLIENT_SECRET: process.env.ML_CLIENT_SECRET ? '✅ Configurado' : '❌ Faltando',
    REDIRECT_URI: process.env.REDIRECT_URI || 'Não definido (usando padrão)',
  };

  if (!supabaseUrl || !supabaseKey) {
    return res.json({
      status: 'error',
      message: 'Supabase não configurado',
      envCheck,
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test read from oauth_tokens
    const { data, error } = await supabase
      .from('oauth_tokens')
      .select('seller_id, user_nickname, expires_at, created_at')
      .limit(5);

    if (error) {
      return res.json({
        status: 'error',
        message: 'Erro ao ler tabela oauth_tokens',
        error: error.message,
        hint: error.hint || 'Verifique se a tabela existe e as políticas RLS permitem leitura',
        envCheck,
      });
    }

    return res.json({
      status: 'ok',
      message: 'Supabase conectado',
      envCheck,
      tokens_count: data?.length || 0,
      tokens: data || [],
    });
  } catch (error) {
    return res.json({
      status: 'error',
      message: 'Erro de conexão',
      error: error.message,
      envCheck,
    });
  }
};
