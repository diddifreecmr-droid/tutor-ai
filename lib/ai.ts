import OpenAI from 'openai';

export function getVisionClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1', defaultHeaders: { 'HTTP-Referer': process.env.APP_URL ?? 'http://localhost:3000', 'X-Title': 'Tutor AI Cameroun' } });
}

export async function extractImageText(base64: string, mimeType: string) {
  const client = getVisionClient();
  if (!client) return null;
  const response = await client.chat.completions.create({
    model: process.env.OPENROUTER_OCR_MODEL ?? 'z-ai/glm-5.3-flash-vision',
    temperature: 0,
    messages: [{ role: 'user', content: [
      { type: 'text', text: 'Transcris fidèlement le texte visible dans cette page. Conserve les titres, formules et paragraphes. Réponds uniquement avec le texte transcrit, en français si le document est en français.' },
      { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
    ] }]
  });
  return response.choices[0]?.message?.content ?? '';
}
