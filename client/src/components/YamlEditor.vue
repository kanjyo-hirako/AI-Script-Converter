<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps<{
  modelValue: string
  readOnly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const containerRef = ref<HTMLDivElement>()
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor>()

onMounted(() => {
  if (!containerRef.value) return

  editor.value = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: 'yaml',
    theme: 'vs',
    readOnly: props.readOnly ?? false,
    minimap: { enabled: false },
    lineNumbers: 'on',
    folding: true,
    foldingStrategy: 'indentation',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    automaticLayout: true,
    tabSize: 2,
    fontSize: 14,
    lineDecorationsWidth: 8,
    renderLineHighlight: 'line',
  })

  editor.value.onDidChangeModelContent(() => {
    const val = editor.value?.getValue() ?? ''
    emit('update:modelValue', val)
  })
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (editor.value && editor.value.getValue() !== newVal) {
      editor.value.setValue(newVal)
    }
  }
)

watch(
  () => props.readOnly,
  (ro) => {
    editor.value?.updateOptions({ readOnly: ro ?? false })
  }
)

onBeforeUnmount(() => {
  editor.value?.dispose()
})

function goToLine(line: number) {
  if (!editor.value) return
  editor.value.revealLineInCenter(line)
  editor.value.setPosition({ lineNumber: line, column: 1 })
  editor.value.focus()
}

defineExpose({ goToLine })
</script>

<template>
  <div ref="containerRef" class="w-full h-full min-h-[400px]" />
</template>
