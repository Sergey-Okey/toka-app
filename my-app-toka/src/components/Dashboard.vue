<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Моя продуктивность</h1>
      <div class="current-date">{{ currentDateFormatted }}</div>
    </div>

    <div class="dashboard-grid">
      <!-- Основная статистика -->
      <div class="stats-section">
        <div class="productivity-card">
          <h3>Ваша продуктивность</h3>
          <div class="progress-container">
            <ProgressCircle
              :percentage="productivityPercentage"
              :color="getProductivityColor(productivityPercentage)"
              :stroke-width="8"
            />
            <div class="progress-info">
              <div
                class="progress-value"
                :style="{ color: getProductivityColor(productivityPercentage) }"
              >
                {{ productivityPercentage }}%
              </div>
              <div class="progress-label">
                <span>{{ completedTasksCount }}</span> из
                <span>{{ totalTasksCount }}</span> задач выполнено
              </div>
              <div class="progress-period">
                <button
                  v-for="period in timePeriods"
                  :key="period.value"
                  @click="changePeriod(period.value)"
                  :class="{ active: activePeriod === period.value }"
                >
                  {{ period.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-cards">
          <div class="stat-card" @click="filterTasks('overdue')">
            <div class="stat-icon overdue">
              <i class="material-icons">warning</i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overdueTasksCount }}</div>
              <div class="stat-label">Просрочено</div>
            </div>
          </div>

          <div class="stat-card" @click="filterTasks('high')">
            <div class="stat-icon high-priority">
              <i class="material-icons">priority_high</i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ highPriorityTasksCount }}</div>
              <div class="stat-label">Высокий приоритет</div>
            </div>
          </div>

          <div class="stat-card" @click="filterTasks('today')">
            <div class="stat-icon today">
              <i class="material-icons">today</i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ todayTasksCount }}</div>
              <div class="stat-label">На сегодня</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Графики аналитики -->
      <div class="analytics-section">
        <div class="chart-card">
          <div class="chart-header">
            <h3>Динамика выполнения</h3>
            <select v-model="completionChartType" class="chart-select">
              <option value="week">За неделю</option>
              <option value="month">За месяц</option>
            </select>
          </div>
          <LineChart
            :data="completionTrendData"
            :options="completionChartOptions"
          />
        </div>

        <div class="chart-card">
          <h3>Распределение задач</h3>
          <div class="chart-tabs">
            <button
              v-for="tab in distributionTabs"
              :key="tab.value"
              @click="activeDistributionTab = tab.value"
              :class="{ active: activeDistributionTab === tab.value }"
            >
              {{ tab.label }}
            </button>
          </div>
          <DoughnutChart
            :data="distributionChartData"
            :options="distributionChartOptions"
          />
        </div>
      </div>

      <!-- AI аналитика и временные метрики -->
      <div class="insights-section">
        <div class="ai-card">
          <h3>
            <i class="material-icons">psychology</i>
            Аналитика продуктивности
          </h3>
          <div class="ai-content">
            <div v-if="loadingAI" class="ai-loading">
              <i class="material-icons spin">autorenew</i>
              <span>Анализируем данные...</span>
            </div>
            <div v-else class="ai-messages">
              <div class="ai-message" v-if="productivityInsight">
                <div class="message-text">{{ productivityInsight }}</div>
              </div>
              <div class="ai-tip" v-if="productivityTip">
                <i class="material-icons">lightbulb</i>
                {{ productivityTip }}
              </div>
            </div>
          </div>
        </div>

        <div class="time-card">
          <h3><i class="material-icons">schedule</i> Временные метрики</h3>
          <div class="time-metrics">
            <div class="time-metric">
              <div class="metric-icon">
                <i class="material-icons">query_builder</i>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ avgCompletionTime }} мин</div>
                <div class="metric-label">Среднее время выполнения</div>
              </div>
            </div>
            <div class="time-metric">
              <div class="metric-icon">
                <i class="material-icons">timer</i>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ fastestCompletionTime }} мин</div>
                <div class="metric-label">Самая быстрая задача</div>
              </div>
            </div>
          </div>
          <div class="time-chart">
            <BarChart
              :data="productivityByHourData"
              :options="productivityByHourOptions"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import ProgressCircle from '@/components/ProgressCircle.vue'
import LineChart from '@/components/charts/LineChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import BarChart from '@/components/charts/BarChart.vue'

