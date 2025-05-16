<template>
  <div class="time-metrics-widget widget-card">
    <div class="widget-header">
      <h2 class="widget-title">Временные метрики</h2>
      <button
        class="refresh-btn"
        @click="refreshData"
        :disabled="isLoading"
        aria-label="Обновить данные"
      >
        <i class="material-icons-outlined" v-if="!isLoading"> refresh </i>
        <span v-else class="spinner"></span>
      </button>
    </div>

    <div class="metrics-grid">
      <div class="metric-item">
        <div class="metric-icon">
          <i class="material-icons-outlined">access_time</i>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ avgTime }} мин</div>
          <div class="metric-label">Среднее время выполнения</div>
        </div>
      </div>

      <div class="metric-item">
        <div class="metric-icon">
          <i class="material-icons-outlined">flash_on</i>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ maxTime }} мин</div>
          <div class="metric-label">Максимальное время выполнения</div>
        </div>
      </div>
    </div>

    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useTaskStore } from '@/store/tasks'

const taskStore = useTaskStore()
const chartRef = ref(null)
const isLoading = ref(false)
let chartInstance = null

const avgTime = computed(() => taskStore.avgTimeToComplete.toFixed(1))
const maxTime = computed(() => taskStore.maxTimeToComplete.toFixed(1))

const updateChart = () => {
  if (chartInstance) {
    chartInstance.setOption(getChartOptions())
  }
}

const refreshData = async () => {
  if (isLoading.value) return
  try {
    isLoading.value = true
    await taskStore.fetchTasks()
    updateChart()
  } catch (error) {
    // Здесь можно подключить систему уведомлений для пользователя
    console.error('Ошибка при обновлении данных:', error)
  } finally {
    isLoading.value = false
  }
}

const getChartOptions = () => ({
  tooltip: {
    trigger: 'axis',
    formatter: '{b}<br/>Время: {c} мин',
  },
  grid: {
    containLabel: true,
    ...(window.innerWidth < 400 && {
      left: '15%',
      right: '5%',
      bottom: '25%',
      top: '10%',
    }),
  },
  xAxis: {
    type: 'category',
    data: getLastWeekDates(),
    axisLabel: {
      rotate: window.innerWidth < 400 ? 90 : 45,
      interval: 0,
    },
  },
  yAxis: {
    type: 'value',
    name: 'Минуты',
    minInterval: 1,
  },
  series: [
    {
      name: 'Среднее время',
      type: 'bar',
      data: getCompletionTimes(),
      itemStyle: {
        color: 'var(--primary)',
        borderRadius: [2, 2, 0, 0],
      },
      barWidth: '60%',
    },
  ],
})

function getLastWeekDates() {
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(
      date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
    )
  }
  return dates
}

function getCompletionTimes() {
  const times = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const tasks = taskStore.getTasksForDate(date)
    const avg =
      tasks.length > 0
        ? tasks.reduce((sum, t) => sum + (t.completionTime || 0), 0) /
          tasks.length
        : 0
    times.push(Number(avg.toFixed(1)))
  }
  return times
}

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
  }
}

const handleResize = () => {
  if (chartInstance) {
    updateChart()
    chartInstance.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

watch(
  () => taskStore.tasks,
  () => {
    updateChart()
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.time-metrics-widget {
  position: relative;
  padding: 16px;

  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 4px;
  }

  .widget-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .refresh-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;

    &:hover:not(:disabled) {
      color: var(--primary);
      background-color: var(--bg-primary);
      transform: rotate(180deg);
    }

    &:active:not(:disabled) {
      transform: rotate(360deg);
    }

    &:disabled {
      cursor: default;
      opacity: 0.5;
      transform: none;
    }

    i {
      font-size: 1.25rem;
    }
  }

  /* Спиннер для загрузки */
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--text-secondary);
    border-top: 2px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .metric-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    transition: transform 0.2s ease;
    position: relative;
    padding-left: 60px; /* Отступ для иконки */

    &:hover {
      transform: translateY(-2px);
    }
  }

  .metric-icon {
    position: absolute;
    left: 12px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);

    i {
      font-size: 1.2rem;
    }
  }

  .metric-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: center;
  }

  .metric-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .metric-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .chart-container {
    height: 240px;
    width: 100%;
    margin-top: 8px;
  }

  @media (max-width: 400px) {
    padding: 12px;

    .widget-header {
      margin-bottom: 16px;
    }

    .widget-title {
      font-size: 1.1rem;
    }

    .refresh-btn {
      width: 32px;
      height: 32px;

      i {
        font-size: 1.1rem;
      }
    }

    .metric-item {
      padding-left: 52px; /* Уменьшенный отступ для мобильных */
    }

    .metric-icon {
      width: 36px;
      height: 36px;

      i {
        font-size: 1.1rem;
      }
    }

    .metric-value {
      font-size: 0.95rem;
    }

    .metric-label {
      font-size: 0.8rem;
    }

    .chart-container {
      height: 220px;
    }
  }
}
</style>
