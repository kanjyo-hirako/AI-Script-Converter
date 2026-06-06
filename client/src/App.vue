<script setup lang="ts">
import { ref, computed } from 'vue'
import * as YAML from 'yaml'
import SettingsPanel from './components/SettingsPanel.vue'
import NovelInput from './components/NovelInput.vue'
import ChapterSplitter from './components/ChapterSplitter.vue'
import ConvertPanel from './components/ConvertPanel.vue'
import ScreenplayViewer from './components/ScreenplayViewer.vue'
import { useConversion } from './composables/useConversion'

const currentStep = ref<'settings' | 'input' | 'split' | 'convert' | 'edit'>('settings')
const novelText = ref('')

const conversion = useConversion()

const yamlContent = computed(() => {
  if (conversion.status.value !== 'done') return ''
  return YAML.stringify(
    {
      screenplay: {
        characters: conversion.result.value.characters,
        locations: conversion.result.value.locations,
        scenes: conversion.result.value.scenes,
      },
    },
    { indent: 2 }
  )
})

const steps = [
  { key: 'settings', label: '设置' },
  { key: 'input', label: '输入' },
  { key: 'split', label: '分章' },
  { key: 'convert', label: '生成' },
  { key: 'edit', label: '编辑' },
] as const
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <h1 class="text-xl font-bold text-gray-900">AI 小说转剧本工具</h1>
      <p class="text-sm text-gray-500 mt-1">将中文小说自动转换为结构化 YAML 剧本</p>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex gap-2 mb-8">
        <button
          v-for="step in steps"
          :key="step.key"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            currentStep === step.key
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100',
          ]"
          @click="currentStep = step.key"
        >
          {{ step.label }}
        </button>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <SettingsPanel v-if="currentStep === 'settings'" />
        <NovelInput v-else-if="currentStep === 'input'" @update:text="novelText = $event" />
        <ChapterSplitter v-else-if="currentStep === 'split'" :text="novelText" />
        <ConvertPanel
          v-else-if="currentStep === 'convert'"
          :text="novelText"
          :status="conversion.status.value"
          :progress="conversion.progress.value"
          :error-message="conversion.errorMessage.value"
          @convert="conversion.convert(novelText)"
          @reset="conversion.reset()"
        />
        <ScreenplayViewer
          v-else
          :yaml-content="yamlContent"
          :status="conversion.status.value"
          :characters="conversion.result.value.characters"
          :scenes="conversion.result.value.scenes"
        />
      </div>
    </main>
  </div>
</template>