const taskStore = useTaskStore()

// Периоды времени для статистики
const timePeriods = [
  { label: 'Сегодня', value: 'today' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
]
const activePeriod = ref('today')

// Типы графиков
const completionChartType = ref('week')
const distributionTabs = [
  { label: 'По приоритету', value: 'priority' },
  { label: 'По статусу', value: 'status' },
]
const activeDistributionTab = ref('priority')

// Данные для аналитики
const loadingAI = ref(false)
const productivityInsight = ref('')
const productivityTip = ref('')

// Текущая дата
const currentDate = ref(new Date())
const currentDateFormatted = computed(() => {
  return currentDate.value.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

// Основные метрики
const totalTasksCount = computed(() => {
  return getTasksForPeriod().length
})

const completedTasksCount = computed(() => {
  return getTasksForPeriod().filter((task) => task.completed).length
})

const productivityPercentage = computed(() => {
  if (totalTasksCount.value === 0) return 0
  return Math.round((completedTasksCount.value / totalTasksCount.value) * 100)
})

const overdueTasksCount = computed(() => {
  return taskStore.tasks.filter((task) => {
    if (task.completed) return false
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date()
  }).length
})

const highPriorityTasksCount = computed(() => {
  return taskStore.tasks.filter((task) => task.priority === 'high').length
})

const todayTasksCount = computed(() => {
  const today = new Date()
  return taskStore.tasks.filter((task) => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate)
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    )
  }).length
})

// Временные метрики
const avgCompletionTime = computed(() => {
  const completedTasks = taskStore.tasks.filter(
    (task) => task.completed && task.timeSpent
  )
  if (completedTasks.length === 0) return 0

  const totalMinutes = completedTasks.reduce((sum, task) => {
    return sum + (task.timeSpent || 0)
  }, 0)

  return Math.round(totalMinutes / completedTasks.length)
})

const fastestCompletionTime = computed(() => {
  const completedTasks = taskStore.tasks.filter(
    (task) => task.completed && task.timeSpent
  )
  if (completedTasks.length === 0) return 0

  return Math.min(...completedTasks.map((task) => task.timeSpent))
})

// Получение задач для выбранного периода
const getTasksForPeriod = () => {
  const now = new Date()
  const periodStart = new Date()

  switch (activePeriod.value) {
    case 'week':
      periodStart.setDate(now.getDate() - 7)
      break
    case 'month':
      periodStart.setMonth(now.getMonth() - 1)
      break
    default: // today
      periodStart.setHours(0, 0, 0, 0)
  }

  return taskStore.tasks.filter((task) => {
    if (!task.createdAt) return false
    const taskDate = new Date(task.createdAt)
    return taskDate >= periodStart
  })
}

