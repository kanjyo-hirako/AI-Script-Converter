export interface Chapter {
  title: string
  content: string
  index: number
}

const CHAPTER_REGEX = /^第[一二三四五六七八九十百千零\d]+[章回节卷集部篇].*/gm

export function splitChapters(text: string): Chapter[] {
  if (!text.trim()) return []

  const matches: { title: string; index: number }[] = []
  let match: RegExpExecArray | null

  while ((match = CHAPTER_REGEX.exec(text)) !== null) {
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
    })
  }

  return chapters
}
