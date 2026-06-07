<script setup lang="ts">
import { useSettings } from '../composables/useSettings'
import { MODEL_PROVIDERS } from '../../../shared/providers'

const { settings, setProvider, isComplete } = useSettings()

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const providerOptions = Object.entries(MODEL_PROVIDERS).map(([key, p]) => ({
  key,
  label: p.name,
}))

const currentProvider = () => MODEL_PROVIDERS[settings.providerKey] ?? MODEL_PROVIDERS.siliconflow
const isCustom = () => settings.providerKey === 'custom'

function handleSave() {
  if (isComplete()) {
    emit('saved')
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- backdrop -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="emit('close')"
        />

        <!-- modal -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <!-- header -->
          <div class="px-6 pt-6 pb-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-gray-900">配置 API Key</h2>
              <button
                class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                @click="emit('close')"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-sm text-gray-500 mt-1">需要先配置 API Key 才能使用生成功能</p>
          </div>

          <!-- body -->
          <div class="px-6 py-5 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">模型提供商</label>
              <select
                :value="settings.providerKey"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                @change="setProvider(($event.target as HTMLSelectElement).value)"
              >
                <option v-for="p in providerOptions" :key="p.key" :value="p.key">
                  {{ p.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                v-model="settings.apiKey"
                type="password"
                placeholder="输入你的 API Key"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p class="text-xs text-gray-400 mt-1">密钥仅存储在浏览器本地，不会上传到任何服务器</p>
            </div>

            <div v-if="isCustom()">
              <label class="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
              <input
                v-model="settings.baseURL"
                type="text"
                placeholder="https://api.example.com/v1"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">模型</label>
              <select
                v-if="!isCustom()"
                v-model="settings.model"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option v-for="m in currentProvider().models" :key="m" :value="m">
                  {{ m }}
                </option>
              </select>
              <input
                v-else
                v-model="settings.model"
                type="text"
                placeholder="输入模型名称"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- footer -->
          <div class="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
            <button
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              @click="emit('close')"
            >
              取消
            </button>
            <button
              :disabled="!isComplete()"
              class="px-5 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="isComplete()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
              @click="handleSave"
            >
              保存并生成
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
.modal-leave-to .relative {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
</style>
