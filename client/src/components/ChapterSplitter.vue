<script setup lang="ts">
import { ref, watch } from 'vue'
import { splitChapters } from '../lib/chapterSplitter'
import type { Chapter } from '../lib/chapterSplitter'

const props = defineProps<{ text: string }>()

const emit = defineEmits<{
  'update:chapters': [chapters: Chapter[]]
}>()

const customPattern = ref('')
const chapters = ref<Chapter[]>([])
const expandedIndex = ref<number | null>(null)
const showCustomInput = ref(false)

function recompute() {
  chapters.value = splitChapters(props.text, customPattern.value || undefined)
  emit('update:chapters', chapters.value)
}

watch(() => props.text, recompute, { immediate: true })
watch(customPattern, recompute)

function toggleSelect(index: number) {
  chapters.value[index].selected = !chapters.value[index].selected
  emit('update:chapters', chapters.value)
}

function toggleExpand(index: number) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

function selectAll() {
  chapters.value.forEach(ch => { ch.selected = true })
  emit('update:chapters', chapters.value)
}

function deselectAll() {
  chapters.value.forEach(ch => { ch.selected = false })
  emit('update:chapters', chapters.value)
}

function mergeWithNext(index: number) {
  if (index >= chapters.value.length - 1) return
  const current = chapters.value[index]
  const next = chapters.value[index + 1]
  current.content = current.content + '\n\n' + next.content
  current.title = current.title + ' + ' + next.title
  chapters.value.splice(index + 1, 1)
  emit('update:chapters', chapters.value)
}

const selectedCount = () => chapters.value.filter(ch => ch.selected).length
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-4">
    <div v-if="!text" class="text-gray-400 text-sm">请先在「输入」步骤中粘贴或上传小说文本</div>

    <template v-else>
      <!-- 顶部信息栏 -->
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-600">
          识别到 <span class="font-bold text-indigo-600">{{ chapters.length }}</span> 个章节，
          已选 <span class="font-bold text-indigo-600">{{ selectedCount() }}</span> 个
        </div>
        <div class="flex items-center gap-2">
          <button
            class="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
            @click="selectAll"
          >
            全选
          </button>
          <button
            class="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
            @click="deselectAll"
          >
            全不选
          </button>
          <button
            class="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
            :class="showCustomInput ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : ''"
            @click="showCustomInput = !showCustomInput"
          >
            自定义分隔符
          </button>
        </div>
      </div>

      <!-- 自定义分隔符输入 -->
      <div v-if="showCustomInput" class="flex items-center gap-2">
        <input
          v-model="customPattern"
          type="text"
          placeholder="输入正则表达式，如 ^\d+\.\s 或 ^Chapter \d+"
          class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
          @click="customPattern = ''"
        >
          重置
        </button>
      </div>

      <!-- 章节列表 -->
      <div class="space-y-2">
        <div
          v-for="(ch, i) in chapters"
          :key="i"
          class="border rounded-lg overflow-hidden transition-colors"
          :class="ch.selected ? 'border-gray-200' : 'border-gray-100 bg-gray-50/50'"
        >
          <div class="px-4 py-2 flex items-center gap-3">
            <!-- 勾选框 -->
            <input
              type="checkbox"
              :checked="ch.selected"
              class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
              @change="toggleSelect(i)"
            />
            <!-- 标题 -->
            <span
              class="flex-1 font-medium text-sm cursor-pointer"
              :class="ch.selected ? 'text-gray-800' : 'text-gray-400'"
              @click="toggleExpand(i)"
            >
              {{ ch.title }}
            </span>
            <span class="text-xs text-gray-400 shrink-0">{{ ch.content.length }} 字</span>
            <!-- 合并按钮 -->
            <button
              v-if="i < chapters.length - 1"
              class="text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 shrink-0"
              title="与下一章合并"
              @click="mergeWithNext(i)"
            >
              合并 ↓
            </button>
            <!-- 展开按钮 -->
            <button
              class="text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-400 hover:text-gray-600 shrink-0"
              @click="toggleExpand(i)"
            >
              {{ expandedIndex === i ? '收起' : '展开' }}
            </button>
          </div>
          <!-- 预览 / 全文 -->
          <div
            v-if="expandedIndex !== i"
            class="px-4 pb-3 text-sm text-gray-500 leading-relaxed whitespace-pre-wrap"
          >
            {{ ch.content.length > 200 ? ch.content.slice(0, 200) + '...' : ch.content }}
          </div>
          <div
            v-else
            class="px-4 pb-3 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto"
          >
            {{ ch.content }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
