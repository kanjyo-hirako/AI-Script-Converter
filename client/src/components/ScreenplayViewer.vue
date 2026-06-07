<script setup lang="ts">
import { ref, computed } from 'vue'
import * as YAML from 'yaml'
import YamlEditor from './YamlEditor.vue'
import CharacterPanel from './CharacterPanel.vue'
import SceneNavigator from './SceneNavigator.vue'
import { toFountain } from '../lib/fountainExporter'
import type { Character, Location, Scene } from '../../../shared/types'

const props = defineProps<{
  yamlContent: string
  status: 'idle' | 'converting' | 'done' | 'error' | 'cancelled'
  characters: Character[]
  locations: Location[]
  scenes: Scene[]
}>()

const emit = defineEmits<{
  'import-yaml': [data: { characters: Character[]; locations: Location[]; scenes: Scene[] }]
}>()

const readOnly = computed(() => props.status === 'converting')
const editorRef = ref<InstanceType<typeof YamlEditor>>()
const importInputRef = ref<HTMLInputElement>()
const showExportMenu = ref(false)

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

function download(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function handleExportYaml() {
  download(props.yamlContent, 'screenplay.yaml', 'text/yaml;charset=utf-8')
  showExportMenu.value = false
}

function handleExportFountain() {
  const fountain = toFountain(props.characters, props.locations, props.scenes)
  download(fountain, 'screenplay.fountain', 'text/plain;charset=utf-8')
  showExportMenu.value = false
}

function handleExportPdf() {
  showExportMenu.value = false
  const locationMap = new Map(props.locations.map(l => [l.id, l]))
  const characterMap = new Map(props.characters.map(c => [c.id, c.name]))

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>剧本</title><style>
    @page { margin: 2.5cm; }
    body { font-family: 'Courier New', monospace; font-size: 12pt; line-height: 1.5; color: #000; }
    .scene-heading { font-weight: bold; margin: 24pt 0 12pt; text-transform: uppercase; }
    .action { margin: 12pt 0; }
    .character { text-align: center; margin: 12pt 0 0; text-transform: uppercase; font-weight: bold; }
    .parenthetical { text-align: center; font-style: italic; margin: 0; }
    .dialogue { margin: 0 auto; max-width: 60%; text-align: center; }
    .transition { text-align: right; margin: 12pt 0; text-transform: uppercase; }
    .note { color: #666; font-style: italic; margin: 6pt 0; }
  </style></head><body>`

  for (const scene of props.scenes) {
    const location = locationMap.get(scene.location_id)
    const heading = scene.heading || `INT. ${location?.name || ''} - ${scene.time_of_day}`
    html += `<div class="scene-heading">${heading}</div>`

    for (const item of scene.content) {
      const escaped = item.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      switch (item.type) {
        case 'action':
          html += `<div class="action">${escaped}</div>`
          break
        case 'dialogue': {
          const name = characterMap.get(item.character_id || '') || item.character_id || ''
          html += `<div class="character">${name}</div>`
          if (item.parenthetical) html += `<div class="parenthetical">(${item.parenthetical})</div>`
          html += `<div class="dialogue">${escaped}</div>`
          break
        }
        case 'transition':
          html += `<div class="transition">${escaped}</div>`
          break
        case 'note':
          html += `<div class="note">${escaped}</div>`
          break
      }
    }
  }

  html += '</body></html>'
  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
    w.onload = () => { w.print() }
  }
}

function handleImportClick() {
  importInputRef.value?.click()
}

function handleImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const parsed = YAML.parse(reader.result as string)
      const data = parsed.screenplay || parsed
      emit('import-yaml', {
        characters: data.characters || [],
        locations: data.locations || [],
        scenes: data.scenes || [],
      })
    } catch {
      alert('YAML 解析失败，请检查文件格式')
    }
    input.value = ''
  }
  reader.readAsText(file)
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
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 bg-white text-gray-600 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            @click="handleImportClick"
          >
            导入 .yaml
          </button>
          <input ref="importInputRef" type="file" accept=".yaml,.yml" class="hidden" @change="handleImportFile" />
          <div class="relative">
            <button
              class="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
              @click="showExportMenu = !showExportMenu"
            >
              导出
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div
              v-if="showExportMenu"
              class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 w-36"
            >
              <button class="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50" @click="handleExportYaml">.yaml</button>
              <button class="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50" @click="handleExportFountain">.fountain</button>
              <button class="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50" @click="handleExportPdf">.pdf (打印)</button>
            </div>
          </div>
        </div>
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
