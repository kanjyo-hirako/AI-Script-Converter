<script setup lang="ts">
import { ref } from 'vue'

const currentStep = ref<'settings' | 'input' | 'split' | 'convert' | 'edit'>('settings')
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
          v-for="step in [
            { key: 'settings', label: '设置' },
            { key: 'input', label: '输入' },
            { key: 'split', label: '分章' },
            { key: 'convert', label: '生成' },
            { key: 'edit', label: '编辑' },
          ]"
          :key="step.key"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            currentStep === step.key
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100',
          ]"
          @click="currentStep = step.key as typeof currentStep"
        >
          {{ step.label }}
        </button>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <p class="text-gray-500">项目已初始化，请开始构建各组件。</p>
      </div>
    </main>
  </div>
</template>
