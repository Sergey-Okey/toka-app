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
          {{ tab.label }}
        </button>
      </div>
      <div v-if="timeRangeOptions" class="time-range-selector">
        <select
          v-model="selectedRange"
          @change="$emit('time-range-change', $event.target.value)"
        >
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

    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'line',
  },
  data: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  tabs: {
    type: Array,
    default: null,
  },
  activeTab: {
    type: String,
    default: '',
  },
  timeRangeOptions: {
    type: Array,
    default: null,
  },
  timeRange: {
    type: String,
    default: 'week',
  },
})

const emit = defineEmits(['tab-change', 'time-range-change'])

const chartCanvas = ref(null)
const chartInstance = ref(null)
const selectedRange = ref(props.timeRange)

const initChart = () => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')

  chartInstance.value = new Chart(ctx, {
    type: props.type,
    data: props.data,
    options: {
      ...props.options,
      responsive: true,
      maintainAspectRatio: false,
    },
  })
}

watch(() => props.data, initChart, { deep: true })
watch(() => props.type, initChart)

onMounted(initChart)
onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
})
</script>

<style scoped lang="scss">
.chart-widget {
  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 12px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .chart-tabs {
    display: flex;
    gap: 8px;
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: 4px;
  }

  .tab-btn {
    border: none;
    background: transparent;
    padding: 6px 12px;
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s var(--ease-out);
    color: var(--text-secondary);

    &.active {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      font-weight: 500;
    }

    &:hover:not(.active) {
      background: var(--bg-tertiary);
    }
  }

  .time-range-selector {
    select {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 6px 12px;
      font-size: 0.85rem;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.3s var(--ease-out);

      &:hover {
        background: var(--bg-tertiary);
      }
    }
  }

  .chart-container {
    position: relative;
    height: 300px;
    width: 100%;
  }
}
</style>
