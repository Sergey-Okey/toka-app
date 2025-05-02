<template>
  <div class="bar-chart-container">
    <canvas ref="chartCanvas" :aria-label="chartA11yLabel" role="img"></canvas>
    <div v-if="isLoading" class="chart-loading-overlay">
      <div class="chart-loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { Chart } from 'chart.js/auto'
import 'chartjs-plugin-datalabels'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    validator: (data) => Array.isArray(data.datasets),
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  isLoading: Boolean,
  aspectRatio: {
    type: Number,
    default: 2,
    validator: (value) => value > 0,
  },
  a11yLabel: String,
})

const emit = defineEmits(['chart-click'])

const chartCanvas = ref(null)
const chartInstance = ref(null)
const resizeObserver = ref(null)

const chartA11yLabel = computed(() => props.a11yLabel || 'График данных')

// Функция для преобразования CSS переменных в реальные значения
const resolveCssVariable = (value) => {
  if (value && value.startsWith('var(')) {
    const varName = value.replace(/var\(|\)/g, '')
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim()
  }
  return value
}

// Функция для преобразования rgba(var(--rgb), alpha) в правильный формат
const resolveRgba = (value) => {
  if (value && value.startsWith('rgba(var(')) {
    const matches = value.match(/rgba\(var\(([^)]+)\),\s*([^)]+)\)/)
    if (matches) {
      const rgb = resolveCssVariable(`var(${matches[1]})`)
      const alpha = matches[2]
      return `rgba(${rgb}, ${alpha})`
    }
  }
  return value
}

// Функция для обработки цветов в датасетах
const processDatasetColors = (dataset) => {
  const result = { ...dataset }

  // Обрабатываем основные цвета
  if (dataset.backgroundColor) {
    result.backgroundColor = resolveRgba(dataset.backgroundColor)
  }
  if (dataset.borderColor) {
    result.borderColor = resolveRgba(dataset.borderColor)
  }
  if (dataset.hoverBackgroundColor) {
    result.hoverBackgroundColor = resolveRgba(dataset.hoverBackgroundColor)
  }

  return result
}

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: props.aspectRatio,
  animation: {
    duration: 800,
    easing: 'easeOutQuart',
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: resolveCssVariable('var(--text-secondary)'),
        font: {
          family: "'Roboto', sans-serif",
          size: 12,
        },
        padding: 20,
        usePointStyle: true,
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: resolveCssVariable('var(--bg-secondary)'),
      titleColor: resolveCssVariable('var(--text-primary)'),
      bodyColor: resolveCssVariable('var(--text-primary)'),
      borderColor: resolveCssVariable('var(--border)'),
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      intersect: false,
      mode: 'index',
      callbacks: {
        label: (context) => {
          let label = context.dataset.label || ''
          if (label) label += ': '
          if (context.parsed.y !== null) {
            label += context.parsed.y
          }
          return label
        },
      },
    },
    datalabels: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        color: resolveCssVariable('var(--border)'),
        drawBorder: false,
        drawOnChartArea: false,
      },
      ticks: {
        color: resolveCssVariable('var(--text-secondary)'),
        font: {
          family: "'Roboto', sans-serif",
          size: 11,
        },
        maxRotation: 45,
        minRotation: 30,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: resolveCssVariable('var(--border)'),
        drawBorder: false,
        tickLength: 8,
      },
      ticks: {
        color: resolveCssVariable('var(--text-secondary)'),
        font: {
          family: "'Roboto', sans-serif",
          size: 11,
        },
        padding: 8,
      },
    },
  },
  onClick: (event, elements) => {
    if (elements.length > 0) {
      const datasetIndex = elements[0].datasetIndex
      const dataIndex = elements[0].index
      emit('chart-click', { datasetIndex, dataIndex })
    }
  },
  elements: {
    bar: {
      borderRadius: 4,
      borderSkipped: 'bottom',
    },
  },
}

const initChart = () => {
  if (!chartCanvas.value) return

  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // Обрабатываем цвета в датасетах
  const processedDatasets = props.data.datasets.map((dataset) => {
    const processed = processDatasetColors(dataset)

    // Создаем градиент для фона, если нужно
    if (
      processed.backgroundColor &&
      !processed.backgroundColor.startsWith('rgba')
    ) {
      const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        chartCanvas.value.height
      )
      gradient.addColorStop(0, processed.backgroundColor)
      gradient.addColorStop(1, `${processed.backgroundColor}80`)
      processed.backgroundColor = gradient
    }

    return processed
  })

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      ...props.data,
      datasets: processedDatasets,
    },
    options: {
      ...defaultOptions,
      ...props.options,
    },
  })
}

const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

onMounted(() => {
  initChart()

  // Реакция на изменение размера контейнера
  resizeObserver.value = new ResizeObserver(handleResize)
  if (chartCanvas.value?.parentElement) {
    resizeObserver.value.observe(chartCanvas.value.parentElement)
  }
})

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})

watch(() => props.data, initChart, { deep: true })
watch(() => props.options, initChart, { deep: true })
</script>

<style lang="scss" scoped>
.bar-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;

  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
}

.chart-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(var(--bg-primary-rgb), 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.chart-loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--primary-bg);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .bar-chart-container {
    min-height: 180px;
  }
}

@media (max-width: 480px) {
  .bar-chart-container {
    min-height: 160px;
  }
}
</style>
