import { Router } from 'express';
import type { ConvertRequest } from '../../../shared/types';
import { createAIClient, convertChapter } from '../services/ai';
import { buildSystemPrompt, buildUserPrompt } from '../services/promptBuilder';

const router = Router();

router.post('/convert', async (req, res) => {
  try {
    const {
      apiKey,
      baseURL,
      model,
      chapterText,
      existingCharacters = [],
      existingScenes = [],
    } = req.body as ConvertRequest;

    if (!apiKey || !baseURL || !model || !chapterText) {
      res.status(400).json({ error: '缺少必要参数（apiKey、baseURL、model、chapterText）' });
      return;
    }

    if (typeof apiKey !== 'string' || typeof baseURL !== 'string' ||
        typeof model !== 'string' || typeof chapterText !== 'string') {
      res.status(400).json({ error: '参数类型错误，apiKey/baseURL/model/chapterText 必须为字符串' });
      return;
    }
    if (!Array.isArray(existingCharacters) || !Array.isArray(existingScenes)) {
      res.status(400).json({ error: 'existingCharacters/existingScenes 必须为数组' });
      return;
    }

    const client = createAIClient(apiKey, baseURL);
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(chapterText, existingCharacters, existingScenes);

    const result = await convertChapter(client, model, systemPrompt, userPrompt);
    res.json(result);
  } catch (err: any) {
    console.error('转换失败:', err);

    if (err?.status === 401) {
      res.status(401).json({ error: 'API Key 无效或已过期' });
      return;
    }
    if (err?.status === 429) {
      res.status(429).json({ error: '请求过于频繁，请稍后重试' });
      return;
    }
    if (err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND') {
      res.status(502).json({ error: '无法连接到 AI 服务，请检查 Base URL' });
      return;
    }
    if (err?.code === 'ETIMEDOUT' || err?.message?.includes('timeout')) {
      res.status(504).json({ error: '请求超时，请稍后重试' });
      return;
    }

    const message = err?.message || '转换过程中发生未知错误';
    res.status(500).json({ error: message });
  }
});

export default router;
