<script setup lang="ts">
import type { Character } from '../../../shared/types'

const props = defineProps<{
  characters: Character[]
}>()

const emit = defineEmits<{
  jumpToCharacter: [id: string]
}>()

const roleLabels: Record<string, string> = {
  protagonist: '主角',
  antagonist: '反派',
  supporting: '配角',
  minor: '龙套',
}

const roleColors: Record<string, string> = {
  protagonist: 'bg-indigo-100 text-indigo-700',
  antagonist: 'bg-red-100 text-red-700',
  supporting: 'bg-emerald-100 text-emerald-700',
  minor: 'bg-gray-100 text-gray-600',
}
</script>

<template>
  <div class="space-y-1">
    <div v-if="characters.length === 0" class="text-sm text-gray-400 py-4 text-center">
      暂无角色数据
    </div>
    <button
      v-for="c in characters"
      :key="c.id"
      class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
      @click="emit('jumpToCharacter', c.id)"
    >
      <div class="flex items-center gap-2">
        <span class="font-medium text-sm text-gray-800">{{ c.name }}</span>
        <span
          :class="['text-xs px-1.5 py-0.5 rounded', roleColors[c.role] ?? 'bg-gray-100 text-gray-600']"
        >
          {{ roleLabels[c.role] ?? c.role }}
        </span>
      </div>
      <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ c.description }}</p>
    </button>
  </div>
</template>
