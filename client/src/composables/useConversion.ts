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

export type ConversionStatus = 'idle' | 'converting' | 'done' | 'error'

export function useConversion() {
  const { settings } = useSettings()

  const status = ref<ConversionStatus>('idle')
  const progress = ref({ current: 0, total: 0 })
  const errorMessage = ref('')
  const errorCode = ref<string>('')
  const result = ref<ConversionResult>({ characters: [], locations: [], scenes: [] })
  const chapters = ref<Chapter[]>([])

  async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 120000): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(url, { ...options, signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
  }

  function classifyError(err: any): { message: string; code: string } {
    if (err.name === 'AbortError') {
      return { message: '请求超时（2分钟），文本可能过长，请尝试缩短章节', code: 'timeout' }
    }
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      return { message: '网络连接失败，请检查后端服务是否启动', code: 'network' }
    }
    return { message: err.message || '未知错误', code: 'unknown' }
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

    for (let i = 0; i < chapters.value.length; i++) {
      progress.value.current = i + 1

      try {
        const res = await fetchWithTimeout('/api/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: settings.value.apiKey,
            baseURL: settings.value.baseURL,
            model: settings.value.model,
            chapterText: chapters.value[i].content,
            existingCharacters: result.value.characters,
            existingScenes: result.value.scenes,
          }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: res.statusText }))
          throw new Error(body.error || `请求失败 (${res.status})`)
        }

        const data = await res.json()

        if (data.characters) result.value.characters.push(...data.characters)
        if (data.locations) result.value.locations.push(...data.locations)
        if (data.scenes) result.value.scenes.push(...data.scenes)
      } catch (err: any) {
        const { message, code } = classifyError(err)
        errorMessage.value = `第 ${i + 1} 章转换失败: ${message}`
        errorCode.value = code
        status.value = 'error'
        return
      }
    }

    status.value = 'done'
  }

  function retry(novelText: string) {
    convert(novelText)
  }

  function reset() {
    status.value = 'idle'
    progress.value = { current: 0, total: 0 }
    errorMessage.value = ''
    errorCode.value = ''
    result.value = { characters: [], locations: [], scenes: [] }
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
    reset,
  }
}
