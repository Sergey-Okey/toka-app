<template>
  <div class="time-metrics-widget widget-card">
    <div class="widget-header">
      <h2 class="widget-title">Временные метрики</h2>
    </div>

    <div class="metrics-grid">
      <div v-for="metric in metrics" :key="metric.label" class="metric-item">
        <div class="metric-icon">
          <i class="material-icons-outlined">{{ metric.icon }}</i>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-label">{{ metric.label }}</div>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  metrics: {
    type: Array,
    default: () => [],
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

const chartCanvas = ref(null)
const chartInstance = ref(null)

const initChart = () => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: props.chartData,
    options: {
      ...props.chartOptions,
      responsive: true,
      maintainAspectRatio: false,
    },
  })
}

watch(() => props.chartData, initChart, { deep: true })

onMounted(initChart)
onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
})
</script>

<style scoped lang="scss">
.time-metrics-widget {
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .metric-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .metric-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
    flex-shrink: 0;
  }

  .metric-content {
    display: flex;
    flex-direction: column;
  }

  .metric-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .metric-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .chart-container {
    position: relative;
    height: 200px;
    width: 100%;
  }
}
</style>
