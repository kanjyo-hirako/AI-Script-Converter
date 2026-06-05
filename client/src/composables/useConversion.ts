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
  const result = ref<ConversionResult>({ characters: [], locations: [], scenes: [] })
  const chapters = ref<Chapter[]>([])

  async function convert(novelText: string) {
    chapters.value = splitChapters(novelText)
    if (chapters.value.length === 0) {
      errorMessage.value = '没有识别到任何章节'
      status.value = 'error'
      return
    }

    status.value = 'converting'
    progress.value = { current: 0, total: chapters.value.length }
    errorMessage.value = ''
    result.value = { characters: [], locations: [], scenes: [] }

    for (let i = 0; i < chapters.value.length; i++) {
      progress.value.current = i + 1

      try {
        const res = await fetch('/api/convert', {
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
        errorMessage.value = `第 ${i + 1} 章转换失败: ${err.message}`
        status.value = 'error'
        return
      }
    }

    status.value = 'done'
  }

  function reset() {
    status.value = 'idle'
    progress.value = { current: 0, total: 0 }
    errorMessage.value = ''
    result.value = { characters: [], locations: [], scenes: [] }
  }

  return {
    status,
    progress,
    errorMessage,
    result,
    chapters,
    convert,
    reset,
  }
}
