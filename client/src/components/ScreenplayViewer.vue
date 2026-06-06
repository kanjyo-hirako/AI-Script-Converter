<script setup lang="ts">
import { ref, computed } from 'vue'
import YamlEditor from './YamlEditor.vue'
import CharacterPanel from './CharacterPanel.vue'
import SceneNavigator from './SceneNavigator.vue'
import type { Character, Scene } from '../../../shared/types'

const props = defineProps<{
  yamlContent: string
  status: 'idle' | 'converting' | 'done' | 'error'
  characters: Character[]
  scenes: Scene[]
}>()

const readOnly = computed(() => props.status === 'converting')
const editorRef = ref<InstanceType<typeof YamlEditor>>()

function findLineById(id: string): number {
  const lines = props.yamlContent.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`id: ${id}`) || lines[i].includes(`id: "${id}"`)) {
      return i + 1
    }
  }
  return 1
}

function handleJumpToCharacter(id: string) {
  editorRef.value?.goToLine(findLineById(id))
}

function handleJumpToScene(id: string) {
  editorRef.value?.goToLine(findLineById(id))
}

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
      <!-- 桌面端三栏布局，移动端堆叠 -->
      <div class="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
        <!-- 左侧：角色面板（桌面端侧边栏，移动端可折叠） -->
        <aside class="lg:w-56 shrink-0 border border-gray-200 rounded-lg overflow-y-auto max-h-48 lg:max-h-none">
          <div class="px-3 py-2 border-b border-gray-100 sticky top-0 bg-white">
            <h3 class="text-sm font-semibold text-gray-700">角色 ({{ characters.length }})</h3>
          </div>
          <div class="p-1">
            <CharacterPanel :characters="characters" @jump-to-character="handleJumpToCharacter" />
          </div>
        </aside>

        <!-- 中间：YAML 编辑器 -->
        <div class="flex-1 border border-gray-200 rounded-lg overflow-hidden min-w-0 min-h-[300px] lg:min-h-0">
          <YamlEditor ref="editorRef" :model-value="yamlContent" :read-only="readOnly" />
        </div>

        <!-- 右侧：场景导航（桌面端侧边栏，移动端可折叠） -->
        <aside class="lg:w-60 shrink-0 border border-gray-200 rounded-lg overflow-y-auto max-h-48 lg:max-h-none">
          <div class="px-3 py-2 border-b border-gray-100 sticky top-0 bg-white">
            <h3 class="text-sm font-semibold text-gray-700">场景</h3>
          </div>
          <div class="p-1">
            <SceneNavigator :scenes="scenes" @jump-to-scene="handleJumpToScene" />
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>
