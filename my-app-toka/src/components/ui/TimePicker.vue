<template>
  <div class="time-picker">
    <select v-model="hours" class="time-select">
      <option v-for="h in 24" :key="h" :value="h - 1">{{ h - 1 }}</option>
    </select>
    <span class="time-separator">ч</span>

    <select v-model="minutes" class="time-select">
      <option v-for="m in 60" :key="m" :value="m - 1">{{ m - 1 }}</option>
    </select>
    <span class="time-separator">м</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits(['update:modelValue'])

const totalMinutes = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const hours = computed({
  get: () => Math.floor(totalMinutes.value / 60),
  set: (val) => (totalMinutes.value = val * 60 + minutes.value),
})

const minutes = computed({
  get: () => totalMinutes.value % 60,
  set: (val) => (totalMinutes.value = hours.value * 60 + val),
})
</script>

<style lang="scss" scoped>
.time-picker {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.time-select {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
}

.time-separator {
  color: var(--text-secondary);
  font-size: var(--text-sm);
}
</style>
