<script setup lang="ts">
import { computed } from 'vue'
import YamlEditor from './YamlEditor.vue'

const props = defineProps<{
  yamlContent: string
  status: 'idle' | 'converting' | 'done' | 'error'
}>()

const readOnly = computed(() => props.status === 'converting')

function handleExport() {
  const blob = new Blob([props.yamlContent], { type: 'text/yaml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'screenplay.yaml'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div v-if="status === 'idle'" class="flex-1 flex items-center justify-center text-gray-400">
      <p>完成「生成」步骤后，剧本 YAML 将在此处显示</p>
    </div>

    <div v-else-if="status === 'converting'" class="flex-1 flex items-center justify-center text-gray-500 gap-3">
      <div class="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p>正在生成剧本...</p>
    </div>

    <div v-else-if="status === 'error'" class="flex-1 flex items-center justify-center text-red-500">
      <p>生成失败，请返回「生成」步骤重试</p>
    </div>

    <template v-else-if="status === 'done'">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-gray-500">剧本 YAML 编辑器</span>
        <button
          class="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          @click="handleExport"
        >
          导出 .yaml
        </button>
      </div>
      <div class="flex-1 border border-gray-200 rounded-lg overflow-hidden">
        <YamlEditor :model-value="yamlContent" :read-only="readOnly" />
      </div>
    </template>
  </div>
</template>