// Данные для графиков
const completionTrendData = computed(() => {
  const now = new Date()
  const labels = []
  const completedData = []
  const createdData = []

  if (completionChartType.value === 'week') {
    // Данные за неделю
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(now.getDate() - i)
      labels.push(date.toLocaleDateString('ru-RU', { weekday: 'short' }))

      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)

      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      completedData.push(
        taskStore.tasks.filter(
          (task) =>
            task.completed &&
            task.completedAt &&
            new Date(task.completedAt) >= dayStart &&
            new Date(task.completedAt) <= dayEnd
        ).length
      )

      createdData.push(
        taskStore.tasks.filter(
          (task) =>
            task.createdAt &&
            new Date(task.createdAt) >= dayStart &&
            new Date(task.createdAt) <= dayEnd
        ).length
      )
    }
  } else {
    // Данные за месяц (по неделям)
    const weeksInMonth = Math.ceil(now.getDate() / 7)
    for (let i = 0; i < weeksInMonth; i++) {
      const weekStart = new Date(now.getFullYear(), now.getMonth(), i * 7 + 1)
      const weekEnd = new Date(now.getFullYear(), now.getMonth(), (i + 1) * 7)

      labels.push(`${weekStart.getDate()}-${weekEnd.getDate()}`)

      completedData.push(
        taskStore.tasks.filter(
          (task) =>
            task.completed &&
            task.completedAt &&
            new Date(task.completedAt) >= weekStart &&
            new Date(task.completedAt) <= weekEnd
        ).length
      )

      createdData.push(
        taskStore.tasks.filter(
          (task) =>
            task.createdAt &&
            new Date(task.createdAt) >= weekStart &&
            new Date(task.createdAt) <= weekEnd
        ).length
      )
    }
  }

  return {
    labels,
    datasets: [
      {
        label: 'Выполнено',
        data: completedData,
        borderColor: '#31a974',
        backgroundColor: 'rgba(49, 169, 116, 0.2)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Создано',
        data: createdData,
        borderColor: '#4dabf7',
        backgroundColor: 'rgba(77, 171, 247, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  }
})

const distributionChartData = computed(() => {
  if (activeDistributionTab.value === 'priority') {
    // Распределение по приоритетам
    const priorities = {
      high: { label: 'Высокий', count: 0, color: 'rgba(255, 99, 132, 0.7)' },
      medium: { label: 'Средний', count: 0, color: 'rgba(255, 159, 64, 0.7)' },
      low: { label: 'Низкий', count: 0, color: 'rgba(75, 192, 192, 0.7)' },
      none: {
        label: 'Без приоритета',
        count: 0,
        color: 'rgba(54, 162, 235, 0.7)',
      },
    }

    taskStore.tasks.forEach((task) => {
      priorities[task.priority || 'none'].count++
    })

    return {
      labels: Object.values(priorities).map((p) => p.label),
      datasets: [
        {
          data: Object.values(priorities).map((p) => p.count),
          backgroundColor: Object.values(priorities).map((p) => p.color),
          borderColor: '#2d3748',
          borderWidth: 1,
        },
      ],
    }
  } else {
    // Распределение по статусам
    return {
      labels: ['Выполнено', 'В процессе', 'Не начато'],
      datasets: [
        {
          data: [
            taskStore.tasks.filter((t) => t.completed).length,
            taskStore.tasks.filter((t) => !t.completed && t.startedAt).length,
            taskStore.tasks.filter((t) => !t.completed && !t.startedAt).length,
          ],
          backgroundColor: [
            'rgba(49, 169, 116, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(255, 99, 132, 0.7)',
          ],
          borderColor: '#2d3748',
          borderWidth: 1,
        },
      ],
    }
  }
})

const productivityByHourData = computed(() => {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const productivityData = hours.map((hour) => {
    return taskStore.tasks.filter((task) => {
      if (!task.completedAt) return false
      const completedHour = new Date(task.completedAt).getHours()
      return completedHour === hour
    }).length
  })

  // Группируем по 4 часа для лучшей читаемости
  const groupedLabels = ['0-4', '4-8', '8-12', '12-16', '16-20', '20-24']
  const groupedData = [
    productivityData.slice(0, 4).reduce((a, b) => a + b, 0),
    productivityData.slice(4, 8).reduce((a, b) => a + b, 0),
    productivityData.slice(8, 12).reduce((a, b) => a + b, 0),
    productivityData.slice(12, 16).reduce((a, b) => a + b, 0),
    productivityData.slice(16, 20).reduce((a, b) => a + b, 0),
    productivityData.slice(20, 24).reduce((a, b) => a + b, 0),
  ]

  return {
    labels: groupedLabels,
    datasets: [
      {
        label: 'Выполнено задач',
        data: groupedData,
        backgroundColor: 'rgba(49, 169, 116, 0.7)',
        borderRadius: 4,
      },
    ],
  }
})

// Настройки графиков
const completionChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#e2e8f0',
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: '#2d3748',
      titleColor: '#e2e8f0',
      bodyColor: '#e2e8f0',
      borderColor: '#4a5568',
      borderWidth: 1,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#4a5568',
      },
      ticks: {
        color: '#a0aec0',
      },
    },
    x: {
      grid: {
        color: '#4a5568',
      },
      ticks: {
        color: '#a0aec0',
      },
    },
  },
}

const distributionChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#e2e8f0',
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: '#2d3748',
      titleColor: '#e2e8f0',
      bodyColor: '#e2e8f0',
      borderColor: '#4a5568',
      borderWidth: 1,
    },
  },
  cutout: '70%',
}

const productivityByHourOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#2d3748',
      titleColor: '#e2e8f0',
      bodyColor: '#e2e8f0',
      borderColor: '#4a5568',
      borderWidth: 1,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#4a5568',
      },
      ticks: {
        color: '#a0aec0',
      },
    },
    x: {
      grid: {
        color: '#4a5568',
      },
      ticks: {
        color: '#a0aec0',
      },
    },
  },
}

