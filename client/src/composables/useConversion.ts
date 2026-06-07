import { ref } from 'vue'
import { useSettings } from './useSettings'
import { splitChapters } from '../lib/chapterSplitter'
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

  function classifyError(err: any): { message: string; code: string } {
    if (err.name === 'AbortError') {
      return { message: '已取消转换', code: 'cancelled' }
    }
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      return { message: '网络连接失败，请检查后端服务是否启动', code: 'network' }
    }
    return { message: err.message || '未知错误', code: 'unknown' }
  }

  async function convertChapter(index: number): Promise<boolean> {
    progress.value.current = index + 1

    abortController = new AbortController()
    const timer = setTimeout(() => abortController?.abort(), 120000)

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
        signal: abortController.signal,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(body.error || `请求失败 (${res.status})`)
      }

      const data = await res.json()
      if (data.characters) result.value.characters.push(...data.characters)
      if (data.locations) result.value.locations.push(...data.locations)
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
      abortController = null
    }
  }

  async function convert(novelText: string) {
    chapters.value = splitChapters(novelText)
    if (chapters.value.length === 0) {
      errorMessage.value = '没有识别到任何章节'
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
