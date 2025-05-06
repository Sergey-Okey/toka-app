<template>
  <div class="dashboard" :class="{ 'dark-mode': darkMode }">
    <!-- Шапка dashboard -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Моя продуктивность</h1>
      <div class="dashboard-actions">
        <div class="dashboard-date">{{ currentDateFormatted }}</div>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="dashboard-content">
      <!-- Левая колонка - основная статистика -->
      <div class="dashboard-column">
        <ProductivityWidget
          :percentage="productivityPercentage"
          :completed="taskStore.completedTasks"
          :total="taskStore.totalTasks"
          :active-period="activePeriod"
          @period-change="changePeriod"
        />

        <div class="stats-grid">
          <StatsCard
            type="overdue"
            icon="warning"
            :value="taskStore.overdueTasks"
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
            :value="taskStore.completedTasks"
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
          :time-range="completionChartType"
          :time-range-options="[
            { value: 'week', label: 'Неделя' },
            { value: 'month', label: 'Месяц' },
            { value: 'year', label: 'Год' },
          ]"
          @time-range-change="completionChartType = $event"
        />

        <ChartWidget
          title="Распределение задач"
          type="pie"
          :data="distributionChartData"
          :tabs="[
            { value: 'priority', label: 'По приоритету' },
            { value: 'status', label: 'По статусу' },
          ]"
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
          @refresh="analyzeProductivity"
        />

        <ChartWidget
          title="Продуктивность по часам"
          type="bar"
          :data="productivityByHourData"
          :options="{
            grid: { bottom: '20%' },
            xAxis: { axisLabel: { interval: 3 } },
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useDate } from '@/composables/useDate'
import ProductivityWidget from '@/components/widgets/ProductivityWidget.vue'
import StatsCard from '@/components/ui/StatsCard.vue'
import ChartWidget from '@/components/widgets/ChartWidget.vue'
import AnalyticsWidget from '@/components/widgets/AnalyticsWidget.vue'

const taskStore = useTaskStore()
const { formatDate } = useDate()

// Тема приложения
const darkMode = ref(false)
const toggleTheme = () => {
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark-mode', darkMode.value)
  localStorage.setItem('darkMode', darkMode.value)
}

// Состояния интерфейса
const activePeriod = ref('week')
const completionChartType = ref('week')
const activeDistributionTab = ref('priority')
const loadingAI = ref(false)
const productivityInsight = ref('')
const productivityTip = ref('')

// Фильтрация задач
const filterTasks = (type) => {
  console.log(`Фильтрация задач по: ${type}`)
}

// Обработчики изменений
const changePeriod = (period) => {
  activePeriod.value = period
}

