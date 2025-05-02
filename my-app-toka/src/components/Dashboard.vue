<template>
  <div class="dashboard" :class="{ 'dark-mode': darkMode }">
    <!-- Шапка dashboard -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Моя продуктивность</h1>
      <div class="dashboard-actions">
        <div class="dashboard-date">{{ currentDateFormatted }}</div>
        <button class="theme-toggle" @click="toggleTheme">
          <i class="material-icons-outlined">
            {{ darkMode ? 'light_mode' : 'dark_mode' }}
          </i>
        </button>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="dashboard-content">
      <!-- Левая колонка - основная статистика -->
      <div class="dashboard-column">
        <ProductivityWidget
          :percentage="productivityPercentage"
          :completed="completedTasksCount"
          :total="totalTasksCount"
          :active-period="activePeriod"
          @period-change="changePeriod"
        />

        <div class="stats-grid">
          <StatsCard
            type="overdue"
            icon="warning"
            :value="overdueTasksCount"
            label="Просрочено"
            @click="filterTasks('overdue')"
          />
          <StatsCard
            type="high-priority"
            icon="priority_high"
            :value="highPriorityTasksCount"
            label="Высокий приоритет"
            @click="filterTasks('high')"
          />
          <StatsCard
            type="today"
            icon="event_available"
            :value="todayTasksCount"
            label="На сегодня"
            @click="filterTasks('today')"
          />
          <StatsCard
            type="completed"
            icon="check_circle"
            :value="completedTasksCount"
            label="Выполнено"
            @click="filterTasks('completed')"
          />
        </div>
      </div>

      <!-- Центральная колонка - графики -->
      <div class="dashboard-column">
        <ChartWidget
          title="Динамика выполнения"
          type="line"
          :data="completionTrendData"
          :options="completionChartOptions"
          :time-range="completionChartType"
          @time-range-change="completionChartType = $event"
        />

        <ChartWidget
          title="Распределение задач"
          type="doughnut"
          :data="distributionChartData"
          :options="distributionChartOptions"
          :active-tab="activeDistributionTab"
          @tab-change="activeDistributionTab = $event"
        />
      </div>

      <!-- Правая колонка - аналитика -->
      <div class="dashboard-column">
        <AnalyticsWidget
          :loading="loadingAI"
          :insight="productivityInsight"
          :tip="productivityTip"
        />

        <TimeMetricsWidget
          :metrics="timeMetrics"
          :chart-data="productivityByHourData"
          :chart-options="productivityByHourOptions"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import ProductivityWidget from '@/components/widgets/ProductivityWidget.vue'
import StatsCard from '@/components/ui/StatsCard.vue'
import ChartWidget from '@/components/widgets/ChartWidget.vue'
import AnalyticsWidget from '@/components/widgets/AnalyticsWidget.vue'
import TimeMetricsWidget from '@/components/widgets/TimeMetricsWidget.vue'

const taskStore = useTaskStore()
const darkMode = ref(false)

// Состояния для UI
const activePeriod = ref('week')
const completionChartType = ref('week')
const activeDistributionTab = ref('priority')
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

// Метрики продуктивности
const totalTasksCount = computed(() => taskStore.tasks.length)
const completedTasksCount = computed(() => taskStore.completedTasks)
const productivityPercentage = computed(() => {
  return totalTasksCount.value === 0
    ? 0
    : Math.round((completedTasksCount.value / totalTasksCount.value) * 100)
})

const overdueTasksCount = computed(() => taskStore.overdueTasks)
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
const timeMetrics = computed(() => [
  {
    icon: 'timer',
    value: avgCompletionTime.value,
    label: 'Среднее время выполнения',
  },
  {
    icon: 'speed',
    value: fastestCompletionTime.value,
    label: 'Самая быстрая задача',
  },
])

const avgCompletionTime = computed(() => {
  const completedTasks = taskStore.tasks.filter(
    (task) => task.completed && task.timeSpent
  )
  if (completedTasks.length === 0) return 0
  const totalMinutes = completedTasks.reduce(
    (sum, task) => sum + (task.timeSpent || 0),
    0
  )
  return Math.round(totalMinutes / completedTasks.length)
})

const fastestCompletionTime = computed(() => {
  const completedTasks = taskStore.tasks.filter(
    (task) => task.completed && task.timeSpent
  )
  return completedTasks.length === 0
    ? 0
    : Math.min(...completedTasks.map((task) => task.timeSpent))
})

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
  } else if (completionChartType.value === 'month') {
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
  } else {
    // Данные за год (по месяцам)
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(now.getFullYear(), i, 1)
      const monthEnd = new Date(now.getFullYear(), i + 1, 0)

      labels.push(monthStart.toLocaleDateString('ru-RU', { month: 'short' }))

      completedData.push(
        taskStore.tasks.filter(
          (task) =>
            task.completed &&
            task.completedAt &&
            new Date(task.completedAt) >= monthStart &&
            new Date(task.completedAt) <= monthEnd
        ).length
      )

      createdData.push(
        taskStore.tasks.filter(
          (task) =>
            task.createdAt &&
            new Date(task.createdAt) >= monthStart &&
            new Date(task.createdAt) <= monthEnd
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
        borderColor: 'var(--success)',
        backgroundColor: 'rgba(var(--success-rgb), 0.1)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'var(--success)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Создано',
        data: createdData,
        borderColor: 'var(--info)',
        backgroundColor: 'rgba(var(--info-rgb), 0.1)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'var(--info)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }
})

