<template>
  <div
    class="stat-card"
    :class="[type, { clickable: clickable }]"
    @click="handleClick"
    :aria-label="`${label}: ${value}`"
    role="region"
  >
    <div class="stat-icon" :style="iconStyle">
      <i class="material-icons-outlined">{{ computedIcon }}</i>
    </div>
    <div class="stat-content">
      <div class="stat-value">{{ formattedValue }}</div>
      <div class="stat-label">{{ label }}</div>
      <div v-if="description" class="stat-description">{{ description }}</div>
    </div>
    <div v-if="$slots.action" class="stat-action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (val) =>
      [
        'default',
        'overdue',
        'high-priority',
        'today',
        'completed',
        'custom',
      ].includes(val),
  },
  icon: {
    type: String,
    default: 'info',
  },
  value: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  description: String,
  clickable: {
    type: Boolean,
    default: true,
  },
  iconColor: String,
  iconBg: String,
  borderColor: String,
  formatValue: {
    type: Function,
    default: (value) => value,
  },
})

const emit = defineEmits(['click'])

const computedIcon = computed(() => {
  const icons = {
    overdue: 'warning',
    'high-priority': 'priority_high',
    today: 'event_available',
    completed: 'check_circle',
    default: props.icon,
  }
  return icons[props.type] || props.icon
})

const iconStyle = computed(() => ({
  '--icon-color': props.iconColor || `var(--${props.type}-color)`,
  '--icon-bg': props.iconBg || `var(--${props.type}-bg)`,
}))

const formattedValue = computed(() => props.formatValue(props.value))

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style lang="scss" scoped>
.stat-card {
  --border-color: var(--border);
  --icon-color: var(--primary);
  --icon-bg: var(--primary-bg);

  position: relative;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: 16px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  transition: all 0.3s var(--ease-out);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--border-color);
  min-height: 80px;

  &.clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: var(--icon-bg);
    color: var(--icon-color);

    .material-icons-outlined {
      font-size: 22px;
    }
  }

  .stat-content {
    min-width: 0;

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 4px;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stat-label {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      font-weight: 500;
      line-height: 1.3;
    }

    .stat-description {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin-top: 4px;
      line-height: 1.3;
    }
  }

  .stat-action {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  // Типы карточек
  &.overdue {
    --border-color: var(--error);
    --icon-color: var(--error);
    --icon-bg: var(--error-bg);
  }

  &.high-priority {
    --border-color: var(--warning);
    --icon-color: var(--warning);
    --icon-bg: var(--warning-bg);
  }

  &.today {
    --border-color: var(--info);
    --icon-color: var(--info);
    --icon-bg: var(--info-bg);
  }

  &.completed {
    --border-color: var(--success);
    --icon-color: var(--success);
    --icon-bg: var(--success-bg);
  }

  &.custom {
    // Кастомные стили через пропсы
  }
}

// Адаптивные стили
@media (max-width: 1024px) {
  .stat-card {
    padding: 14px;
    gap: 10px;
    min-height: 76px;

    .stat-icon {
      width: 40px;
      height: 40px;

      .material-icons-outlined {
        font-size: 20px;
      }
    }

    .stat-content {
      .stat-value {
        font-size: 1.1rem;
      }
    }
  }
}

@media (max-width: 768px) {
  .stat-card {
    grid-template-columns: auto 1fr;
    gap: 12px 8px;

    .stat-action {
      grid-column: 1 / -1;
      justify-content: flex-start;
      margin-top: 4px;
    }
  }
}

@media (max-width: 480px) {
  .stat-card {
    padding: 12px;
    min-height: 72px;

    .stat-icon {
      width: 36px;
      height: 36px;

      .material-icons-outlined {
        font-size: 18px;
      }
    }

    .stat-content {
      .stat-value {
        font-size: 1rem;
      }

      .stat-label {
        font-size: 0.75rem;
      }
    }
  }
}
</style>
