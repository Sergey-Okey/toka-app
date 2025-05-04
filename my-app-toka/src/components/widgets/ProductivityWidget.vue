<template>
  <div class="productivity-widget widget-card">
    <div class="widget-header">
      <h2 class="widget-title">Продуктивность</h2>
      <div class="period-selector">
        <button
          v-for="period in periods"
          :key="period.value"
          class="period-btn"
          :class="{ active: activePeriodLocal === period.value }"
          @click="changePeriod(period.value)"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <div class="productivity-content">
      <div class="circular-progress">
        <svg class="progress-ring" viewBox="0 0 100 100">
          <circle
            class="progress-ring-bg"
            stroke="var(--border)"
            stroke-width="8"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          <circle
            class="progress-ring-fill"
            :stroke="percentageColor"
            stroke-width="8"
            stroke-linecap="round"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
        </svg>
        <div class="progress-value">{{ percentage }}%</div>
      </div>

      <div class="productivity-stats">
        <div class="stat-item">
          <span class="stat-number">{{ completed }}</span>
          <span class="stat-label">Выполнено</span>
        </div>
        <div class="divider"></div>
        <div class="stat-item">
          <span class="stat-number">{{ total }}</span>
          <span class="stat-label">Всего задач</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  activePeriod: {
    type: String,
    default: 'week',
  },
})

const emit = defineEmits(['period-change'])

const activePeriodLocal = ref(props.activePeriod)

watch(
  () => props.activePeriod,
  (newVal) => {
    activePeriodLocal.value = newVal
  }
)

const changePeriod = (value) => {
  if (activePeriodLocal.value !== value) {
    activePeriodLocal.value = value
    emit('period-change', value)
  }
}

const periods = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
]

const circumference = 2 * Math.PI * 40
const dashOffset = computed(
  () => circumference - (props.percentage / 100) * circumference
)

const percentageColor = computed(() => {
  if (props.percentage >= 80) return 'var(--success)'
  if (props.percentage >= 50) return 'var(--warning)'
  return 'var(--error)'
})
</script>

<style scoped lang="scss">
.productivity-widget {
  --progress-size: 120px;

  .widget-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    @media (max-width: 480px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .widget-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .period-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: 4px;

    @media (max-width: 480px) {
      width: 100%;
    }
  }

  .period-btn {
    border: none;
    background: transparent;
    padding: 8px 16px;
    border-radius: var(--radius-md);
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s var(--ease-out);
    color: var(--text-secondary);

    &.active {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      font-weight: 600;
    }

    &:hover:not(.active) {
      background: var(--bg-tertiary);
    }

    @media (max-width: 480px) {
      flex: 1 1 auto;
      text-align: center;
    }
  }

  .productivity-content {
    display: flex;
    align-items: center;
    gap: 24px;

    @media (max-width: 480px) {
      flex-direction: column;
      gap: 16px;
    }
  }

  .circular-progress {
    position: relative;
    width: var(--progress-size);
    height: var(--progress-size);
    flex-shrink: 0;

    @media (max-width: 380px) {
      --progress-size: 90px;
    }
  }

  .progress-ring {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .progress-value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--text-primary);

    @media (max-width: 380px) {
      font-size: 1.3rem;
    }
  }

  .productivity-stats {
    flex-grow: 1;
    display: flex;
    justify-content: space-around;
    gap: 16px;

    @media (max-width: 480px) {
      width: 100%;
    }
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .stat-number {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--text-primary);

    @media (max-width: 380px) {
      font-size: 1.2rem;
    }
  }

  .stat-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-align: center;
  }

  .divider {
    width: 1px;
    background: var(--border);
  }
}
</style>
