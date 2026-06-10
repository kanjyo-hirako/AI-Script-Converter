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

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`模型返回的内容不是有效 JSON: ${content.slice(0, 200)}`);
  }

  if (parsed.characters && !Array.isArray(parsed.characters)) {
    throw new Error('模型返回的 characters 不是数组');
  }
  if (parsed.locations && !Array.isArray(parsed.locations)) {
    throw new Error('模型返回的 locations 不是数组');
  }
  if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
    throw new Error('模型返回缺少 scenes 数组');
  }
  for (const scene of parsed.scenes) {
    if (!scene.content || !Array.isArray(scene.content)) {
      throw new Error('模型返回的 scene 缺少 content 数组');
    }
  }

  return parsed;
}
