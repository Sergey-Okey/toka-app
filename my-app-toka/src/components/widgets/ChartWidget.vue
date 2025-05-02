<template>
  <div class="chart-widget widget">
    <div class="widget-header">
      <h3 class="widget-title">
        <i v-if="icon" class="material-icons-outlined">{{ icon }}</i>
        {{ title }}
      </h3>
      <div class="widget-controls">
        <div v-if="type === 'line'" class="time-range-selector">
          <select
            v-model="timeRange"
            @change="$emit('time-range-change', timeRange)"
            class="chart-select"
            aria-label="Выберите временной диапазон"
          >
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="year">За год</option>
          </select>
        </div>
        <div v-if="type === 'doughnut'" class="chart-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="$emit('tab-change', tab.value)"
            :class="{ active: activeTab === tab.value }"
            :aria-label="`Показать ${tab.label.toLowerCase()}`"
            :aria-pressed="activeTab === tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>
    <div class="chart-container">
      <LineChart
        v-if="type === 'line'"
        :data="processedChartData"
        :options="chartOptions"
        :key="'line-' + timeRange"
      />
      <DoughnutChart
        v-if="type === 'doughnut'"
        :data="processedChartData"
        :options="chartOptions"
        :key="'doughnut-' + activeTab"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import LineChart from '@/components/charts/LineChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: String,
  type: {
    type: String,
    validator: (val) => ['line', 'doughnut'].includes(val),
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  activeTab: String,
  timeRange: {
    type: String,
    default: 'week',
  },
  tabs: {
    type: Array,
    default: () => [
      { label: 'По приоритету', value: 'priority' },
      { label: 'По статусу', value: 'status' },
    ],
  },
})

const timeRange = ref(props.timeRange)

// Функция для преобразования CSS переменных в значения, понятные Canvas
const resolveColor = (value) => {
  if (typeof value !== 'string') return value
  if (value.startsWith('var(')) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(value.replace('var(', '').replace(')', ''))
      .trim()
  }
  if (value.startsWith('rgba(var(')) {
    const matches = value.match(/rgba\(var\(([^)]+)\),\s*([^)]+)\)/)
    if (matches) {
      const rgb = getComputedStyle(document.documentElement)
        .getPropertyValue(matches[1])
        .trim()
      return `rgba(${rgb}, ${matches[2]})`
    }
  }
  return value
}

// Обработка данных графика с преобразованием цветов
const processedChartData = computed(() => {
  const processDataset = (dataset) => {
    const result = { ...dataset }

    // Обрабатываем все цветовые свойства
    const colorProps = [
      'backgroundColor',
      'borderColor',
      'pointBackgroundColor',
      'pointBorderColor',
      'hoverBackgroundColor',
      'hoverBorderColor',
    ]

    colorProps.forEach((prop) => {
      if (result[prop]) {
        if (Array.isArray(result[prop])) {
          result[prop] = result[prop].map(resolveColor)
        } else {
          result[prop] = resolveColor(result[prop])
        }
      }
    })

    return result
  }

  return {
    ...props.data,
    datasets: props.data.datasets.map(processDataset),
  }
})

// Настройки графика
const chartOptions = computed(() => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: resolveColor('var(--text-primary)'),
          font: {
            family: "'Roboto', sans-serif",
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: resolveColor('var(--bg-secondary)'),
        titleColor: resolveColor('var(--text-primary)'),
        bodyColor: resolveColor('var(--text-primary)'),
        borderColor: resolveColor('var(--border)'),
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
      },
    },
  }

  if (props.type === 'line') {
    baseOptions.scales = {
      x: {
        grid: {
          color: resolveColor('var(--border)'),
          drawBorder: false,
        },
        ticks: {
          color: resolveColor('var(--text-secondary)'),
          font: {
            family: "'Roboto', sans-serif",
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: resolveColor('var(--border)'),
          drawBorder: false,
        },
        ticks: {
          color: resolveColor('var(--text-secondary)'),
          font: {
            family: "'Roboto', sans-serif",
            size: 11,
          },
        },
      },
    }
  }

  if (props.type === 'doughnut') {
    baseOptions.cutout = '70%'
    baseOptions.radius = '90%'
  }

  return {
    ...baseOptions,
    ...props.options,
  }
})

// Реакция на изменение темы
watch(
  () => document.documentElement.classList.contains('dark-mode'),
  () => {
    // Принудительное обновление при смене темы
    if (chartInstance.value) {
      chartInstance.value.update()
    }
  }
)
</script>

<style lang="scss" scoped>
.chart-widget {
  display: flex;
  flex-direction: column;
  height: 100%;

  .widget-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .widget-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);

    .material-icons-outlined {
      color: var(--primary);
      font-size: 1.25rem;
    }
  }

  .widget-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .chart-container {
    flex: 1;
    min-height: 240px;
    max-height: 400px;
    width: 100%;
    position: relative;

    @media (max-width: 1024px) {
      min-height: 220px;
    }

    @media (max-width: 768px) {
      min-height: 200px;
      max-height: 350px;
    }

    @media (max-width: 480px) {
      min-height: 180px;
      max-height: 300px;
    }
  }

  .chart-select {
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s var(--ease-out);
    min-width: 120px;

    &:hover {
      background-color: var(--bg-tertiary);
    }

    &:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    @media (max-width: 480px) {
      padding: 6px 10px;
      font-size: 0.8125rem;
    }
  }

  .chart-tabs {
    display: flex;
    gap: 6px;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-sm);
    padding: 4px;

    button {
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

      @media (max-width: 480px) {
        padding: 4px 8px;
        font-size: 0.75rem;
      }
    }
  }
}
</style>
