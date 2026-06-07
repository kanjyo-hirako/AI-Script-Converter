<script setup lang="ts">
import { computed } from 'vue'
import type { Character, Location, Scene } from '../../../shared/types'

const props = defineProps<{
  characters: Character[]
  locations: Location[]
  scenes: Scene[]
}>()

const locationMap = computed(() => new Map(props.locations.map(l => [l.id, l])))
const characterMap = computed(() => new Map(props.characters.map(c => [c.id, c])))

const roleLabels: Record<string, string> = {
  protagonist: '主角',
  antagonist: '反派',
  supporting: '配角',
  minor: '龙套',
}
</script>

<template>
  <div class="formatted-preview font-mono text-sm leading-relaxed p-8 max-w-3xl mx-auto">
    <!-- 角色表 -->
    <div v-if="characters.length" class="mb-10">
      <h2 class="text-center text-base font-bold mb-4 uppercase tracking-wider">角色表</h2>
      <div class="space-y-1 text-xs">
        <div v-for="c in characters" :key="c.id" class="flex gap-4">
          <span class="w-16 text-gray-400">{{ c.id }}</span>
          <span class="font-bold w-24">{{ c.name }}</span>
          <span class="text-gray-500 w-12">{{ roleLabels[c.role] || c.role }}</span>
          <span class="text-gray-600 flex-1">{{ c.description }}</span>
        </div>
      </div>
      <hr class="my-6 border-gray-300" />
    </div>

    <!-- 场景列表 -->
    <div v-for="scene in scenes" :key="scene.id" class="mb-8">
      <!-- 场景标题 -->
      <div class="font-bold text-center uppercase tracking-wide mb-4 text-base">
        {{ scene.heading || `INT. ${locationMap.get(scene.location_id)?.name || ''} - ${scene.time_of_day}` }}
      </div>

      <!-- 场景内容 -->
      <template v-for="(item, i) in scene.content" :key="i">
        <!-- 动作描写 -->
        <p v-if="item.type === 'action'" class="my-3">
          {{ item.text }}
        </p>

        <!-- 对话 -->
        <template v-else-if="item.type === 'dialogue'">
          <div class="mt-4 text-center">
            <span class="font-bold uppercase tracking-wide">
              {{ characterMap.get(item.character_id || '')?.name || item.character_id || '未知' }}
            </span>
          </div>
          <div v-if="item.parenthetical" class="text-center italic text-gray-500">
            ({{ item.parenthetical }})
          </div>
          <div class="mx-auto max-w-[60%] text-center my-1">
            {{ item.text }}
          </div>
        </template>

        <!-- 转场 -->
        <div v-else-if="item.type === 'transition'" class="text-right uppercase my-3 text-gray-500">
          {{ item.text }}
        </div>

        <!-- 注释 -->
        <div v-else-if="item.type === 'note'" class="italic text-gray-400 text-xs my-2 border-l-2 border-gray-300 pl-3">
          {{ item.text }}
        </div>
      </template>
    </div>

    <div v-if="!scenes.length" class="text-center text-gray-400 py-12">
      暂无场景数据
    </div>
  </div>
</template>
