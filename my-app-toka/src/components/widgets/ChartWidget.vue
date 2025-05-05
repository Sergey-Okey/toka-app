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

    <div class="chart-container" ref="chartContainer"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  title: String,
  type: { type: String, default: 'line' },
  data: Object,
  options: { type: Object, default: () => ({}) },
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

const chartContainer = ref(null)
const chartInstance = ref(null)
const selectedRange = ref(props.timeRange)

const initChart = () => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }

  if (!chartContainer.value || !props.data) return

  chartInstance.value = echarts.init(chartContainer.value)

  const defaultOptions = {
    color: props.colors,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params) {
        let result = params[0].axisValue + '<br/>'
        params.forEach((item) => {
          result += `
            <span style="display:inline-block;margin-right:5px;border-radius:10px;
              width:9px;height:9px;background-color:${item.color}"></span>
            ${item.seriesName}: <strong>${item.value}</strong><br/>
          `
        })
        return result
      },
    },
    legend: {
      data: props.data.series?.map((item) => item.name) || [],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: props.data.labels || [],
      axisLine: {
        lineStyle: {
          color: '#D9D9D9',
        },
      },
      axisLabel: {
        color: '#666',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#D9D9D9',
        },
      },
      axisLabel: {
        color: '#666',
      },
      splitLine: {
        lineStyle: {
          color: '#F0F0F0',
          type: 'dashed',
        },
      },
    },
    series: (props.data.series || []).map((series) => ({
      ...series,
      type: props.type,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 3,
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          borderWidth: 2,
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
        },
      },
      areaStyle:
        props.type === 'line'
          ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: `${props.colors[props.data.series.indexOf(series)]}60`,
                },
                {
                  offset: 1,
                  color: `${props.colors[props.data.series.indexOf(series)]}10`,
                },
              ]),
            }
          : undefined,
    })),
  }

  const mergedOptions = {
    ...defaultOptions,
    ...props.options,
  }

  chartInstance.value.setOption(mergedOptions)
}

const resizeChart = () => {
  chartInstance.value?.resize()
}

watch(() => props.data, initChart, { deep: true })
watch(() => props.type, initChart)

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance.value?.dispose()
})
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

  .chart-container {
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
