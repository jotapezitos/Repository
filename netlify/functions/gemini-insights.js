import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const body = JSON.parse(event.body || '{}');
    const state = body.state || {};

    if (!GOOGLE_API_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'Missing server GOOGLE_API_KEY' }) };

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analise o estado financeiro deste usuário e forneça 3-4 insights específicos e acionáveis em português do Brasil. Seja direto e prático.

Estado atual:
- Saldo inicial: R$ ${state.initialBalance || 0}
- Receitas: ${JSON.stringify(state.incomes || [])}
- Despesas: ${JSON.stringify(state.expenses || [])}

Responda APENAS com um JSON válido no formato:
{
  "insights": [
    {"title": "Título do insight", "content": "Descrição prática", "severity": "low|medium|high"}
  ],
  "resilienceScore": número de 0 a 10
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Limpar a resposta para garantir que seja JSON válido
    const cleanText = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (e) {
      console.error('Erro ao fazer parse do JSON da IA:', e, 'Texto recebido:', cleanText);
      // Fallback para resposta padrão
      parsed = {
        insights: [
          {
            title: 'Análise Básica',
            content: 'Seus dados financeiros foram analisados. Mantenha o controle regular de suas finanças.',
            severity: 'medium'
          }
        ],
        resilienceScore: 5
      };
    }

    return { statusCode: 200, body: JSON.stringify(parsed) };
  } catch (e) {
    console.error('[gemini-insights] error', e);
    return { statusCode: 500, body: JSON.stringify({
      insights: [{
        title: 'Erro Temporário',
        content: 'Não foi possível gerar insights neste momento. Tente novamente mais tarde.',
        severity: 'low'
      }],
      resilienceScore: 0
    }) };
  }
}
