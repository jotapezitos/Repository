export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const body = JSON.parse(event.body || '{}');
    const email = body.email || null;

    // The checkout URL (or logic to create a session) must be backed by server-side secret.
    const checkoutUrl = process.env.KIWIFY_CHECKOUT_URL || null;
    if (!checkoutUrl) return { statusCode: 500, body: JSON.stringify({ error: 'Missing KIWIFY_CHECKOUT_URL' }) };

    // Optionally: create checkout session using clientSecret here if Kiwify API available.
    // For now, return configured checkout URL and echo the email so frontend can redirect.
    return { statusCode: 200, body: JSON.stringify({ checkoutUrl, email }) };
  } catch (e) {
    console.error('[kiwify-checkout] error', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message || String(e) }) };
  }
}
