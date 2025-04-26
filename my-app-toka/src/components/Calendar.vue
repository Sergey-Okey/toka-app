<template>
  <div class="ios-calendar">
    <!-- Заголовок календаря с навигацией -->
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

    <!-- Сетка календаря -->
    <div class="calendar-grid">
      <div
        v-for="day in calendarDays"
        :key="day.date.toString()"
        class="calendar-day"
        :class="{
          'current-month': day.isCurrentMonth,
          today: day.isToday,
          'has-tasks': hasTasks(day.date),
          selected: isSelected(day.date),
        }"
        @click="selectDay(day.date)"
      >
        <div class="day-number">{{ day.dayNumber }}</div>

        <!-- Индикаторы задач -->
        <div v-if="hasTasks(day.date)" class="task-indicators">
          <div
            v-for="task in getTasksForDay(day.date)"
            :key="task.id"
            class="task-indicator"
            :class="{
              completed: task.completed,
              overdue: isOverdue(task),
              'priority-high': task.priority === 'high',
              'priority-medium': task.priority === 'medium',
              'priority-low': task.priority === 'low',
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Список задач на выбранный день -->
    <div v-if="selectedDate" class="day-tasks">
      <h3 class="tasks-title">
        Задачи на
        {{
          selectedDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
          })
        }}
      </h3>

      <div v-if="getTasksForDay(selectedDate).length === 0" class="no-tasks">
        Нет задач на этот день
      </div>

      <div v-else class="task-list">
        <div
          v-for="task in getTasksForDay(selectedDate)"
          :key="task.id"
          class="task-item"
          @click="$emit('task-selected', task)"
        >
          <div class="task-checkbox" :class="{ completed: task.completed }">
            <i class="material-icons">
              {{ task.completed ? 'check_circle' : 'radio_button_unchecked' }}
            </i>
          </div>

          <div class="task-content">
            <div class="task-title" :class="{ completed: task.completed }">
              {{ task.title }}
            </div>

            <div class="task-priority" :class="task.priority">
              {{ getPriorityLabel(task.priority) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()
const emit = defineEmits(['date-selected', 'task-selected'])

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

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  // Первый день месяца
  const firstDay = new Date(year, month, 1)
  // Последний день месяца
  const lastDay = new Date(year, month + 1, 0)

  // Начало календаря (понедельник)
  const startDay = new Date(firstDay)
  startDay.setDate(
    firstDay.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1)
  )

  // Конец календаря (воскресенье)
  const endDay = new Date(lastDay)
  endDay.setDate(
    lastDay.getDate() + (7 - (lastDay.getDay() === 0 ? 7 : lastDay.getDay()))
  )

  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (
    let day = new Date(startDay);
    day <= endDay;
    day.setDate(day.getDate() + 1)
  ) {
    const date = new Date(day)
    days.push({
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString(),
    })
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

const selectDay = (date) => {
  selectedDate.value = date
  emit('date-selected', date)
}

const isSelected = (date) => {
  return (
    selectedDate.value &&
    date.toDateString() === selectedDate.value.toDateString()
  )
}

const hasTasks = (date) => {
  return taskStore.tasks.some((task) => {
    if (!task.dueDate) return false
    return new Date(task.dueDate).toDateString() === date.toDateString()
  })
}

const getTasksForDay = (date) => {
  return taskStore.tasks
    .filter((task) => {
      if (!task.dueDate) return false
      return new Date(task.dueDate).toDateString() === date.toDateString()
    })
    .sort((a, b) => {
      // Сначала невыполненные задачи
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      // Затем по приоритету
      const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
}

const isOverdue = (task) => {
  if (task.completed) return false
  if (!task.dueDate) return false
  return new Date(task.dueDate) < new Date()
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

<style lang="scss" scoped>
.ios-calendar {
  background-color: rgba(242, 242, 247, 0.8);
  border-radius: 14px;
  padding: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  margin: 0 auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .month-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #1c1c1e;
  }

  .nav-button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: rgba(209, 209, 214, 0.3);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(209, 209, 214, 0.5);
    }

    .material-icons {
      font-size: 20px;
      color: #007aff;
    }
  }
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;

  .weekday {
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    color: #636366;
    padding: 4px;
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;

  .calendar-day {
    aspect-ratio: 1;
    padding: 6px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;

    .day-number {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .task-indicators {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 2px;
      width: 100%;

      .task-indicator {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #007aff;

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
      background-color: rgba(209, 209, 214, 0.3);
    }

    &.current-month {
      .day-number {
        color: #1c1c1e;
      }
    }

    &:not(.current-month) {
      .day-number {
        color: #8e8e93;
        opacity: 0.6;
      }
    }

    &.today {
      background-color: rgba(0, 122, 255, 0.1);

      .day-number {
        color: #007aff;
        font-weight: 600;
      }
    }

    &.selected {
      background-color: rgba(0, 122, 255, 0.2);

      .day-number {
        color: #007aff;
        font-weight: 600;
      }
    }

    &.has-tasks {
      .day-number {
        font-weight: 600;
      }
    }
  }
}

.day-tasks {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(209, 209, 214, 0.5);

  .tasks-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: #1c1c1e;
  }

  .no-tasks {
    color: #8e8e93;
    font-size: 14px;
    text-align: center;
    padding: 12px;
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .task-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: rgba(255, 255, 255, 0.7);
      border-radius: 10px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.9);
      }

      .task-checkbox {
        flex-shrink: 0;

        .material-icons {
          font-size: 22px;
          color: #34c759;
        }

        &.completed {
          .material-icons {
            color: #8e8e93;
          }
        }
      }

      .task-content {
        flex-grow: 1;
        min-width: 0;

        .task-title {
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #1c1c1e;

          &.completed {
            text-decoration: line-through;
            color: #8e8e93;
          }
        }

        .task-priority {
          font-size: 11px;
          margin-top: 2px;
          color: #636366;

          &.high {
            color: #ff3b30;
          }

          &.medium {
            color: #ff9500;
          }

          &.low {
            color: #34c759;
          }
        }
      }
    }
  }
}
</style>
