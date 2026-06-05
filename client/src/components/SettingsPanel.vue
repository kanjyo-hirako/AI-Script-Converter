<script setup lang="ts">
import { useSettings } from '../composables/useSettings'
import { MODEL_PROVIDERS } from '../../../shared/providers'

const { settings, setProvider } = useSettings()

const providerOptions = Object.entries(MODEL_PROVIDERS).map(([key, p]) => ({
  key,
  label: p.name,
}))

const currentProvider = () => MODEL_PROVIDERS[settings.providerKey] ?? MODEL_PROVIDERS.siliconflow
const isCustom = () => settings.providerKey === 'custom'
</script>

<template>
  <div class="max-w-xl mx-auto space-y-6">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">模型提供商</label>
      <select
        :value="settings.providerKey"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        @change="setProvider(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="p in providerOptions" :key="p.key" :value="p.key">
          {{ p.label }}
        </option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
      <input
        v-model="settings.apiKey"
        type="password"
        placeholder="输入你的 API Key"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <p class="text-xs text-gray-400 mt-1">密钥仅存储在浏览器本地，不会上传到任何服务器</p>
    </div>

    <div v-if="isCustom()">
      <label class="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
      <input
        v-model="settings.baseURL"
        type="text"
        placeholder="https://api.example.com/v1"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">模型</label>
      <select
        v-if="!isCustom()"
        v-model="settings.model"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option v-for="m in currentProvider().models" :key="m" :value="m">
          {{ m }}
        </option>
      </select>
      <input
        v-else
        v-model="settings.model"
        type="text"
        placeholder="输入模型名称"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>

    <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
      <p><span class="font-medium">当前配置：</span></p>
      <p class="mt-1">提供商：{{ currentProvider().name }}</p>
      <p>地址：{{ settings.baseURL || '未设置' }}</p>
      <p>模型：{{ settings.model || '未设置' }}</p>
      <p>API Key：{{ settings.apiKey ? '已填写' : '未填写' }}</p>
    </div>
  </div>
</template>