// Методы
const getProductivityColor = (percentage) => {
  if (percentage >= 80) return '#31a974'
  if (percentage >= 50) return '#f6ad55'
  return '#fc8181'
}

const changePeriod = (period) => {
  activePeriod.value = period
}

const filterTasks = (filterType) => {
  // Здесь должна быть логика фильтрации задач
  // В реальном приложении можно эмитить событие или изменять store
  console.log(`Фильтрация задач по: ${filterType}`)
}

const analyzeProductivity = () => {
  loadingAI.value = true

  // Имитация AI анализа с реальной логикой
  setTimeout(() => {
    const completionRate = productivityPercentage.value
    const overdueCount = overdueTasksCount.value
    const highPriorityCount = highPriorityTasksCount.value

    if (completionRate >= 80) {
      productivityInsight.value =
        'Отличная продуктивность! Вы выполняете большинство задач.'
      if (overdueCount > 0) {
        productivityTip.value = `У вас ${overdueCount} просроченных задач. Попробуйте выполнить их в первую очередь.`
      } else if (highPriorityCount > 0) {
        productivityTip.value = `У вас ${highPriorityCount} важных задач. Продолжайте в том же духе!`
      } else {
        productivityTip.value = 'Попробуйте взяться за более сложные задачи.'
      }
    } else if (completionRate >= 50) {
      productivityInsight.value = 'Хороший результат, но есть куда расти.'
      if (overdueCount > 2) {
        productivityTip.value = `У вас ${overdueCount} просроченных задач. Попробуйте технику Pomodoro.`
      } else {
        productivityTip.value =
          'Сосредоточьтесь на задачах с высоким приоритетом.'
      }
    } else {
      productivityInsight.value = 'Продуктивность ниже среднего.'
      if (overdueCount > 0) {
        productivityTip.value = `У вас ${overdueCount} просроченных задач. Начните с самых важных.`
      } else {
        productivityTip.value =
          'Попробуйте начать с небольших задач, чтобы войти в ритм.'
      }
    }

    loadingAI.value = false
  }, 1000)
}

// Обновление аналитики при изменении задач
watch(
  () => taskStore.tasks,
  () => {
    analyzeProductivity()
  },
  { deep: true }
)

// Инициализация
onMounted(() => {
  analyzeProductivity()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
  color: #e2e8f0;
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 2rem;
  text-align: center;

  h1 {
    font-size: 2rem;
    margin: 0;
    color: #ffffff;
    background: linear-gradient(90deg, #31a974, #4dabf7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
    font-weight: 600;
  }

  .current-date {
    font-size: 1.1rem;
    color: #a0aec0;
    margin-top: 0.5rem;
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 1200px) {
    grid-template-columns: 350px 1fr;
  }

  @media (min-width: 1400px) {
    grid-template-columns: 350px 1fr 350px;
  }
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.productivity-card {
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(50px);
  outline: solid 1px #dddddd82;

  h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    color: #ffffff;
    font-weight: 500;
  }

  .progress-container {
    display: flex;
    align-items: center;
    gap: 1.5rem;

    .progress-info {
      flex: 1;

      .progress-value {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
        line-height: 1;
      }

      .progress-label {
        font-size: 1rem;
        color: #a0aec0;
        margin-bottom: 1rem;

        span {
          color: #ffffff;
          font-weight: 500;
        }
      }

      .progress-period {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;

        button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background-color: #4a5568;
          color: #e2e8f0;
          border: none;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background-color: #5f6b7e;
          }

          &.active {
            background-color: #4299e1;
            color: white;
          }
        }
      }
    }
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  border-radius: 0.75rem;
  padding: 1.2rem;
  backdrop-filter: blur(50px);
  outline: solid 1px #dddddd82;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-color: #5f6b7e;
  }

  .stat-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .material-icons {
      font-size: 1.5rem;
    }

    &.overdue {
      background-color: rgba(252, 129, 129, 0.2);
      color: #fc8181;
    }

    &.high-priority {
      background-color: rgba(246, 173, 85, 0.2);
      color: #f6ad55;
    }

    &.today {
      background-color: rgba(102, 126, 234, 0.2);
      color: #667eea;
    }

    &.streak {
      background-color: rgba(77, 171, 247, 0.2);
      color: #4dabf7;
    }
  }

  .stat-content {
    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #ffffff;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #a0aec0;
      margin-top: 0.3rem;
    }
  }
}

