<template>
  <div class="calendar">
    <!-- Заголовок календаря -->
    <div class="calendar-header">
      <button class="nav-button" @click="prevMonth">
        <i class="material-icons">chevron_left</i>
      </button>

      <h2 class="month-title">{{ currentMonthName }} {{ currentYear }}</h2>

      <button class="nav-button" @click="nextMonth">
        <i class="material-icons">chevron_right</i>
      </button>
    </div>

    <!-- Дни недели -->
    <div class="weekdays">
      <div v-for="day in weekDays" :key="day" class="weekday">
        {{ day }}
      </div>
    </div>

    <!-- Сетка дней -->
    <div class="calendar-grid">
      <div
        v-for="day in calendarDays"
        :key="day.date.toString()"
        class="calendar-day"
        :class="{
          'current-month': day.isCurrentMonth,
          today: day.isToday,
          selected: isSelected(day.date),
          'has-tasks': taskStore.hasTasksForDate(day.date),
          weekend: day.isWeekend,
        }"
        @click="selectDate(day.date)"
      >
        <div class="day-number">{{ day.dayNumber }}</div>

        <!-- Индикаторы задач -->
        <div v-if="taskStore.hasTasksForDate(day.date)" class="task-indicators">
          <div
            v-for="task in taskStore.getTasksForDate(day.date)"
            :key="task.id"
            class="task-indicator"
            :class="{
              completed: task.completed,
              overdue: taskStore.isTaskOverdue(task),
              'priority-high': task.priority === 'high',
              'priority-medium': task.priority === 'medium',
              'priority-low': task.priority === 'low',
            }"
          />
        </div>
      </div>
    </div>

    <!-- Панель задач -->
    <div class="day-tasks-panel">
      <div class="day-tasks-header">
        <h3>Задачи на {{ formattedSelectedDate }}</h3>
      </div>

      <div class="day-tasks-list">
        <div v-if="selectedDayTasks.length > 0">
          <div
            v-for="task in selectedDayTasks"
            :key="task.id"
            class="day-task-item"
            :class="{
              completed: task.completed,
              overdue: taskStore.isTaskOverdue(task),
              'priority-high': task.priority === 'high',
              'priority-medium': task.priority === 'medium',
              'priority-low': task.priority === 'low',
            }"
            @click="openTask(task)"
          >
            <div class="task-checkbox">
              <i class="material-icons">
                {{ task.completed ? 'check_circle' : 'radio_button_unchecked' }}
              </i>
            </div>
            <div class="task-content">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-priority">
                {{ getPriorityLabel(task.priority) }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-tasks-message">
          <i class="material-icons">event_note</i>
          <span>Задачи отсутствуют</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const taskStore = useTaskStore()

// Состояние
const currentDate = ref(new Date())
const selectedDate = ref(new Date())

// Константы
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Вычисляемые свойства
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('ru-RU', { month: 'long' })
})

const formattedSelectedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
})

const selectedDayTasks = computed(() => {
  return taskStore.getTasksForDate(selectedDate.value)
})

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Первый и последний день месяца
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Начало календаря (понедельник первой недели)
  const startDay = new Date(firstDay)
  startDay.setDate(
    firstDay.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1)
  )

  // Конец календаря (воскресенье последней недели)
  const endDay = new Date(lastDay)
  endDay.setDate(
    lastDay.getDate() + (7 - (lastDay.getDay() === 0 ? 7 : lastDay.getDay()))
  )

  const days = []
  const currentDay = new Date(startDay)

  while (currentDay <= endDay) {
    const date = new Date(currentDay)
    days.push({
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    })
    currentDay.setDate(currentDay.getDate() + 1)
  }

  return days
})

// Методы
const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const selectDate = (date) => {
  selectedDate.value = date
}

const openTask = (task) => {
  router.push({
    path: '/tasks',
    query: {
      edit: task.id,
      date: new Date(task.dueDate).toISOString().split('T')[0],
    },
  })
}

const isSelected = (date) => {
  return date.toDateString() === selectedDate.value.toDateString()
}

const getPriorityLabel = (priority) => {
  const labels = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  }
  return labels[priority] || ''
}
</script>

