import type { Character, Scene } from '../../../shared/types';

export function buildSystemPrompt(): string {
  return `你是一位专业的中文剧本改编编剧。你的任务是将小说文本转换为结构化的剧本格式。

规则：
1. 识别每个场景，标注 INT（室内）/ EXT（室外），地点，时间
2. 提取所有出现的角色，区分主角/配角/龙套
3. 小说中的叙述性描写转换为动作描写（type: action）
4. 对话保留角色的语气特征，标注可能的括号注释（如"低声""愤怒"）
5. 在场景转换处添加转场指示
6. 严格按照指定 JSON Schema 输出`;
}

export function buildUserPrompt(
  chapterText: string,
  existingCharacters: Character[],
  existingScenes: Scene[],
): string {
  const charsJson = JSON.stringify(existingCharacters, null, 2);
  const scenesJson = JSON.stringify(existingScenes, null, 2);

  return `已识别角色（如为空则首次识别）：
${charsJson}

已识别场景（如为空则首次识别）：
${scenesJson}

请将以下小说文本转换为剧本 JSON：
---
${chapterText}
---

输出 JSON 格式：
{
  "characters": [
    {
      "id": "C01",
      "name": "角色名",
      "description": "角色简介",
      "age": "年龄",
      "role": "protagonist/antagonist/supporting/minor"
    }
  ],
  "locations": [
    {
      "id": "L01",
      "name": "地点名",
      "type": "INT/EXT/INT-EXT",
      "description": "地点描述"
    }
  ],
  "scenes": [
    {
      "id": "S01",
      "chapter_ref": 1,
      "heading": "INT. 地点 - 时间",
      "location_id": "L01",
      "time_of_day": "白天/夜晚",
      "summary": "场景概要",
      "content": [
        { "type": "action", "text": "动作描写" },
        { "type": "dialogue", "character_id": "C01", "parenthetical": "低声", "text": "对话内容" },
        { "type": "transition", "text": "切至" }
      ]
    }
  ]
}`;
}
