import OpenAI from 'openai';

export function createAIClient(apiKey: string, baseURL: string) {
  return new OpenAI({ apiKey, baseURL });
}

export async function convertChapter(
  client: OpenAI,
  model: string,
  systemPrompt: string,
  userPrompt: string,
) {
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(response.choices[0].message.content ?? '{}');
}
