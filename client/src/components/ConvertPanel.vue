<script setup lang="ts">
import { computed } from 'vue'
import { useConversion } from '../composables/useConversion'
import { useSettings } from '../composables/useSettings'

const props = defineProps<{ text: string }>()

const { status, progress, errorMessage, convert, reset } = useConversion()
const { isComplete } = useSettings()

const canConvert = computed(() => props.text.trim().length > 0 && isComplete())

async function handleConvert() {
  await convert(props.text)
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div v-if="!text" class="text-gray-400 text-sm">
      请先在「输入」步骤中粘贴或上传小说文本
    </div>

    <div v-else-if="!isComplete()" class="text-amber-600 text-sm">
      请先在「设置」步骤中填写 API Key 和选择模型
    </div>

    <template v-else>
      <div v-if="status === 'idle'" class="text-center">
        <p class="text-gray-600 mb-4">准备就绪，点击按钮开始生成剧本</p>
        <button
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          @click="handleConvert"
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
          @click="reset"
        >
          重新转换
        </button>
      </div>

      <div v-else-if="status === 'error'" class="text-center space-y-4">
        <p class="text-red-600">{{ errorMessage }}</p>
        <button
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          @click="reset"
        >
          重试
        </button>
      </div>
    </template>
  </div>
</template>
