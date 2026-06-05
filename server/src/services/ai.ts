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

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('模型返回了空内容');
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error(`模型返回的内容不是有效 JSON: ${content.slice(0, 200)}`);
  }
}