// Текущая дата
const currentDate = ref(new Date())
const currentDateFormatted = computed(() => {
  return formatDate(currentDate.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

// Метрики продуктивности
const productivityPercentage = computed(() => {
  return taskStore.totalTasks === 0
    ? 0
    : Math.round((taskStore.completedTasks / taskStore.totalTasks) * 100)
})

const highPriorityTasksCount = computed(() => {
  return taskStore.tasks.filter((task) => task.priority === 'high').length
})

const todayTasksCount = computed(() => {
  return taskStore.getTasksForDate(new Date()).length
})

// Данные для графиков
const completionTrendData = computed(() => {
  const now = new Date()
  const labels = []
  const completedData = []
  const createdData = []

  if (completionChartType.value === 'week') {
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
    series: [
      {
        name: 'Выполнено',
        type: 'line',
        data: completedData,
      },
      {
        name: 'Создано',
        type: 'line',
        data: createdData,
      },
    ],
  }
})

const distributionChartData = computed(() => {
  if (activeDistributionTab.value === 'priority') {
    const priorities = {
      high: { label: 'Высокий', count: 0 },
      medium: { label: 'Средний', count: 0 },
      low: { label: 'Низкий', count: 0 },
      none: { label: 'Без приоритета', count: 0 },
    }

    taskStore.tasks.forEach((task) => {
      priorities[task.priority || 'none'].count++
    })

    return {
      labels: Object.values(priorities).map((p) => p.label),
      series: [
        {
          name: 'Задачи по приоритету',
          type: 'pie',
          data: Object.values(priorities).map((p) => ({
            value: p.count,
            name: p.label,
          })),
        },
      ],
    }
  } else {
    return {
      labels: ['Выполнено', 'В процессе', 'Не начато'],
      series: [
        {
          name: 'Статус задач',
          type: 'pie',
          data: [
            { value: taskStore.completedTasks, name: 'Выполнено' },
            {
              value: taskStore.tasks.filter((t) => !t.completed && t.startedAt)
                .length,
              name: 'В процессе',
            },
            {
              value: taskStore.tasks.filter((t) => !t.completed && !t.startedAt)
                .length,
              name: 'Не начато',
            },
          ],
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
    series: [
      {
        name: 'Выполнено задач',
        type: 'bar',
        data: productivityData,
      },
    ],
  }
})

// Анализ продуктивности
const analyzeProductivity = async () => {
  loadingAI.value = true

  try {
    // Имитация задержки API
    await new Promise((resolve) => setTimeout(resolve, 800))

    const completionRate = productivityPercentage.value
    const overdueCount = taskStore.overdueTasks
    const highPriorityCount = highPriorityTasksCount.value

    if (completionRate >= 80) {
      productivityInsight.value =
        'Отличная продуктивность! Вы выполняете большинство задач в срок.'
      productivityTip.value =
        overdueCount > 0
          ? `У вас ${overdueCount} просроченных задач. Попробуйте выполнить их в первую очередь.`
          : highPriorityCount > 0
            ? `У вас ${highPriorityCount} важных задач. Продолжайте в том же духе!`
            : 'Попробуйте взяться за более сложные задачи, чтобы развиваться.'
    } else if (completionRate >= 50) {
      productivityInsight.value =
        'Хороший результат, но есть куда расти. Вы выполняете больше половины задач.'
      productivityTip.value =
        overdueCount > 2
          ? `У вас ${overdueCount} просроченных задач. Попробуйте технику Pomodoro для повышения эффективности.`
          : 'Сосредоточьтесь на задачах с высоким приоритетом для лучших результатов.'
    } else {
      productivityInsight.value =
        'Продуктивность ниже среднего. Возможно, стоит пересмотреть подход к планированию.'
      productivityTip.value =
        overdueCount > 0
          ? `У вас ${overdueCount} просроченных задач. Начните с самых важных и срочных.`
          : 'Попробуйте начать с небольших задач, чтобы войти в рабочий ритм.'
    }
  } catch (error) {
    console.error('Ошибка анализа продуктивности:', error)
    productivityInsight.value = 'Не удалось проанализировать продуктивность'
    productivityTip.value = 'Попробуйте обновить страницу или повторить позже'
  } finally {
    loadingAI.value = false
  }
}

// Инициализация
onMounted(() => {
  // Восстановление темы
  darkMode.value = localStorage.getItem('darkMode') === 'true'
  document.documentElement.classList.toggle('dark-mode', darkMode.value)

  // Первоначальный анализ
  analyzeProductivity()

  // Автоматический анализ при изменении задач
  watch(() => taskStore.tasks, analyzeProductivity, { deep: true })

  // Обновление даты каждую минуту
  const dateUpdateInterval = setInterval(() => {
    currentDate.value = new Date()
  }, 60000)

  // Очистка при размонтировании
  onUnmounted(() => clearInterval(dateUpdateInterval))
})
</script>

<style scoped lang="scss">
.dashboard {
  width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  transition:
    background-color 0.3s var(--ease-out),
    color 0.3s var(--ease-out);
}

.dashboard-header {
  padding: 20px;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--dashboard-gap);
  gap: 16px;
  animation: fadeIn 0.6s var(--ease-out) both;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
  }

  .dashboard-title {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 600;
    margin: 0;
    line-height: 1.2;
    color: var(--text-primary);
  }

  .dashboard-actions {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-shrink: 0;

    @media (max-width: 767px) {
      width: 100%;
      justify-content: space-between;
    }
  }

  .dashboard-date {
    font-size: 1rem;
    color: var(--text-secondary);
    font-weight: 500;
    white-space: nowrap;
  }

  .theme-toggle {
    background: none;
    border: 1px solid var(--border-dark);
    color: var(--text-secondary);
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition:
      background-color 0.3s var(--ease-out),
      color 0.3s var(--ease-out),
      transform 0.2s var(--ease-out);
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;

    &:hover {
      background-color: var(--primary);
      color: var(--text-primary);
    }

    &:active {
      transform: scale(0.92);
    }

    .material-icons-outlined {
      font-size: 1.5rem;
    }
  }
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dashboard-gap);

  // Планшет (вертикально)
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  // Десктоп
  @media (min-width: 1200px) {
    grid-template-columns: 350px 1fr 350px;
  }
}

.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: var(--dashboard-gap);

  // Центральная колонка занимает больше места на планшетах
  @media (min-width: 768px) and (max-width: 1199px) {
    &:nth-child(2) {
      grid-column: span 2;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--stats-card-min), 1fr));
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

// Анимации
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Плавное появление колонок
.dashboard-column {
  &:nth-child(1) {
    animation: slideInLeft 0.5s var(--ease-out) 0.1s both;
  }
  &:nth-child(2) {
    animation: slideInUp 0.5s var(--ease-out) 0.2s both;
  }
  &:nth-child(3) {
    animation: slideInRight 0.5s var(--ease-out) 0.3s both;
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
