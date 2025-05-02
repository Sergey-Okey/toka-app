<template>
  <div class="time-metrics-widget widget">
    <div class="widget-header">
      <h3 class="widget-title">
        <i class="material-icons-outlined">schedule</i>
        Временные метрики
      </h3>
    </div>
    <div class="widget-content">
      <div class="metrics-grid">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="metric-card"
          :class="{ highlight: metric.highlight }"
        >
          <div class="metric-icon">
            <i class="material-icons-outlined">{{ metric.icon }}</i>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ formatTime(metric.value) }}</div>
            <div class="metric-label">{{ metric.label }}</div>
          </div>
        </div>
      </div>
      <div class="chart-container">
        <BarChart
          :data="chartData"
          :options="mergedChartOptions"
          :key="chartKey"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BarChart from '@/components/charts/BarChart.vue'

const props = defineProps({
  metrics: {
    type: Array,
    default: () => [
      {
        icon: 'timer',
        value: 0,
        label: 'Среднее время',
        highlight: true,
      },
      {
        icon: 'speed',
        value: 0,
        label: 'Самая быстрая',
      },
      {
        icon: 'hourglass_bottom',
        value: 0,
        label: 'Самая долгая',
      },
    ],
  },
  chartData: {
    type: Object,
    required: true,
  },
  chartOptions: {
    type: Object,
    default: () => ({}),
  },
})

const formatTime = (minutes) => {
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours} ч ${mins} мин`
}

const chartKey = computed(
  () => JSON.stringify(props.chartData) + JSON.stringify(props.chartOptions)
)

const mergedChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'var(--text-primary)',
        font: {
          family: "'Roboto', sans-serif",
          size: 12,
        },
        padding: 20,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: 'var(--bg-secondary)',
      titleColor: 'var(--text-primary)',
      bodyColor: 'var(--text-primary)',
      borderColor: 'var(--border)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 'var(--radius-sm)',
      displayColors: true,
    },
    ...props.chartOptions.plugins,
  },
  scales: {
    x: {
      grid: {
        color: 'var(--border)',
        drawBorder: false,
      },
      ticks: {
        color: 'var(--text-secondary)',
        font: {
          family: "'Roboto', sans-serif",
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'var(--border)',
        drawBorder: false,
      },
      ticks: {
        color: 'var(--text-secondary)',
        font: {
          family: "'Roboto', sans-serif",
          size: 11,
        },
        callback: function (value) {
          return value + (props.chartOptions?.yAxisSuffix || '')
        },
      },
    },
    ...props.chartOptions.scales,
  },
  ...props.chartOptions,
}))
</script>

<style lang="scss" scoped>
.time-metrics-widget {
  display: flex;
  flex-direction: column;
  height: 100%;

  .widget-header {
    margin-bottom: 20px;
  }

  .widget-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);

    .material-icons-outlined {
      color: var(--primary);
      font-size: 1.25rem;
    }
  }

  .widget-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex: 1;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  .metric-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);
    transition: all 0.3s var(--ease-out);
    border: 1px solid var(--border);

    &.highlight {
      border-left: 4px solid var(--primary);
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .metric-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      background-color: var(--info-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .material-icons-outlined {
        color: var(--info);
        font-size: 20px;
      }
    }

    .metric-info {
      flex: 1;
      min-width: 0;

      .metric-value {
        font-size: 1rem;
        font-weight: 600;
        line-height: 1.2;
        margin-bottom: 4px;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .metric-label {
        font-size: 0.8125rem;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .chart-container {
    flex: 1;
    min-height: 200px;
    max-height: 250px;
    width: 100%;
    position: relative;

    @media (max-width: 768px) {
      min-height: 180px;
      max-height: 220px;
    }

    @media (max-width: 480px) {
      min-height: 160px;
      max-height: 200px;
    }
  }
}
</style>
