import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const body = JSON.parse(event.body || '{}');
    const { userId, payload } = body;
    if (!userId) return { statusCode: 400, body: 'Missing userId' };

    const { error } = await supabase
      .from('user_vaults')
      .upsert({ user_id: userId, payload: JSON.stringify(payload), updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    if (error) {
      console.error('[supabase-sync] error', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message || error }) };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error('[supabase-sync] exception', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message || String(e) }) };
  }
}
