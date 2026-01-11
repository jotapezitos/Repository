
import { AppState } from "../types";

// Proxy the AI call through the serverless function to keep the Google API key secret.
export const getFinancialInsights = async (state: AppState) => {
  try {
    const res = await fetch('/.netlify/functions/gemini-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state })
    });
    if (!res.ok) throw new Error('AI proxy failed');
    return await res.json();
  } catch (error) {
    console.error('Gemini proxy error:', error);
    return { insights: [{ title: 'Erro de Análise', content: 'Não foi possível carregar os insights de IA agora.', severity: 'low' }], resilienceScore: 0 };
  }
};
