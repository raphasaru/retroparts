import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getToken() {
  const { data, error } = await supabase
    .from('oauth_tokens')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  // Check if token is expired
  if (new Date(data.expires_at) < new Date()) {
    return { ...data, expired: true };
  }

  return data;
}

export async function saveToken(tokenData, userInfo) {
  const { data, error } = await supabase
    .from('oauth_tokens')
    .upsert({
      seller_id: String(userInfo.id),
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      user_nickname: userInfo.nickname,
    }, {
      onConflict: 'seller_id'
    })
    .select()
    .single();

  return { data, error };
}

export async function updateToken(sellerId, tokenData) {
  const { data, error } = await supabase
    .from('oauth_tokens')
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    })
    .eq('seller_id', sellerId)
    .select()
    .single();

  return { data, error };
}
