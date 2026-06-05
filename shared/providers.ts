import type { ModelProvider } from './types';

export const MODEL_PROVIDERS: Record<string, ModelProvider> = {
  deepseek: {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
  },
  qwen: {
    name: '通义千问',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
    defaultModel: 'qwen-plus',
  },
  moonshot: {
    name: 'Moonshot (Kimi)',
    baseURL: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    defaultModel: 'moonshot-v1-32k',
  },
  zhipu: {
    name: '智谱 (ChatGLM)',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4', 'glm-4-flash'],
    defaultModel: 'glm-4',
  },
  custom: {
    name: '自定义',
    baseURL: '',
    models: [],
    defaultModel: '',
  },
};