.analytics-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-card {
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(50px);
  outline: solid 1px #dddddd82;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    color: #ffffff;
    font-weight: 500;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .chart-select {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: #4a5568;
    color: #e2e8f0;
    border: 1px solid #5f6b7e;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .chart-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;

    button {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      background-color: #4a5568;
      color: #e2e8f0;
      border: none;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: #5f6b7e;
      }

      &.active {
        background-color: #4299e1;
        color: white;
      }
    }
  }
}

.insights-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ai-card {
  backdrop-filter: blur(50px);
  outline: solid 1px #dddddd82;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    color: #ffffff;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .material-icons {
      color: #9f7aea;
    }
  }

  .ai-content {
    .ai-loading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #a0aec0;
      font-size: 0.95rem;

      .material-icons {
        animation: spin 1s linear infinite;
      }
    }

    .ai-messages {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ai-message {
      background-color: rgba(113, 128, 150, 0.2);
      border-radius: 0.75rem;
      padding: 1rem;
      border-left: 4px solid #9f7aea;

      .message-text {
        font-size: 0.95rem;
        color: #e2e8f0;
        line-height: 1.5;
      }
    }

    .ai-tip {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #a0aec0;
      padding: 1rem;
      backdrop-filter: blur(50px);
      outline: solid 1px #dddddd82;
      border-radius: 0.75rem;
      margin-top: 1rem;

      .material-icons {
        color: #f6e05e;
        font-size: 1.2rem;
        margin-top: 0.1rem;
      }
    }
  }
}

.time-card {
  backdrop-filter: blur(50px);
  outline: solid 1px #dddddd82;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    color: #ffffff;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .material-icons {
      color: #4299e1;
    }
  }

  .time-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .time-metric {
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: rgba(113, 128, 150, 0.1);
    border-radius: 0.75rem;
    padding: 1rem;

    .metric-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background-color: rgba(66, 153, 225, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .material-icons {
        color: #4299e1;
        font-size: 1.2rem;
      }
    }

    .metric-info {
      .metric-value {
        font-size: 1.25rem;
        font-weight: bold;
        color: #ffffff;
        line-height: 1;
      }

      .metric-label {
        font-size: 0.85rem;
        color: #a0aec0;
        margin-top: 0.3rem;
      }
    }
  }

  .time-chart {
    margin-top: 1rem;
    height: 200px;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .progress-container {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .time-metrics {
    grid-template-columns: 1fr !important;
  }
}

/* Стили для графиков */
.chart-container {
  position: relative;
  height: 250px;
  width: 100%;
}
@media (max-width: 400px) {
  .dashboard-container {
    padding: 1rem;
  }

  .dashboard-header {
    h1 {
      font-size: 1.5rem;
    }

    .current-date {
      font-size: 0.9rem;
    }
  }

  .productivity-card {
    padding: 1rem;

    h3 {
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .progress-container {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1rem;

      .progress-info {
        .progress-value {
          font-size: 2rem;
        }

        .progress-period {
          justify-content: center;
          flex-wrap: wrap;

          button {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }
        }
      }
    }
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;

    .stat-icon {
      width: 2.5rem;
      height: 2.5rem;

      .material-icons {
        font-size: 1.2rem;
      }
    }

    .stat-content {
      .stat-value {
        font-size: 1.3rem;
      }

      .stat-label {
        font-size: 0.8rem;
      }
    }
  }

  .chart-card,
  .ai-card,
  .time-card {
    padding: 1rem;

    h3 {
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .chart-select {
    width: 100%;
  }

  .chart-tabs {
    flex-wrap: wrap;

    button {
      flex-grow: 1;
      text-align: center;
    }
  }

  .ai-card {
    .ai-content {
      .ai-message,
      .ai-tip {
        padding: 0.8rem;
        font-size: 0.85rem;
      }
    }
  }

  .time-metrics {
    grid-template-columns: 1fr !important;
  }

  .time-metric {
    gap: 0.8rem;
    padding: 0.8rem;

    .metric-icon {
      width: 2rem;
      height: 2rem;

      .material-icons {
        font-size: 1rem;
      }
    }

    .metric-info {
      .metric-value {
        font-size: 1.1rem;
      }

      .metric-label {
        font-size: 0.8rem;
      }
    }
  }

  .chart-container {
    height: 200px;
  }
}
</style>
