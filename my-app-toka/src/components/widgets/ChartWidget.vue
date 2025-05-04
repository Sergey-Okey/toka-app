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
  title: String,
  type: { type: String, default: 'line' },
  data: Object,
  options: { type: Object, default: () => ({}) },
  tabs: Array,
  activeTab: String,
  timeRangeOptions: Array,
  timeRange: { type: String, default: 'week' },
})

const emit = defineEmits(['tab-change', 'time-range-change'])

const chartCanvas = ref(null)
const chartInstance = ref(null)
const selectedRange = ref(props.timeRange)

const initChart = () => {
  if (chartInstance.value) chartInstance.value.destroy()

  chartInstance.value = new Chart(chartCanvas.value.getContext('2d'), {
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
onBeforeUnmount(() => chartInstance.value?.destroy())
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
      font-size: 1.25rem; // Увеличенная иконка
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

  .chart-container {
    position: relative;
    width: 100%;
    height: 320px;

    @media (max-width: 768px) {
      height: 240px;
    }

    @media (max-width: 480px) {
      height: 200px;
    }
  }
}
</style>
