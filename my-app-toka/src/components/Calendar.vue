<template>
  <div class="calendar-container">
    <!-- Заголовок календаря с навигацией -->
    <div class="calendar-header">
      <button
        class="nav-button"
        @click="prevMonth"
        aria-label="Предыдущий месяц"
      >
        <i class="material-icons">chevron_left</i>
      </button>

      <h2 class="month-title">{{ currentMonthName }} {{ currentYear }}</h2>

      <button
        class="nav-button"
        @click="nextMonth"
        aria-label="Следующий месяц"
      >
        <i class="material-icons">chevron_right</i>
      </button>
    </div>

    <!-- Дни недели -->
    <div class="weekdays">
      <div v-for="day in weekDays" :key="day" class="weekday">
        {{ day }}
      </div>
    </div>

    <!-- Сетка календаря -->
    <div class="calendar-grid">
      <div
        v-for="day in calendarDays"
        :key="day.date.toString()"
        class="calendar-day"
        :class="{
          'current-month': day.isCurrentMonth,
          today: day.isToday,
          'has-tasks': taskStore.hasTasksForDate(day.date),
          selected: isSelected(day.date),
          weekend: day.isWeekend,
        }"
        @click="handleDayClick(day.date)"
        :aria-selected="isSelected(day.date)"
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
            :title="task.title"
          ></div>
        </div>
      </div>
    </div>

    <!-- Панель задач выбранного дня -->
    <transition name="slide-up">
      <div
        v-if="showDayTasks && selectedDayTasks.length > 0"
        class="day-tasks-panel"
      >
        <div class="day-tasks-header">
          <h3>Задачи на {{ formattedSelectedDate }}</h3>
          <button class="close-panel" @click="showDayTasks = false">
            <i class="material-icons">close</i>
          </button>
        </div>
        <div class="day-tasks-list">
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
            @click="openTaskEditor(task)"
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
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const taskStore = useTaskStore()

// Состояние календаря
const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const showDayTasks = ref(false)

// Дни недели
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

  // Получаем первый и последний день месяца
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Находим понедельник первой недели календаря
  const startDay = new Date(firstDay)
  startDay.setDate(
    firstDay.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1)
  )

  // Находим воскресенье последней недели календаря
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

// Методы навигации
const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

// Обработчики взаимодействия
const handleDayClick = (date) => {
  selectedDate.value = date
  if (taskStore.hasTasksForDate(date)) {
    showDayTasks.value = true
  } else {
    showDayTasks.value = false
  }
}

const showTaskManager = (date = null) => {
  router.push({
    path: '/tasks',
    query: date ? { date: date.toISOString().split('T')[0] } : {},
  })
}

const openTaskEditor = (task) => {
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
.calendar-container {
  border-radius: 1.2rem;
  backdrop-filter: blur(50px);
  padding: 1.5rem;
  border: 1px solid rgba(221, 221, 221, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 100%;
  margin: 0 auto;
  margin-bottom: 1rem;
  background-color: rgba(40, 40, 42, 0.7);
  position: relative;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  .month-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
    color: #ffffff;
  }

  .nav-button {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background-color: rgba(49, 169, 116, 0.2);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(49, 169, 116, 0.3);
    }

    .material-icons {
      font-size: 1.3rem;
      color: #31a974;
    }
  }
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 1rem;

  .weekday {
    text-align: center;
    font-size: 1rem;
    font-weight: 500;
    color: #b0b0b0;
    padding: 0.5rem;
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;

  .calendar-day {
    aspect-ratio: 1;
    padding: 0.5rem;
    border-radius: 0.8rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #ffffff27;
    background-color: rgba(30, 30, 32, 0.5);

    .day-number {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0.3rem;
    }

    .task-indicators {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.2rem;
      width: 100%;

      .task-indicator {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;

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
      background-color: rgba(221, 221, 221, 0.1);
    }

    &.current-month {
      .day-number {
        color: #ffffff;
      }
    }

    &:not(.current-month) {
      opacity: 0.5;

      .day-number {
        color: #b0b0b0;
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

.show-tasks-button {
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background-color: rgba(49, 169, 116, 0.2);
  color: #31a974;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;

  &:hover {
    background-color: rgba(49, 169, 116, 0.3);
  }

  .material-icons {
    font-size: 1.2rem;
  }
}

/* Панель задач дня */
.day-tasks-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(40, 40, 42, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(221, 221, 221, 0.2);
  border-radius: 1.2rem 1.2rem 0 0;
  padding: 1rem;
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.2);
  z-index: 10;
  max-height: 60vh;
  overflow-y: auto;
}

.day-tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #ffffff;
  }

  .close-panel {
    background: none;
    border: none;
    color: #b0b0b0;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(221, 221, 221, 0.1);
      color: #ffffff;
    }
  }
}

.day-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.day-task-item {
  display: flex;
  align-items: center;
  padding: 0.8rem;
  border-radius: 0.8rem;
  background: rgba(30, 30, 32, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;

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

    .material-icons {
      color: #31a974;
      font-size: 1.2rem;
    }
  }

  .task-content {
    flex: 1;

    .task-title {
      font-size: 0.95rem;
      color: #ffffff;
      margin-bottom: 0.2rem;
    }

    .task-priority {
      font-size: 0.75rem;
      color: #b0b0b0;
    }
  }
}

/* Анимации */
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Адаптив для мобильных устройств */
@media (max-width: 768px) {
  .calendar-container {
    padding: 1rem;
    border-radius: 1rem;
  }

  .calendar-header {
    .month-title {
      font-size: 1.1rem;
    }

    .nav-button {
      width: 2rem;
      height: 2rem;
    }
  }

  .weekdays .weekday {
    font-size: 0.8rem;
    padding: 0.3rem;
  }

  .calendar-grid {
    gap: 0.3rem;

    .calendar-day {
      padding: 0.3rem;
      border-radius: 0.5rem;

      .day-number {
        font-size: 0.8rem;
      }

      .task-indicators .task-indicator {
        width: 0.4rem;
        height: 0.4rem;
      }
    }
  }

  .show-tasks-button {
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }

  .day-tasks-panel {
    padding: 0.8rem;
    max-height: 50vh;
  }

  .day-tasks-header h3 {
    font-size: 1rem;
  }

  .day-task-item {
    padding: 0.6rem;

    .task-checkbox .material-icons {
      font-size: 1rem;
    }

    .task-content .task-title {
      font-size: 0.85rem;
    }
  }
}

@media (max-width: 480px) {
  .calendar-grid .calendar-day {
    aspect-ratio: 0.8;
  }

  .day-tasks-panel {
    max-height: 80vh;
  }
}
</style>
