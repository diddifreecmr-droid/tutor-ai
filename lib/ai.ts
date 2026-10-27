import OpenAI from 'openai';

export function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.APP_URL ?? 'http://localhost:3000',
      'X-Title': 'Tutor AI Cameroun',
    },
  });
}

export async function extractImageText(base64: string, mimeType: string) {
  const client = getOpenRouterClient();
  if (!client) return null;
  const response = await client.chat.completions.create({
    model: process.env.OPENROUTER_OCR_MODEL ?? 'z-ai/glm-5.3-flash-vision',
    temperature: 0,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Transcris fidèlement tout le texte visible dans cette page. Conserve les titres, formules, tableaux et paragraphes. Ne résume pas. Réponds uniquement avec le texte transcrit.' },
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
      ],
    }],
  });
  return response.choices[0]?.message?.content ?? '';
}

export async function answerTutorQuestion(question: string, context: string) {
  const client = getOpenRouterClient();
  if (!client) return null;
  const response = await client.chat.completions.create({
    model: process.env.OPENROUTER_CHAT_MODEL ?? 'z-ai/glm-5.3-flash',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: `Tu es Tutor.ai, un tuteur scolaire francophone pour les élèves du Cameroun. Réponds en français simple et pédagogique. Utilise uniquement le contexte fourni quand il contient la réponse. Si le contexte est insuffisant, dis-le clairement et propose une question de clarification. Explique étape par étape, avec les termes scolaires utilisés au Cameroun. Ne prétends jamais qu'une information est officielle si elle ne vient pas d'une source fournie. Cite les références [Document, page] à la fin quand elles sont disponibles.\n\nCONTEXTE DES COURS :\n${context}`,
      },
      { role: 'user', content: question },
    ],
  });
  return response.choices[0]?.message?.content ?? '';
}