const distributionChartData = computed(() => {
  if (activeDistributionTab.value === 'priority') {
    const priorities = {
      high: { label: 'Высокий', count: 0, color: 'var(--error)' },
      medium: { label: 'Средний', count: 0, color: 'var(--warning)' },
      low: { label: 'Низкий', count: 0, color: 'var(--warning-light)' },
      none: {
        label: 'Без приоритета',
        count: 0,
        color: 'var(--text-tertiary)',
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
          borderColor: 'var(--bg-primary)',
          borderWidth: 1,
        },
      ],
    }
  } else {
    return {
      labels: ['Выполнено', 'В процессе', 'Не начато'],
      datasets: [
        {
          data: [
            taskStore.tasks.filter((t) => t.completed).length,
            taskStore.tasks.filter((t) => !t.completed && t.startedAt).length,
            taskStore.tasks.filter((t) => !t.completed && !t.startedAt).length,
          ],
          backgroundColor: ['var(--success)', 'var(--warning)', 'var(--error)'],
          borderColor: 'var(--bg-primary)',
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

  return {
    labels: hours.map((h) => `${h}:00`),
    datasets: [
      {
        label: 'Выполнено задач',
        data: productivityData,
        backgroundColor: 'rgba(var(--success-rgb), 0.7)',
        borderRadius: 4,
        borderWidth: 0,
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
        color: 'var(--text-primary)',
        font: {
          family: "'Roboto', sans-serif",
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
      intersect: false,
      mode: 'index',
    },
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
        },
        precision: 0,
      },
    },
  },
  elements: {
    line: {
      fill: 'start',
    },
  },
}

const distributionChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: 'var(--text-primary)',
        font: {
          family: "'Roboto', sans-serif",
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
  },
  cutout: '70%',
  radius: '90%',
}

const productivityByHourOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'var(--bg-secondary)',
      titleColor: 'var(--text-primary)',
      bodyColor: 'var(--text-primary)',
      borderColor: 'var(--border)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 'var(--radius-sm)',
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: 'var(--text-secondary)',
        font: {
          family: "'Roboto', sans-serif",
        },
        maxRotation: 45,
        minRotation: 45,
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
        },
        precision: 0,
      },
    },
  },
}

// Методы
const toggleTheme = () => {
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark-mode', darkMode.value)
  localStorage.setItem('darkMode', darkMode.value)
}

const changePeriod = (period) => {
  activePeriod.value = period
}

const filterTasks = (type) => {
  console.log(`Фильтрация задач по: ${type}`)
  // В реальном приложении можно эмитить событие или изменять store
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
        'Отличная продуктивность! Вы выполняете большинство задач в срок.'
      if (overdueCount > 0) {
        productivityTip.value = `У вас ${overdueCount} просроченных задач. Попробуйте выполнить их в первую очередь.`
      } else if (highPriorityCount > 0) {
        productivityTip.value = `У вас ${highPriorityCount} важных задач. Продолжайте в том же духе!`
      } else {
        productivityTip.value =
          'Попробуйте взяться за более сложные задачи, чтобы развиваться.'
      }
    } else if (completionRate >= 50) {
      productivityInsight.value =
        'Хороший результат, но есть куда расти. Вы выполняете больше половины задач.'
      if (overdueCount > 2) {
        productivityTip.value = `У вас ${overdueCount} просроченных задач. Попробуйте технику Pomodoro для повышения эффективности.`
      } else {
        productivityTip.value =
          'Сосредоточьтесь на задачах с высоким приоритетом для лучших результатов.'
      }
    } else {
      productivityInsight.value =
        'Продуктивность ниже среднего. Возможно, стоит пересмотреть подход к планированию.'
      if (overdueCount > 0) {
        productivityTip.value = `У вас ${overdueCount} просроченных задач. Начните с самых важных и срочных.`
      } else {
        productivityTip.value =
          'Попробуйте начать с небольших задач, чтобы войти в рабочий ритм.'
      }
    }

    loadingAI.value = false
  }, 1500)
}

// Инициализация
onMounted(() => {
  darkMode.value = localStorage.getItem('darkMode') === 'true'
  document.documentElement.classList.toggle('dark-mode', darkMode.value)

  analyzeProductivity()
  watch(() => taskStore.tasks, analyzeProductivity, { deep: true })
})
</script>

<style scoped lang="scss">
.dashboard {
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  transition: background-color 0.3s var(--ease-out);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  animation: fadeIn 0.6s var(--ease-out);

  .dashboard-title {
    font-size: 2rem;
    font-weight: 600;
    margin: 0;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .dashboard-actions {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .dashboard-date {
    font-size: 1rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .theme-toggle {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.3s var(--ease-out);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
    }

    .material-icons-outlined {
      font-size: 1.5rem;
    }
  }
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 1024px) {
    grid-template-columns: 350px 1fr 350px;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    grid-template-columns: 1fr 1fr;
  }
}

.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

@media (max-width: 767px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .dashboard-actions {
    width: 100%;
    justify-content: space-between;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 16px;
  }

  .dashboard-title {
    font-size: 1.5rem !important;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
