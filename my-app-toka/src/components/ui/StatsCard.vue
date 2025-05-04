<template>
  <div
    class="stats-card"
    :class="[`type-${type}`, { clickable: $attrs.onClick }]"
    @click="$attrs.onClick && $emit('click')"
  >
    <div class="card-icon">
      <i class="material-icons-outlined">{{ icon }}</i>
    </div>
    <div class="card-content">
      <div class="card-value">{{ value }}</div>
      <div class="card-label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'default',
  },
  icon: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
})

defineEmits(['click'])
</script>

<style scoped lang="scss">
.stats-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s var(--ease-out);

  &.clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  &.type-overdue {
    --icon-bg: rgba(var(--error-rgb), 0.1);
    --text-color: var(--error);
  }

  &.type-high-priority {
    --icon-bg: rgba(var(--warning-rgb), 0.1);
    --text-color: var(--warning);
  }

  &.type-today {
    --icon-bg: rgba(var(--info-rgb), 0.1);
    --text-color: var(--info);
  }

  &.type-completed {
    --icon-bg: rgba(var(--success-rgb), 0.1);
    --text-color: var(--success);
  }

  .card-icon {
    width: var(--icon-size);
    height: var(--icon-size);
    border-radius: 50%;
    background: var(--icon-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--text-color);
  }

  .card-content {
    display: flex;
    flex-direction: column;
  }

  .card-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .card-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}
</style>