<style scoped lang="scss">
.calendar {
  border-radius: 1.2rem;
  backdrop-filter: blur(50px);
  padding: 1.5rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadoe-lg);
  max-width: 100%;
  margin: 0 auto;
  margin-bottom: 1rem;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;

  @media (max-width: 480px) {
    padding: 0.8rem;
    border-radius: 1rem;
  }
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .month-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);

    @media (max-width: 480px) {
      font-size: 1.1rem;
      order: -1;
      width: 100%;
      text-align: center;
    }
  }

  .nav-button {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background-color: var(--primary-bg);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    @media (max-width: 480px) {
      width: 2rem;
      height: 2rem;
    }

    &:hover {
      background-color: var(--primary-rgb);
    }

    .material-icons {
      font-size: 1.3rem;
      color: #31a974;

      @media (max-width: 480px) {
        font-size: 1.1rem;
      }
    }
  }
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    margin-bottom: 0.8rem;
  }

  .weekday {
    text-align: center;
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-primary);
    padding: 0.5rem;

    @media (max-width: 480px) {
      font-size: 0.7rem;
      padding: 0.3rem;
    }
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;

  @media (max-width: 480px) {
    gap: 0.2rem;
  }

  .calendar-day {
    aspect-ratio: 1;
    padding: 0.5rem;
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid var(--border-dark);
    background-color: var(--bg-primary);

    @media (max-width: 480px) {
      padding: 0.2rem;
      border-radius: 0.6rem;
    }

    .day-number {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0.3rem;

      @media (max-width: 480px) {
        font-size: 0.7rem;
        margin-bottom: 0.1rem;
      }
    }

    .task-indicators {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.2rem;
      width: 100%;

      @media (max-width: 480px) {
        gap: 0.1rem;
      }

      .task-indicator {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;

        @media (max-width: 480px) {
          width: 0.3rem;
          height: 0.3rem;
        }

        &.completed {
          background-color: #34c759;
        }

        &.overdue {
          background-color: #ff3b30;
        }

        &.priority-high {
          background-color: #ff3b30;
        }

        &.priority-medium {
          background-color: #ff9500;
        }

        &.priority-low {
          background-color: #34c759;
        }
      }
    }

    &:hover {
      background-color: var(--bg-tertiary);
    }

    &.current-month {
      .day-number {
        color: var(--text-tertiary);
      }
    }

    &:not(.current-month) {
      opacity: 0.5;

      .day-number {
        color: var(--text-tertiary);
      }
    }

    &.today {
      background-color: rgba(49, 169, 116, 0.2);
      border-color: #31a974;

      .day-number {
        color: #31a974;
        font-weight: 600;
      }
    }

    &.selected {
      background-color: rgba(49, 169, 116, 0.3);
      border-color: #31a974;

      .day-number {
        color: #31a974;
        font-weight: 600;
      }
    }

    &.weekend {
      .day-number {
        color: #ff9500;
      }

      &.selected .day-number {
        color: #31a974;
      }
    }

    &.has-tasks {
      .day-number {
        font-weight: 600;
      }
    }
  }
}

.day-tasks-panel {
  margin-top: 1.5rem;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 1rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);

  @media (max-width: 480px) {
    margin-top: 1rem;
    padding: 0.8rem;
    border-radius: 0.8rem;
  }

  .day-tasks-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    @media (max-width: 480px) {
      margin-bottom: 0.8rem;
    }

    h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text-primary);

      @media (max-width: 480px) {
        font-size: 0.9rem;
      }
    }
  }

  .day-tasks-list {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 0.5rem;

    @media (max-width: 480px) {
      max-height: 200px;
    }

    &::-webkit-scrollbar {
      width: 6px;

      @media (max-width: 480px) {
        width: 4px;
      }
    }

    &::-webkit-scrollbar-track {
      background: rgba(221, 221, 221, 0.1);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(221, 221, 221, 0.3);
      border-radius: 3px;
    }
  }

  .no-tasks-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    color: var(--text-tertiary);

    @media (max-width: 480px) {
      padding: 0.8rem;
      font-size: 0.8rem;
    }

    .material-icons {
      font-size: 1.2rem;

      @media (max-width: 480px) {
        font-size: 1rem;
      }
    }
  }
}

.day-task-item {
  display: flex;
  align-items: center;
  padding: 0.8rem;
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    padding: 0.6rem;
    border-radius: 0.6rem;
    margin-bottom: 0.3rem;
  }

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: rgba(49, 169, 116, 0.2);
  }

  &.completed {
    opacity: 0.7;
    .task-title {
      text-decoration: line-through;
    }
  }

  &.overdue {
    border-left: 3px solid #ff3b30;
  }

  &.priority-high {
    border-left: 3px solid #ff3b30;
  }

  &.priority-medium {
    border-left: 3px solid #ff9500;
  }

  &.priority-low {
    border-left: 3px solid #34c759;
  }

  .task-checkbox {
    margin-right: 0.8rem;

    @media (max-width: 480px) {
      margin-right: 0.6rem;
    }

    .material-icons {
      color: #31a974;
      font-size: 1.2rem;

      @media (max-width: 480px) {
        font-size: 1rem;
      }
    }
  }

  .task-content {
    flex: 1;

    .task-title {
      font-size: 0.95rem;
      color: var(--text-primary);
      margin-bottom: 0.2rem;

      @media (max-width: 480px) {
        font-size: 0.8rem;
        margin-bottom: 0.1rem;
      }
    }

    .task-priority {
      font-size: 0.75rem;

      @media (max-width: 480px) {
        font-size: 0.65rem;
      }
    }
  }
}
</style>
