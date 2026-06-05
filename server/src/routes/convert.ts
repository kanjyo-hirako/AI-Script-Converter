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
      res.status(400).json({ error: '缺少必要参数' });
      return;
    }

    const client = createAIClient(apiKey, baseURL);
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(chapterText, existingCharacters, existingScenes);

    const result = await convertChapter(client, model, systemPrompt, userPrompt);
    res.json(result);
  } catch (err: any) {
    console.error('转换失败:', err);
    const message = err?.message || '转换过程中发生未知错误';
    res.status(500).json({ error: message });
  }
});

export default router;
