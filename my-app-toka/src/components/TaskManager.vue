<template>
  <div class="ios-task-manager">
    <!-- Редактор задач -->
    <div v-if="editorVisible" class="editor-modal">
      <div class="editor-backdrop" @click="closeEditor"></div>

      <div class="editor-container">
        <h2>{{ editingTask ? 'Редактировать задачу' : 'Новая задача' }}</h2>

        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label>Название</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="Введите название задачи"
              required
            />
          </div>

          <div class="form-group">
            <label>Дата выполнения</label>
            <input v-model="form.dueDate" type="date" />
          </div>

          <div class="form-group">
            <label>Приоритет</label>
            <select v-model="form.priority">
              <option value="none">Нет</option>
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </div>

          <div class="form-group">
            <label>Теги (через запятую)</label>
            <input
              v-model="form.tagsInput"
              type="text"
              placeholder="работа, дом, важное"
            />
          </div>

          <div class="editor-actions">
            <button type="button" class="secondary-button" @click="closeEditor">
              Отмена
            </button>

            <button type="submit" class="primary-button">Сохранить</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Основной интерфейс -->
    <div class="main-interface">
      <div class="controls">
        <button class="primary-button" @click="openEditor(null)">
          <i class="material-icons">add</i>
          Новая задача
        </button>

        <div class="sort-controls">
          <select v-model="sortField">
            <option value="dueDate">По дате</option>
            <option value="title">По названию</option>
            <option value="priority">По приоритету</option>
          </select>

          <button class="icon-button" @click="toggleSortDirection">
            <i class="material-icons">
              {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
            </i>
          </button>
        </div>
      </div>

      <!-- Список задач -->
      <div class="task-list">
        <div v-if="sortedTasks.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="material-icons">checklist</i>
          </div>
          <h3>Нет задач</h3>
          <p>Добавьте новую задачу, нажав на кнопку +</p>
        </div>

        <div
          v-for="task in sortedTasks"
          :key="task.id"
          class="task-card"
          :class="{
            completed: task.completed,
            overdue: taskStore.isTaskOverdue(task),
          }"
        >
          <div
            class="task-main"
            @click="taskStore.toggleTaskCompletion(task.id)"
          >
            <div class="task-checkbox">
              <i class="material-icons">
                {{ task.completed ? 'check_circle' : 'radio_button_unchecked' }}
              </i>
            </div>

            <div class="task-content">
              <h3 class="task-title">{{ task.title }}</h3>

              <div v-if="task.dueDate" class="task-meta">
                <div class="task-due-date">
                  <i class="material-icons">calendar_today</i>
                  <span>{{ formatDate(task.dueDate) }}</span>
                </div>

                <div
                  v-if="task.priority !== 'none'"
                  class="task-priority"
                  :class="task.priority"
                >
                  {{ getPriorityLabel(task.priority) }}
                </div>
              </div>

              <div v-if="task.tags.length > 0" class="task-tags">
                <span v-for="tag in task.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <div class="task-actions">
            <button class="action-button" @click.stop="openEditor(task)">
              <i class="material-icons">edit</i>
            </button>

            <button
              class="action-button danger"
              @click.stop="taskStore.deleteTask(task.id)"
            >
              <i class="material-icons">delete</i>
            </button>
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
const editorVisible = ref(false)
const editingTask = ref(null)
const sortField = ref('dueDate')
const sortDirection = ref('asc')

const form = ref({
  id: null,
  title: '',
  dueDate: '',
  priority: 'none',
  tagsInput: '',
  completed: false,
})

// Загрузка задач при монтировании
onMounted(() => {
  taskStore.loadTasks()
})

// Отсортированные задачи
const sortedTasks = computed(() => {
  return [...taskStore.tasks].sort((a, b) => {
    let valA = a[sortField.value]
    let valB = b[sortField.value]

    if (sortField.value === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 }
      valA = priorityOrder[a.priority]
      valB = priorityOrder[b.priority]
    }

    if (valA == null) return 1
    if (valB == null) return -1

    if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1
    if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })
}

const formatDateForInput = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

const getPriorityLabel = (priority) => {
  const labels = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  }
  return labels[priority] || ''
}

const openEditor = (task) => {
  if (task) {
    form.value = {
      id: task.id,
      title: task.title,
      dueDate: task.dueDate ? formatDateForInput(task.dueDate) : '',
      priority: task.priority,
      tagsInput: task.tags?.join(', ') || '',
      completed: task.completed,
    }
  } else {
    form.value = {
      id: null,
      title: '',
      dueDate: '',
      priority: 'none',
      tagsInput: '',
      completed: false,
    }
  }
  editorVisible.value = true
}

const closeEditor = () => {
  editorVisible.value = false
}

const handleSave = () => {
  const taskData = {
    id: form.value.id || Date.now(),
    title: form.value.title,
    dueDate: form.value.dueDate ? new Date(form.value.dueDate) : null,
    priority: form.value.priority,
    tags: form.value.tagsInput
      ? form.value.tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : [],
    completed: form.value.completed,
  }

  if (form.value.id) {
    taskStore.updateTask(form.value.id, taskData)
  } else {
    taskStore.addTask(taskData)
  }

  closeEditor()
}

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}
</script>

