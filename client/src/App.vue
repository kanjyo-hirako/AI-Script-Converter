<script setup lang="ts">
import { ref, computed } from 'vue'
import * as YAML from 'yaml'
import SettingsPanel from './components/SettingsPanel.vue'
import NovelInput from './components/NovelInput.vue'
import ChapterSplitter from './components/ChapterSplitter.vue'
import ConvertPanel from './components/ConvertPanel.vue'
import ScreenplayViewer from './components/ScreenplayViewer.vue'
import { useConversion } from './composables/useConversion'

const currentStep = ref<'input' | 'split' | 'convert' | 'edit' | 'settings'>('input')
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
  { key: 'input', label: '输入', num: '1' },
  { key: 'split', label: '分章', num: '2' },
  { key: 'convert', label: '生成', num: '3' },
  { key: 'edit', label: '编辑', num: '4' },
  { key: 'settings', label: '设置', num: '5' },
] as const

function stepIndex(key: string) {
  return steps.findIndex(s => s.key === key)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <!-- 顶部渐变装饰条 -->
    <div class="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

    <header class="bg-white border-b border-gray-200 px-6 py-5">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-xl font-bold text-gray-900">AI 小说转剧本工具</h1>
        <p class="text-sm text-gray-500 mt-1">将中文小说自动转换为结构化 YAML 剧本</p>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <!-- 步骤导航 -->
      <nav class="flex items-center gap-1 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2">
        <template v-for="(step, i) in steps" :key="step.key">
          <button
            :class="[
              'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              currentStep === step.key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : stepIndex(step.key) < stepIndex(currentStep)
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50',
            ]"
            @click="currentStep = step.key"
          >
            <span
              :class="[
                'w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold shrink-0',
                currentStep === step.key
                  ? 'bg-white text-indigo-600'
                  : stepIndex(step.key) < stepIndex(currentStep)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-500',
              ]"
            >{{ step.num }}</span>
            <span>{{ step.label }}</span>
          </button>
          <div
            v-if="i < steps.length - 1"
            :class="[
              'hidden sm:block w-8 h-px shrink-0',
              stepIndex(steps[i + 1].key) <= stepIndex(currentStep) ? 'bg-indigo-300' : 'bg-gray-200',
            ]"
          />
        </template>
      </nav>

      <!-- 主内容区 -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <NovelInput v-if="currentStep === 'input'" @update:text="novelText = $event" />
        <ChapterSplitter v-else-if="currentStep === 'split'" :text="novelText" />
        <ConvertPanel
          v-else-if="currentStep === 'convert'"
          :text="novelText"
          :status="conversion.status.value"
          :progress="conversion.progress.value"
          :error-message="conversion.errorMessage.value"
          :error-code="conversion.errorCode.value"
          @convert="conversion.convert(novelText)"
          @retry="conversion.retry(novelText)"
          @reset="conversion.reset()"
        />
        <ScreenplayViewer
          v-else-if="currentStep === 'edit'"
          :yaml-content="yamlContent"
          :status="conversion.status.value"
          :characters="conversion.result.value.characters"
          :scenes="conversion.result.value.scenes"
        />
        <SettingsPanel v-else />
      </div>
    </main>
  </div>
</template>
