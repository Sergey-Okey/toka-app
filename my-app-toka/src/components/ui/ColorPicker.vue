<template>
  <div class="color-picker-wrapper">
    <input
      type="color"
      :value="modelValue"
      @input="onInput"
      ref="colorInput"
      class="color-input-hidden"
    />
    <button
      type="button"
      class="color-button"
      :style="{ borderColor: modelValue, background: modelValue }"
      @click="openColorPicker"
      :aria-label="'Выбрать цвет'"
    >
      <svg class="palette-icon" viewBox="0 0 24 24" width="18" height="18" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="2" fill="none" />
        <circle cx="8" cy="10" r="1.5" fill="#fff" />
        <circle cx="16" cy="10" r="1.5" fill="#fff" />
        <circle cx="9" cy="15" r="1.5" fill="#fff" />
        <circle cx="15" cy="15" r="1.5" fill="#fff" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits(['update:modelValue'])
const colorInput = ref<HTMLInputElement | null>(null)

defineOptions({ name: 'ColorPicker' })

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
}

function openColorPicker() {
  colorInput.value?.click()
}
</script>

<style scoped>
.color-picker-wrapper {
  display: inline-flex;
  align-items: center;
}
.color-input-hidden {
  display: none;
}
.color-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--primary, #31a974);
  background: var(--bg-secondary, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  position: relative;
  outline: none;
}
.color-button:hover,
.color-button:focus {
  border-color: var(--primary, #31a974);
  box-shadow: 0 0 0 2px rgba(49, 169, 116, 0.15);
  background: #f6fefb;
}
.palette-icon {
  display: block;
  pointer-events: none;
}
</style>
