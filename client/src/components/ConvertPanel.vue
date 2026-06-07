<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSettings } from '../composables/useSettings'
import SettingsModal from './SettingsModal.vue'

const props = defineProps<{
  text: string
  status: 'idle' | 'converting' | 'done' | 'error'
  progress: { current: number; total: number }
  errorMessage: string
  errorCode: string
}>()

const emit = defineEmits<{
  convert: []
  retry: []
  reset: []
}>()

const { isComplete } = useSettings()
const showSettingsModal = ref(false)

const isRetryable = computed(() =>
  ['timeout', 'network', 'unknown'].includes(props.errorCode)
)

const errorHint = computed(() => {
  switch (props.errorCode) {
    case 'timeout':
      return '可以点击重试再次尝试，或缩短章节文本后重试'
    case 'network':
      return '请确认后端服务已启动（npm run dev:server）'
    case 'no_chapters':
      return '请确认文本中包含"第X章"格式的章节标题'
    default:
      return ''
  }
})

function handleConvertClick() {
  if (!isComplete()) {
    showSettingsModal.value = true
    return
  }
  emit('convert')
}

function onSettingsSaved() {
  emit('convert')
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div v-if="!text" class="text-gray-400 text-sm">
      请先在「输入」步骤中粘贴或上传小说文本
    </div>

    <template v-else>
      <div v-if="status === 'idle'" class="text-center">
        <div
          v-if="!isComplete()"
          class="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>尚未配置 API Key，点击生成后可快速配置</span>
        </div>
        <p class="text-gray-600 mb-4">准备就绪，点击按钮开始生成剧本</p>
        <button
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          @click="handleConvertClick"
        >
          生成剧本
        </button>
      </div>

      <div v-else-if="status === 'converting'" class="text-center space-y-4">
        <div class="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p class="text-gray-600">
          正在转换... {{ progress.current }} / {{ progress.total }} 章
        </p>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(progress.current / progress.total) * 100}%` }"
          />
        </div>
      </div>

      <div v-else-if="status === 'done'" class="text-center space-y-4">
        <p class="text-green-600 font-medium">转换完成！</p>
        <button
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          @click="emit('reset')"
        >
          重新转换
        </button>
      </div>

      <div v-else-if="status === 'error'" class="text-center space-y-3">
        <div class="inline-flex items-center gap-2 text-red-600">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
        <p v-if="errorHint" class="text-sm text-gray-500">{{ errorHint }}</p>
        <div class="flex justify-center gap-3">
          <button
            v-if="isRetryable"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            @click="emit('retry')"
          >
            重试
          </button>
          <button
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            @click="emit('reset')"
          >
            重新开始
          </button>
        </div>
      </div>
    </template>

    <SettingsModal
      :visible="showSettingsModal"
      @close="showSettingsModal = false"
      @saved="onSettingsSaved"
    />
  </div>
</template>