<style lang="scss" scoped>
.ios-task-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
    sans-serif;
  color: #1c1c1e;
  display: flex;
  flex-direction: column;
  gap: 20px;

  // Общие стили для кнопок
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
  }

  .primary-button {
    padding: 10px 16px;
    border-radius: 10px;
    background-color: rgba(0, 122, 255, 0.9);
    color: white;
    font-size: 14px;

    &:hover {
      background-color: rgba(0, 122, 255, 1);
    }
  }

  .secondary-button {
    padding: 10px 16px;
    border-radius: 8px;
    background-color: rgba(209, 209, 214, 0.5);
    color: #1c1c1e;
    font-size: 14px;

    &:hover {
      background-color: rgba(209, 209, 214, 0.7);
    }
  }

  .icon-button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: rgba(242, 242, 247, 0.7);
    backdrop-filter: blur(10px);

    &:hover {
      background-color: rgba(209, 209, 214, 0.5);
    }

    .material-icons {
      font-size: 18px;
    }
  }

  .action-button {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: rgba(209, 209, 214, 0.3);
    color: #636366;

    &:hover {
      background-color: rgba(209, 209, 214, 0.5);
    }

    &.danger:hover {
      background-color: rgba(255, 59, 48, 0.1);
      color: #ff3b30;
    }

    .material-icons {
      font-size: 18px;
    }
  }

  // Стили календаря
  .calendar-container {
    background-color: rgba(242, 242, 247, 0.8);
    border-radius: 14px;
    padding: 16px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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

  // Стили для редактора
  .editor-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .editor-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
  }

  .editor-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    background-color: rgba(242, 242, 247, 0.95);
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 1;
    backdrop-filter: blur(20px);

    h2 {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 20px;
      color: #1c1c1e;
    }

    .form-group {
      margin-bottom: 16px;

      label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        color: #636366;
      }

      input,
      select {
        width: 100%;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid rgba(209, 209, 214, 0.5);
        background-color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;

        &:focus {
          border-color: rgba(0, 122, 255, 0.5);
        }
      }
    }

    .editor-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 24px;
    }
  }

  // Основной интерфейс
  .main-interface {
    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 15px;
    }

    .sort-controls {
      display: flex;
      align-items: center;
      gap: 8px;

      select {
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid rgba(209, 209, 214, 0.5);
        background-color: rgba(242, 242, 247, 0.7);
        backdrop-filter: blur(10px);
        font-size: 14px;
        outline: none;

        &:focus {
          border-color: rgba(0, 122, 255, 0.5);
        }
      }
    }

    // Список задач
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .task-card {
      background-color: rgba(242, 242, 247, 0.7);
      border-radius: 12px;
      padding: 16px;
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
      border: 1px solid rgba(209, 209, 214, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      &.completed {
        opacity: 0.8;
      }

      &.overdue {
        border-left: 3px solid rgba(255, 59, 48, 0.5);
      }

      .task-main {
        display: flex;
        gap: 12px;
        cursor: pointer;

        .task-checkbox {
          flex-shrink: 0;

          .material-icons {
            font-size: 24px;
            color: #34c759;
          }
        }

        .task-content {
          flex-grow: 1;

          .task-title {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
            color: #1c1c1e;
          }

          .task-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 6px;

            .task-due-date {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 13px;
              color: #8e8e93;

              .material-icons {
                font-size: 16px;
              }
            }

            .task-priority {
              font-size: 12px;
              padding: 2px 8px;
              border-radius: 4px;

              &.high {
                background-color: rgba(255, 59, 48, 0.1);
                color: #ff3b30;
              }

              &.medium {
                background-color: rgba(255, 149, 0, 0.1);
                color: #ff9500;
              }

              &.low {
                background-color: rgba(52, 199, 89, 0.1);
                color: #34c759;
              }
            }
          }

          .task-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 8px;

            .tag {
              font-size: 12px;
              padding: 2px 8px;
              background-color: rgba(209, 209, 214, 0.3);
              border-radius: 4px;
              color: #636366;
            }
          }
        }
      }

      &.completed {
        .task-checkbox .material-icons {
          color: #8e8e93;
        }

        .task-title {
          text-decoration: line-through;
          color: #8e8e93;
        }
      }

      &.overdue {
        .task-due-date {
          color: #ff3b30;
        }
      }

      .task-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      background-color: rgba(242, 242, 247, 0.7);
      border-radius: 12px;
      backdrop-filter: blur(10px);

      .empty-icon {
        width: 60px;
        height: 60px;
        background-color: rgba(209, 209, 214, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;

        .material-icons {
          font-size: 32px;
          color: #8e8e93;
        }
      }

      h3 {
        font-size: 18px;
        margin: 0 0 8px 0;
        color: #1c1c1e;
      }

      p {
        font-size: 14px;
        margin: 0;
        color: #8e8e93;
      }
    }
  }
}
</style>
