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

    <!-- Кнопка для открытия TaskManager -->
    <button
      v-if="selectedDate"
      class="show-tasks-button"
      @click="showTaskManager"
    >
      <i class="material-icons">list_alt</i>
      Показать все задачи на {{ formattedSelectedDate }}
    </button>
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
  showTaskManager(date)
}

const showTaskManager = (date = null) => {
  router.push({
    path: '/tasks',
    query: date ? { date: date.toISOString().split('T')[0] } : {},
  })
}

const isSelected = (date) => {
  return date.toDateString() === selectedDate.value.toDateString()
}
</script>

<style scoped>
.calendar-container {
  border-radius: 1.2rem;
  backdrop-filter: blur(50px);
  padding: 1.5rem;
  border: 1px solid rgba(221, 221, 221, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 100%;
  margin: 0 auto;
  margin-bottom: 1rem;
  background-color: rgba(40, 40, 42, 0.7);
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
    }
  }
}
</style>
