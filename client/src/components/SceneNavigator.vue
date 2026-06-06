<script setup lang="ts">
import type { Scene } from '../../../shared/types'

const props = defineProps<{
  scenes: Scene[]
}>()

const emit = defineEmits<{
  jumpToScene: [id: string]
}>()
</script>

<template>
  <div class="space-y-1">
    <div class="text-xs text-gray-400 px-3 pb-1">
      共 {{ scenes.length }} 个场景
    </div>
    <div v-if="scenes.length === 0" class="text-sm text-gray-400 py-4 text-center">
      暂无场景数据
    </div>
    <button
      v-for="(s, i) in scenes"
      :key="s.id"
      class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      @click="emit('jumpToScene', s.id)"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono text-gray-400">{{ s.id }}</span>
        <span class="text-sm font-medium text-gray-800 truncate">{{ s.heading }}</span>
      </div>
      <div class="flex items-center gap-2 mt-0.5">
        <span class="text-xs text-gray-500">第{{ s.chapter_ref }}章</span>
        <span class="text-xs text-gray-400">{{ s.time_of_day }}</span>
      </div>
    </button>
  </div>
</template>
