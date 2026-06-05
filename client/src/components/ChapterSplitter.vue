<script setup lang="ts">
import { computed } from 'vue'
import { splitChapters } from '../lib/chapterSplitter'

const props = defineProps<{ text: string }>()

const chapters = computed(() => splitChapters(props.text))

const previewLength = 200

function preview(content: string): string {
  return content.length > previewLength
    ? content.slice(0, previewLength) + '...'
    : content
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-4">
    <div v-if="!text" class="text-gray-400 text-sm">请先在「输入」步骤中粘贴或上传小说文本</div>

    <template v-else>
      <div class="text-sm text-gray-600">
        识别到 <span class="font-bold text-indigo-600">{{ chapters.length }}</span> 个章节
      </div>

      <div class="space-y-3">
        <div
          v-for="ch in chapters"
          :key="ch.index"
          class="border border-gray-200 rounded-lg overflow-hidden"
        >
          <div class="bg-gray-50 px-4 py-2 flex items-center justify-between">
            <span class="font-medium text-sm text-gray-800">{{ ch.title }}</span>
            <span class="text-xs text-gray-400">{{ ch.content.length }} 字</span>
          </div>
          <div class="px-4 py-3 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {{ preview(ch.content) }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
