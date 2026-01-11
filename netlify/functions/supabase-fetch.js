import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function handler(event) {
  try {
    const userId = (event.queryStringParameters && event.queryStringParameters.userId) || null;
    if (!userId) return { statusCode: 400, body: 'Missing userId' };

    const { data, error } = await supabase
      .from('user_vaults')
      .select('payload')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return { statusCode: 200, body: JSON.stringify({ payload: null }) };
      console.error('[supabase-fetch] error', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message || error }) };
    }
    return { statusCode: 200, body: JSON.stringify({ payload: data?.payload || null }) };
  } catch (e) {
    console.error('[supabase-fetch] exception', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message || String(e) }) };
  }
}
