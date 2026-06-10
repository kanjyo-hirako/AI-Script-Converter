export interface Chapter {
  title: string
  content: string
  index: number
  selected?: boolean
}

const DEFAULT_REGEX = /^第[一二三四五六七八九十百千零\d]+[章回节卷集部篇].*/gm

const MAX_CHUNK_LENGTH = 3000

function splitLongChapter(content: string, maxLength = MAX_CHUNK_LENGTH): string[] {
  if (content.length <= maxLength) return [content]

  const chunks: string[] = []
  let remaining = content

  while (remaining.length > maxLength) {
    let splitPoint = remaining.lastIndexOf('\n\n', maxLength)

    if (splitPoint < maxLength * 0.5) {
      splitPoint = maxLength
      const sentenceEnders = ['。', '！', '？', '；', '\n']
      for (const char of sentenceEnders) {
        const pos = remaining.lastIndexOf(char, maxLength)
        if (pos > maxLength * 0.5) {
          splitPoint = pos + 1
          break
        }
      }
    }

    chunks.push(remaining.slice(0, splitPoint).trim())
    remaining = remaining.slice(splitPoint).trim()
  }

  if (remaining) chunks.push(remaining)
  return chunks.filter(c => c.length > 0)
}

export function expandChapters(chapters: Chapter[]): Chapter[] {
  const expanded: Chapter[] = []
  let globalIndex = 0

  for (const chapter of chapters) {
    const parts = splitLongChapter(chapter.content)
    if (parts.length === 1) {
      expanded.push({ ...chapter, index: globalIndex++ })
    } else {
      for (let i = 0; i < parts.length; i++) {
        expanded.push({
          title: `${chapter.title} (第${i + 1}/${parts.length}部分)`,
          content: parts[i],
          index: globalIndex++,
          selected: chapter.selected,
        })
      }
    }
  }

  return expanded
}

export function splitChapters(text: string, customPattern?: string): Chapter[] {
  if (!text.trim()) return []

  let regex: RegExp
  if (customPattern) {
    try {
      regex = new RegExp(customPattern, 'gm')
    } catch {
      regex = DEFAULT_REGEX
    }
  } else {
    regex = DEFAULT_REGEX
  }

  const matches: { title: string; index: number }[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    matches.push({
      title: match[0].trim(),
      index: match.index,
    })
  }

  if (matches.length === 0) {
    return [{
      title: '全文',
      content: text.trim(),
      index: 0,
      selected: true,
    }]
  }

  const chapters: Chapter[] = []

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length
    const content = text.slice(start, end).trim()

    chapters.push({
      title: matches[i].title,
      content,
      index: i,
      selected: true,
    })
  }

  return chapters
}
