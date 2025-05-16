<template>
  <div class="analytics-widget widget-card">
    <div class="widget-header">
      <h2 class="widget-title">Аналитика</h2>
      <button
        class="refresh-btn"
        :disabled="loading"
        @click="analyze"
        aria-label="Обновить аналитику"
      >
        <i class="material-icons-outlined">refresh</i>
      </button>
    </div>

    <div class="analytics-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner" />
        <p>Анализируем продуктивность...</p>
      </div>

      <div v-else>
        <section class="chart-section" v-if="chartData.length">
          <apexchart
            type="line"
            height="200"
            :options="chartOptions"
            :series="series"
          />
        </section>

        <section class="insight-section">
          <h3 class="section-title">
            <i class="material-icons-outlined icon">lightbulb</i>
            Инсайт
          </h3>
          <p class="insight-text">{{ insight || 'Нет данных для анализа' }}</p>
        </section>

        <section class="tip-section">
          <h3 class="section-title">
            <i class="material-icons-outlined icon">tips_and_updates</i>
            Совет
          </h3>
          <p class="tip-text">
            {{ tip || 'Выполните задачи, чтобы получить советы' }}
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ApexCharts from 'vue3-apexcharts'
import { useTaskStore } from '@/store/tasks'

const taskStore = useTaskStore()

const loading = ref(false)
const insight = ref('')
const tip = ref('')
const chartData = ref<{ date: string; done: number }[]>([])

// Формат данных для ApexCharts
const series = ref([{ name: 'Выполнено', data: [] as number[] }])
const chartOptions = ref({
  chart: {
    id: 'productivity-chart',
    animations: { enabled: true },
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  xaxis: {
    categories: [] as string[],
    labels: { rotate: -45, style: { fontSize: '12px' } },
  },
  yaxis: {
    min: 0,
    title: { text: 'Задачи' },
    labels: { style: { fontSize: '12px' } },
  },
  grid: {
    borderColor: '#eee',
    strokeDashArray: 5,
  },
  stroke: {
    curve: 'smooth',
    width: 2,
  },
  tooltip: {
    enabled: true,
    theme: 'light',
  },
  colors: ['var(--primary)'],
})

const analyze = async () => {
  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 800))

  const tasks = taskStore.tasks
  const completed = tasks.filter((t) => t.completed).length
  const total = tasks.length
  const overdue = taskStore.overdueTasks
  const highPriority = tasks.filter(
    (t) => t.priority === 'high' && !t.completed
  ).length

  const productivity = total ? Math.round((completed / total) * 100) : 0

  let profile: 'systematic' | 'impulsive' | 'overwhelmed' | 'neutral' =
    'neutral'
  if (productivity >= 80 && overdue <= 2) profile = 'systematic'
  else if (productivity <= 50 && overdue >= 5) profile = 'overwhelmed'
  else if (productivity <= 70 && overdue >= 1) profile = 'impulsive'

  switch (profile) {
    case 'systematic':
      insight.value = 'Вы работаете чётко и последовательно.'
      tip.value = highPriority
        ? `Закройте ${highPriority} задач высокого приоритета сегодня.`
        : 'Спланируйте неделю с опорой на одну ключевую цель.'
      break
    case 'impulsive':
      insight.value = 'Вы работаете рывками. Присутствует неустойчивость.'
      tip.value = overdue
        ? `Просрочено ${overdue} задач. Удалите или выполните их первыми.`
        : 'Сформируйте привычку: 1 задача утром без отвлечений.'
      break
    case 'overwhelmed':
      insight.value = 'Низкая продуктивность. Наблюдается перегруз.'
      tip.value =
        'Сократите входящий поток. Работайте только по 3 задачам в день.'
      break
    default:
      insight.value = 'Данных недостаточно для чёткого профиля.'
      tip.value = 'Завершайте задачи ежедневно, чтобы видеть динамику.'
  }

  const byDay = new Map<string, number>()
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    byDay.set(key, 0)
  }

  tasks.forEach((task) => {
    if (task.completed && task.completedAt) {
      const dateKey = task.completedAt.slice(0, 10)
      if (byDay.has(dateKey)) {
        byDay.set(dateKey, byDay.get(dateKey)! + 1)
      }
    }
  })

  chartData.value = [...byDay.entries()].map(([date, done]) => ({ date, done }))

  // Обновляем ApexCharts данные
  chartOptions.value.xaxis.categories = chartData.value.map((d) => d.date)
  series.value[0].data = chartData.value.map((d) => d.done)

  loading.value = false
}
</script>

<style scoped lang="scss">
.analytics-widget {
  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .widget-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-primary);
    }
  }

  .refresh-btn {
    background: var(--bg-secondary);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 1.4rem;
    transition: all 0.3s ease;

    &:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      transform: rotate(90deg);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .analytics-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 20px 0;
    color: var(--text-secondary);
  }

  .loading-spinner {
    width: 44px;
    height: 44px;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .chart-section {
    width: 100%;
    height: 200px;
  }

  .section-title {
    display: flex;
    align-items: center;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 10px;

    .icon {
      font-size: 1.6rem;
      margin-right: 8px;
      color: var(--primary);
    }
  }

  .insight-text,
  .tip-text {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-primary);
  }

  .tip-section {
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 400px) {
    .widget-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .refresh-btn {
      align-self: flex-end;
    }

    .widget-title {
      font-size: 1.2rem;
    }

    .section-title {
      font-size: 0.95rem;

      .icon {
        font-size: 1.4rem;
      }
    }

    .insight-text,
    .tip-text {
      font-size: 0.9rem;
    }
  }
}
</style>
