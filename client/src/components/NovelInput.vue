<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseFile } from '../lib/fileParser'

const emit = defineEmits<{
  (e: 'update:text', value: string): void
}>()

const text = ref('')
const fileName = ref('')
const error = ref('')

const charCount = computed(() => text.value.length)
const wordCount = computed(() => {
  if (!text.value) return 0
  return text.value.replace(/\s/g, '').length
})

function onInput(e: Event) {
  const val = (e.target as HTMLTextAreaElement).value
  text.value = val
  emit('update:text', val)
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  error.value = ''
  try {
    const content = await parseFile(file)
    text.value = content
    fileName.value = file.name
    emit('update:text', content)
  } catch (err: any) {
    error.value = err.message || '文件解析失败'
  }
  input.value = ''
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-4">
    <div class="flex items-center gap-4">
      <label
        class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        上传文件
        <input type="file" accept=".txt,.docx" class="hidden" @change="onFileChange" />
      </label>
      <span v-if="fileName" class="text-sm text-gray-500">{{ fileName }}</span>
      <span v-if="error" class="text-sm text-red-500">{{ error }}</span>
    </div>

    <textarea
      :value="text"
      rows="20"
      placeholder="在此粘贴小说文本..."
      class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
      @input="onInput"
    />

    <div class="flex gap-4 text-sm text-gray-500">
      <span>字数：{{ wordCount }}</span>
      <span>字符数：{{ charCount }}</span>
    </div>
  </div>
</template>
