import { ref, watch } from 'vue'
import { MODEL_PROVIDERS } from '../../../shared/providers'

export interface Settings {
  providerKey: string
  apiKey: string
  baseURL: string
  model: string
}

const STORAGE_KEY = 'script-converter-settings'

function loadSettings(): Settings {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      // ignore
    }
  }
  const defaultProvider = MODEL_PROVIDERS.siliconflow
  return {
    providerKey: 'siliconflow',
    apiKey: '',
    baseURL: defaultProvider.baseURL,
    model: defaultProvider.defaultModel,
  }
}

const settings = ref<Settings>(loadSettings())

watch(settings, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function useSettings() {
  function setProvider(key: string) {
    const provider = MODEL_PROVIDERS[key]
    if (!provider) return
    settings.value.providerKey = key
    settings.value.baseURL = provider.baseURL
    settings.value.model = provider.defaultModel
  }

  function isComplete(): boolean {
    return !!(settings.value.apiKey && settings.value.baseURL && settings.value.model)
  }

  return {
    settings,
    setProvider,
    isComplete,
  }
}
