<template>
  <div class="chart-widget widget-card">
    <div class="widget-header">
      <h2 class="widget-title">{{ title }}</h2>

      <div v-if="tabs" class="chart-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-btn"
          :class="{ active: activeTab === tab.value }"
          @click="$emit('tab-change', tab.value)"
        >
          <span class="tab-icon">📊</span>
          {{ tab.label }}
        </button>
      </div>

      <div v-if="timeRangeOptions" class="time-range-selector">
        <select v-model="selectedRange" @change="onTimeRangeChange">
          <option
            v-for="option in timeRangeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <apexchart
      v-if="chartSeries.length"
      type="line"
      height="400"
      :options="chartOptions"
      :series="chartSeries"
      ref="apexChart"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import ApexCharts from 'apexcharts'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  title: String,
  type: { type: String, default: 'line' },
  data: Object,
  tabs: Array,
  activeTab: String,
  timeRangeOptions: Array,
  timeRange: { type: String, default: 'week' },
  colors: {
    type: Array,
    default: () => [
      '#5470C6',
      '#91CC75',
      '#EE6666',
      '#FAC858',
      '#73C0DE',
      '#3BA272',
      '#FC8452',
      '#9A60B4',
    ],
  },
})

const emit = defineEmits(['tab-change', 'time-range-change'])

const selectedRange = ref(props.timeRange)

// Преобразование данных из props.data в формат apexcharts series
const chartSeries = computed(() => {
  if (!props.data || !props.data.series) return []
  return props.data.series.map((serie, index) => ({
    name: serie.name,
    data: serie.data || [],
    color: props.colors[index] || undefined,
  }))
})

// Опции графика apexcharts
const chartOptions = computed(() => ({
  chart: {
    type: props.type,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: props.colors,
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  markers: {
    size: 6,
    hover: { size: 8 },
  },
  xaxis: {
    categories: props.data?.labels || [],
    labels: {
      style: {
        colors: '#666',
      },
    },
    axisBorder: {
      show: true,
      color: '#D9D9D9',
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#666',
      },
    },
    axisBorder: {
      show: true,
      color: '#D9D9D9',
    },
  },
  grid: {
    borderColor: '#F0F0F0',
    strokeDashArray: 4,
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: (val) => val,
    },
  },
  legend: {
    position: 'bottom',
    labels: {
      colors: '#666',
    },
  },
  fill:
    props.type === 'line'
      ? {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.1,
            stops: [0, 90, 100],
            colorStops: chartSeries.value.map((serie, i) => ({
              offset: 0,
              color: props.colors[i] + '99',
              opacity: 0.4,
            })),
          },
        }
      : undefined,
}))

const onTimeRangeChange = (e) => {
  emit('time-range-change', selectedRange.value)
}
</script>

<style scoped lang="scss">
.chart-widget {
  .widget-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;

    @media (max-width: 600px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }

  .widget-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .chart-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1rem;
    padding: 10px 16px;
    border-radius: var(--radius-md);
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;

    .tab-icon {
      font-size: 1.25rem;
    }

    &.active {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      font-weight: 600;
    }

    &:hover:not(.active) {
      background-color: var(--bg-tertiary);
    }
  }

  .time-range-selector {
    select {
      font-size: 1rem;
      padding: 8px 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--bg-secondary);
      color: var(--text-primary);
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-tertiary);
      }
    }

    @media (max-width: 480px) {
      width: 100%;
      select {
        width: 100%;
      }
    }
  }

  apexchart {
    width: 100%;
    height: 400px;

    @media (max-width: 768px) {
      height: 300px;
    }

    @media (max-width: 480px) {
      height: 250px;
    }
  }
}
</style>
