<template>
  <div class="productivity-widget widget">
    <div class="widget-header">
      <h3 class="widget-title">
        <i class="material-icons-outlined">trending_up</i>
        Ваша продуктивность
      </h3>
      <div class="period-selector">
        <button
          v-for="period in periods"
          :key="period.value"
          @click="$emit('period-change', period.value)"
          :class="{ active: activePeriod === period.value }"
          class="period-btn"
        >
          {{ period.label }}
        </button>
      </div>
    </div>
    <div class="productivity-content">
      <div class="progress-wrapper">
        <div class="progress-container">
          <ProgressCircle
            :percentage="percentage"
            :color="computedColor"
            :stroke-width="8"
            :size="progressSize"
          />
          <div class="progress-label" :style="{ color: computedColor }">
            {{ percentage }}%
          </div>
        </div>
      </div>
      <div class="stats-wrapper">
        <div class="tasks-count">
          <div class="count-item">
            <span class="count-value completed">{{ completed }}</span>
            <span class="count-label">выполнено</span>
          </div>
          <div class="count-separator">из</div>
          <div class="count-item">
            <span class="count-value total">{{ total }}</span>
            <span class="count-label">всего</span>
          </div>
        </div>
        <div v-if="showTrend" class="trend-indicator" :class="trendDirection">
          <i class="material-icons-outlined">{{ trendIcon }}</i>
          <span>{{ Math.abs(trendPercentage) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProgressCircle from '@/components/ui/ProgressCircle.vue'

const props = defineProps({
  percentage: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100,
  },
  completed: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  activePeriod: {
    type: String,
    default: 'week',
  },
  color: {
    type: String,
    default: '',
  },
  periods: {
    type: Array,
    default: () => [
      { label: 'День', value: 'day' },
      { label: 'Неделя', value: 'week' },
      { label: 'Месяц', value: 'month' },
    ],
  },
  trendPercentage: {
    type: Number,
    default: 0,
  },
  showTrend: {
    type: Boolean,
    default: true,
  },
})

const computedColor = computed(() => props.color || 'var(--primary)')
const progressSize = computed(() => {
  if (window.innerWidth < 480) return 120
  if (window.innerWidth < 768) return 140
  return 160
})

const trendDirection = computed(() => {
  if (props.trendPercentage > 0) return 'positive'
  if (props.trendPercentage < 0) return 'negative'
  return 'neutral'
})

const trendIcon = computed(() => {
  switch (trendDirection.value) {
    case 'positive':
      return 'trending_up'
    case 'negative':
      return 'trending_down'
    default:
      return 'remove'
  }
})
</script>

<style lang="scss" scoped>
.productivity-widget {
  display: flex;
  flex-direction: column;
  height: 100%;

  .widget-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;

    @media (min-width: 640px) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .widget-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;

    .material-icons-outlined {
      color: var(--primary);
      font-size: 1.25rem;
      flex-shrink: 0;
    }
  }

  .productivity-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    flex: 1;
    justify-content: center;

    @media (min-width: 640px) {
      flex-direction: row;
      align-items: center;
      gap: 32px;
    }
  }

  .progress-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .progress-container {
    position: relative;
    width: v-bind('progressSize + "px"');
    height: v-bind('progressSize + "px"');
    flex-shrink: 0;
  }

  .progress-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;

    @media (min-width: 640px) {
      font-size: 2.25rem;
    }

    @media (min-width: 1024px) {
      font-size: 2.5rem;
    }
  }

  .stats-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;

    @media (min-width: 640px) {
      align-items: flex-start;
      max-width: 200px;
    }
  }

  .tasks-count {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;

    @media (min-width: 640px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }
  }

  .count-item {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .count-separator {
    color: var(--text-secondary);
    font-size: 0.875rem;

    @media (min-width: 640px) {
      display: none;
    }
  }

  .count-value {
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1;

    &.completed {
      color: var(--success);
    }

    &.total {
      color: var(--info);
    }
  }

  .count-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .trend-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    width: fit-content;

    &.positive {
      background-color: rgba(var(--success-rgb), 0.1);
      color: var(--success);

      .material-icons-outlined {
        color: var(--success);
      }
    }

    &.negative {
      background-color: rgba(var(--error-rgb), 0.1);
      color: var(--error);

      .material-icons-outlined {
        color: var(--error);
      }
    }

    &.neutral {
      background-color: var(--bg-secondary);
      color: var(--text-secondary);
    }

    .material-icons-outlined {
      font-size: 1.125rem;
    }
  }
}

.period-selector {
  display: flex;
  gap: 6px;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-sm);
  padding: 4px;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;

  @media (min-width: 640px) {
    width: auto;
    flex-wrap: nowrap;
  }
}

.period-btn {
  padding: 6px 12px;
  border-radius: calc(var(--radius-sm) - 2px);
  background-color: transparent;
  color: var(--text-secondary);
  border: none;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s var(--ease-out);
  white-space: nowrap;
  flex: 1;
  text-align: center;
  min-width: 60px;

  &:hover {
    background-color: var(--bg-tertiary);
  }

  &.active {
    background-color: var(--primary);
    color: white;
  }

  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  @media (min-width: 640px) {
    flex: none;
    padding: 6px 12px;
  }
}
</style>
