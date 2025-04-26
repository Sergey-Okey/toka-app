<template>
  <div class="calendar-container">
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
          weekend: day.isWeekend,
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
      <h3 class="tasks-title">Задачи на {{ formatSelectedDate }}</h3>

      <div v-if="getTasksForDay(selectedDate).length === 0" class="no-tasks">
        <i class="material-icons">event_available</i>
        <span>Нет задач на этот день</span>
      </div>

      <div v-else class="task-list">
        <div
          v-for="task in getTasksForDay(selectedDate)"
          :key="task.id"
          class="task-item"
          :class="{ completed: task.completed }"
          @click="$emit('task-selected', task)"
        >
          <div class="task-checkbox">
            <i class="material-icons">
              {{ task.completed ? 'check_circle' : 'radio_button_unchecked' }}
            </i>
          </div>

          <div class="task-content">
            <div class="task-title">{{ task.title }}</div>

            <div class="task-meta">
              <div class="task-priority" :class="task.priority">
                <i class="material-icons">priority_high</i>
                <span>{{ getPriorityLabel(task.priority) }}</span>
              </div>

              <div v-if="task.tags.length > 0" class="task-tags">
                <span v-for="tag in task.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button class="add-task-button" @click="handleAddTask">
        <i class="material-icons">add</i>
        Добавить задачу
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()
const emit = defineEmits(['date-selected', 'task-selected', 'add-task'])

// Состояние календаря
const currentDate = ref(new Date())
const selectedDate = ref(new Date())

// Дни недели
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Вычисляемые свойства
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentMonthName = computed(() => {
  return currentDate.value
    .toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric',
    })
    .split(' ')[0]
})

const formatSelectedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  })
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
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
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
    const taskDate = new Date(task.dueDate)
    return (
      taskDate.getDate() === date.getDate() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getFullYear() === date.getFullYear()
    )
  })
}

const getTasksForDay = (date) => {
  return taskStore.tasks
    .filter((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(task.dueDate) < today
}

const getPriorityLabel = (priority) => {
  const labels = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  }
  return labels[priority] || ''
}

const handleAddTask = () => {
  emit('add-task', selectedDate.value)
}
</script>

<style lang="scss" scoped>
.calendar-container {
  border-radius: 1.2rem;
  backdrop-filter: blur(50px);
  padding: 1.5rem;
  border: 1px solid rgba(221, 221, 221, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 100%;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  margin-bottom: 1rem;
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
  gap: 1rem;

  .calendar-day {
    aspect-ratio: 1;
    padding: 0.5rem;
    border-radius: 0.8rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #ffffff27;

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

.day-tasks {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(221, 221, 221, 0.2);

  .tasks-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: #ffffff;
  }

  .no-tasks {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: #b0b0b0;
    font-size: 0.9rem;
    text-align: center;
    padding: 1rem;
    opacity: 0.7;

    .material-icons {
      font-size: 2rem;
      color: #31a974;
    }
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-bottom: 1.5rem;

    .task-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background-color: rgba(40, 40, 42, 0.8);
      border-radius: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid rgba(221, 221, 221, 0.1);

      &:hover {
        border-color: rgba(49, 169, 116, 0.3);
        transform: translateY(-2px);
      }

      &.completed {
        opacity: 0.7;
      }

      .task-checkbox {
        flex-shrink: 0;

        .material-icons {
          font-size: 1.5rem;
          color: #31a974;
        }
      }

      .task-content {
        flex-grow: 1;
        min-width: 0;

        .task-title {
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #ffffff;
        }

        .task-meta {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-top: 0.5rem;

          .task-priority {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            font-size: 0.8rem;
            padding: 0.2rem 0.6rem;
            border-radius: 0.4rem;
            background-color: rgba(221, 221, 221, 0.1);

            &.high {
              color: #ff3b30;
            }

            &.medium {
              color: #ff9500;
            }

            &.low {
              color: #34c759;
            }

            .material-icons {
              font-size: 0.9rem;
            }
          }

          .task-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem;

            .tag {
              font-size: 0.7rem;
              padding: 0.2rem 0.5rem;
              background-color: rgba(49, 169, 116, 0.2);
              border-radius: 0.4rem;
              color: #31a974;
            }
          }
        }
      }
    }
  }

  .add-task-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0.8rem;
    background-color: rgba(49, 169, 116, 0.2);
    color: #31a974;
    font-size: 0.95rem;
    border-radius: 1rem;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;

    &:hover {
      background-color: rgba(49, 169, 116, 0.3);
    }

    .material-icons {
      font-size: 1.2rem;
    }
  }
}

@media (max-width: 500px) {
  .calendar-container {
    padding: 1rem;
    border-radius: 1rem;
  }

  .calendar-header {
    .month-title {
      font-size: 1rem;
    }

    .nav-button {
      width: 2rem;
      height: 2rem;
    }
  }

  .weekdays .weekday {
    font-size: 0.7rem;
  }

  .calendar-day .day-number {
    font-size: 0.7rem;
  }

  .day-tasks {
    .tasks-title {
      font-size: 1rem;
    }

    .task-item {
      padding: 0.8rem;
    }
  }
}
</style>
