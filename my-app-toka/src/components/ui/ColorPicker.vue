<template>
  <input type="color" :value="modelValue" @input="onInput" class="color-input" />
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits(['update:modelValue'])

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
}
</script>

<style scoped>
.color-input {
  width: 24px;
  height: 24px;
  border: none;
  padding: 0;
  background: none;
  cursor: pointer;
}
</style> 