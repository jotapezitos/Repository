
/**
 * SEGREDO ABSOLUTO: O 'clientSecret' abaixo é a única informação que NÃO pode ser divulgada.
 * Se alguém tiver acesso a ele, pode controlar sua conta na Kiwify.
 * As outras chaves (ClientID, PublishableKey) são seguras para o front-end.
 */
// Kiwify secrets MUST NOT live in the frontend. Use Netlify functions to create/check payment sessions.
export const kiwifyService = {
  // Request a checkout URL from the server (server has the clientSecret)
  getCheckoutUrl: async (email?: string) => {
    try {
      const res = await fetch('/.netlify/functions/kiwify-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.checkoutUrl || null;
    } catch (e) {
      console.warn('Kiwify checkout proxy failed', e);
      return null;
    }
  },

  // Local dev helpers (keep existing local flag behavior)
  checkPaymentStatus: async (email: string): Promise<boolean> => {
    const paidUsers = JSON.parse(localStorage.getItem('toazul_paid_members') || '[]');
    return paidUsers.includes(email);
  },

  markAsPaid: (email: string) => {
    const paidUsers = JSON.parse(localStorage.getItem('toazul_paid_members') || '[]');
    if (!paidUsers.includes(email)) {
      paidUsers.push(email);
      localStorage.setItem('toazul_paid_members', JSON.stringify(paidUsers));
    }
  }
};
