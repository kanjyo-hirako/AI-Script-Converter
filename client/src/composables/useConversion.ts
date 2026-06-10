import { ref } from 'vue'
import { useSettings } from './useSettings'
import { splitChapters, expandChapters } from '../lib/chapterSplitter'
import type { Character, Location, Scene } from '../../../shared/types'
import type { Chapter } from '../lib/chapterSplitter'

export interface ConversionResult {
  characters: Character[]
  locations: Location[]
  scenes: Scene[]
}

export type ConversionStatus = 'idle' | 'converting' | 'done' | 'error' | 'cancelled'

export function useConversion() {
  const { settings } = useSettings()

  const status = ref<ConversionStatus>('idle')
  const progress = ref({ current: 0, total: 0 })
  const errorMessage = ref('')
  const errorCode = ref<string>('')
  const result = ref<ConversionResult>({ characters: [], locations: [], scenes: [] })
  const chapters = ref<Chapter[]>([])

  let abortController: AbortController | null = null
  let failedChapterIndex = -1
  let userCancelled = false

  function classifyError(err: any): { message: string; code: string } {
    if (err.name === 'AbortError') {
      if (userCancelled) {
        return { message: '已取消转换', code: 'cancelled' }
      }
      return { message: '请求超时（2分钟），文本可能过长，请尝试缩短章节', code: 'timeout' }
    }
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      return { message: '网络连接失败，请检查后端服务是否启动', code: 'network' }
    }
    return { message: err.message || '未知错误', code: 'unknown' }
  }

  async function convertChapter(index: number): Promise<boolean> {
    progress.value.current = index + 1

    userCancelled = false
    const controller = new AbortController()
    abortController = controller
    const timer = setTimeout(() => controller.abort(), 120000)

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: settings.value.apiKey,
          baseURL: settings.value.baseURL,
          model: settings.value.model,
          chapterText: chapters.value[index].content,
          existingCharacters: result.value.characters,
          existingScenes: result.value.scenes,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(body.error || `请求失败 (${res.status})`)
      }

      const data = await res.json()

      const existingCharNames = new Set(result.value.characters.map(c => c.name))
      if (data.characters) {
        for (const char of data.characters) {
          if (!existingCharNames.has(char.name)) {
            existingCharNames.add(char.name)
            result.value.characters.push(char)
          }
        }
      }

      const existingLocNames = new Set(result.value.locations.map(l => l.name))
      if (data.locations) {
        for (const loc of data.locations) {
          if (!existingLocNames.has(loc.name)) {
            existingLocNames.add(loc.name)
            result.value.locations.push(loc)
          }
        }
      }

      if (data.scenes) result.value.scenes.push(...data.scenes)

      return true
    } catch (err: any) {
      const { message, code } = classifyError(err)
      if (code === 'cancelled') {
        errorMessage.value = '转换已取消'
        errorCode.value = 'cancelled'
        status.value = 'cancelled'
      } else {
        errorMessage.value = `第 ${index + 1} 章转换失败: ${message}`
        errorCode.value = code
        status.value = 'error'
      }
      failedChapterIndex = index
      return false
    } finally {
      clearTimeout(timer)
      if (abortController === controller) abortController = null
    }
  }

  async function convert(novelText: string, selectedChapters?: Chapter[]) {
    if (selectedChapters && selectedChapters.length > 0) {
      chapters.value = expandChapters(selectedChapters.filter(ch => ch.selected !== false))
    } else {
      chapters.value = expandChapters(splitChapters(novelText).filter(ch => ch.selected !== false))
    }
    if (chapters.value.length === 0) {
      errorMessage.value = '没有选择任何章节'
      errorCode.value = 'no_chapters'
      status.value = 'error'
      return
    }

    status.value = 'converting'
    progress.value = { current: 0, total: chapters.value.length }
    errorMessage.value = ''
    errorCode.value = ''
    result.value = { characters: [], locations: [], scenes: [] }
    failedChapterIndex = -1

    for (let i = 0; i < chapters.value.length; i++) {
      const ok = await convertChapter(i)
      if (!ok) return
    }

    status.value = 'done'
  }

  async function retry(novelText: string) {
    if (failedChapterIndex < 0 || failedChapterIndex >= chapters.value.length) {
      return convert(novelText)
    }

    status.value = 'converting'
    errorMessage.value = ''
    errorCode.value = ''
    const resumeFrom = failedChapterIndex
    failedChapterIndex = -1

    for (let i = resumeFrom; i < chapters.value.length; i++) {
      const ok = await convertChapter(i)
      if (!ok) return
    }

    status.value = 'done'
  }

  function cancel() {
    userCancelled = true
    if (abortController) {
      abortController.abort()
    }
  }

  function reset() {
    cancel()
    status.value = 'idle'
    progress.value = { current: 0, total: 0 }
    errorMessage.value = ''
    errorCode.value = ''
    result.value = { characters: [], locations: [], scenes: [] }
    failedChapterIndex = -1
  }

  function loadResult(data: ConversionResult) {
    result.value = {
      characters: data.characters || [],
      locations: data.locations || [],
      scenes: data.scenes || [],
    }
    status.value = 'done'
    progress.value = { current: 0, total: 0 }
    errorMessage.value = ''
    errorCode.value = ''
  }

  return {
    status,
    progress,
    errorMessage,
    errorCode,
    result,
    chapters,
    convert,
    retry,
    cancel,
    reset,
    loadResult,
  }
}
