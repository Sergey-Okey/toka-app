<template>
  <div class="task-manager">
    <!-- Кнопка назад в календарь -->
    <button v-if="selectedDate" class="back-button" @click="backToCalendar">
      <i class="material-icons">arrow_back</i>
      Назад к календарю
    </button>

    <!-- Редактор задач -->
    <transition name="fade">
      <div v-if="editorVisible" class="editor-modal">
        <div class="editor-backdrop" @click="closeEditor"></div>

        <div class="editor-container">
          <div class="editor-header">
            <h2>{{ editingTask ? 'Редактировать задачу' : 'Новая задача' }}</h2>
            <button class="close-button" @click="closeEditor">
              <i class="material-icons">close</i>
            </button>
          </div>

          <form @submit.prevent="handleSave" class="editor-form">
            <div class="form-group">
              <label>Название</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="Введите название задачи"
                required
                class="input-field"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Дата выполнения</label>
                <div class="date-picker">
                  <input
                    v-model="form.dueDate"
                    type="date"
                    class="input-field"
                  />
                  <button
                    type="button"
                    class="clear-button"
                    @click="clearDueDate"
                    :disabled="!form.dueDate"
                  >
                    <i class="material-icons">close</i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Приоритет</label>
                <div class="priority-select">
                  <select v-model="form.priority" class="select-field">
                    <option value="none">Без приоритета</option>
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Теги</label>
              <div class="tags-input-container">
                <div class="tags-input">
                  <input
                    v-model="newTag"
                    type="text"
                    placeholder="Добавить тег"
                    @keydown.enter.prevent="addTag"
                    class="input-field"
                  />
                  <button
                    type="button"
                    class="add-tag-button"
                    @click="addTag"
                    :disabled="!newTag"
                  >
                    <i class="material-icons">add</i>
                  </button>
                </div>
                <div class="tags-list">
                  <span v-for="tag in form.tags" :key="tag" class="tag">
                    {{ tag }}
                    <button @click="removeTag(tag)" class="tag-remove">
                      <i class="material-icons">close</i>
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div class="editor-actions">
              <button
                type="button"
                class="secondary-button"
                @click="closeEditor"
              >
                Отмена
              </button>
              <button type="submit" class="primary-button">
                {{ editingTask ? 'Сохранить' : 'Создать' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Основной интерфейс -->
    <div class="main-interface">
      <div class="controls">
        <div class="search-container">
          <div class="search-input-container">
            <i class="material-icons search-icon">search</i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск задач..."
              class="search-input"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="clear-search"
            >
              <i class="material-icons">close</i>
            </button>
          </div>

          <select v-model="filterStatus" class="filter-select">
            <option value="all">Все задачи</option>
            <option value="active">Активные</option>
            <option value="completed">Завершенные</option>
            <option value="overdue">Просроченные</option>
          </select>
        </div>

        <div class="actions-container">
          <button
            class="primary-button new-task-button"
            @click="openEditor(null)"
          >
            <i class="material-icons">add</i>
            Новая задача
          </button>

          <div class="sort-container">
            <select v-model="sortField" class="sort-select">
              <option value="dueDate">По дате</option>
              <option value="title">По названию</option>
              <option value="priority">По приоритету</option>
              <option value="createdAt">По дате создания</option>
            </select>
            <button class="sort-direction" @click="toggleSortDirection">
              <i class="material-icons">
                {{
                  sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'
                }}
              </i>
            </button>
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-value">{{ taskStore.totalTasks }}</div>
          <div class="stat-label">Всего задач</div>
          <div class="stat-icon">
            <i class="material-icons">list_alt</i>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ taskStore.activeTasks }}</div>
          <div class="stat-label">Активных</div>
          <div class="stat-icon">
            <i class="material-icons">pending_actions</i>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ taskStore.completedTasks }}</div>
          <div class="stat-label">Завершено</div>
          <div class="stat-icon">
            <i class="material-icons">check_circle</i>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ taskStore.overdueTasks }}</div>
          <div class="stat-label">Просрочено</div>
          <div class="stat-icon">
            <i class="material-icons">warning</i>
          </div>
        </div>
      </div>

      <!-- Список задач -->
      <div class="task-list">
        <div v-if="filteredTasks.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="material-icons">checklist</i>
          </div>
          <h3>Нет задач</h3>
          <p v-if="selectedDate">Нет задач на {{ formattedSelectedDate }}</p>
          <p v-else>Добавьте новую задачу, нажав на кнопку ниже</p>
          <button class="primary-button" @click="openEditor(null)">
            <i class="material-icons">add</i>
            Создать задачу
          </button>
        </div>

        <transition-group name="task-list">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="task-card"
            :class="{
              completed: task.completed,
              overdue: taskStore.isTaskOverdue(task),
              [task.priority]: task.priority !== 'none',
            }"
          >
            <div
              class="task-checkbox"
              @click="taskStore.toggleTaskCompletion(task.id)"
            >
              <div class="checkbox" :class="{ checked: task.completed }">
                <i class="material-icons" v-if="task.completed">check</i>
              </div>
            </div>

            <div class="task-content" @click="openEditor(task)">
              <div class="task-header">
                <h3 class="task-title">{{ task.title }}</h3>
                <div class="task-priority" v-if="task.priority !== 'none'">
                  <span :class="task.priority">{{
                    getPriorityLabel(task.priority)
                  }}</span>
                </div>
              </div>

              <div class="task-meta">
                <div v-if="task.dueDate" class="task-date">
                  <i class="material-icons">event</i>
                  <span>{{ formatDate(task.dueDate) }}</span>
                  <span
                    v-if="taskStore.isTaskOverdue(task)"
                    class="overdue-badge"
                  >
                    Просрочено
                  </span>
                </div>

                <div class="task-created">
                  <i class="material-icons">schedule</i>
                  <span>{{ formatDate(task.createdAt, true) }}</span>
                </div>
              </div>

              <div v-if="task.tags.length > 0" class="task-tags">
                <span v-for="tag in task.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="task-actions">
              <button class="action-button" @click.stop="openEditor(task)">
                <i class="material-icons">edit</i>
              </button>
              <button
                class="action-button danger"
                @click.stop="confirmDelete(task.id)"
              >
                <i class="material-icons">delete</i>
              </button>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- Диалог подтверждения удаления -->
    <transition name="fade">
      <div v-if="confirmDialogVisible" class="confirm-dialog">
        <div
          class="dialog-backdrop"
          @click="confirmDialogVisible = false"
        ></div>
        <div class="dialog-content">
          <div class="dialog-icon">
            <i class="material-icons">warning</i>
          </div>
          <h3>Удалить задачу?</h3>
          <p>
            Вы уверены, что хотите удалить эту задачу? Это действие нельзя
            отменить.
          </p>
          <div class="dialog-actions">
            <button
              class="secondary-button"
              @click="confirmDialogVisible = false"
            >
              Отмена
            </button>
            <button class="primary-button danger" @click="handleDeleteTask">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

// Состояние UI
const editorVisible = ref(false)
const editingTask = ref(null)
const confirmDialogVisible = ref(false)
const deleteTaskId = ref(null)
const newTag = ref('')

// Параметры сортировки и фильтрации
const sortField = ref('dueDate')
const sortDirection = ref('asc')
const filterStatus = ref('all')
const searchQuery = ref('')

// Форма редактирования
const form = ref({
  id: null,
  title: '',
  dueDate: '',
  priority: 'none',
  tags: [],
  completed: false,
  createdAt: new Date().toISOString(),
})

// Обработка выбранной даты из query параметра
const selectedDate = computed(() => {
  return route.query.date ? new Date(route.query.date) : null
})

const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
})

// Методы работы с задачами
const openEditor = (task) => {
  if (task) {
    form.value = {
      id: task.id,
      title: task.title,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority,
      tags: [...task.tags],
      completed: task.completed,
      createdAt: task.createdAt,
    }
    editingTask.value = task
  } else {
    // Если есть выбранная дата, устанавливаем ее для новой задачи
    const dueDate = selectedDate.value
      ? selectedDate.value.toISOString().split('T')[0]
      : ''

    form.value = {
      id: null,
      title: '',
      dueDate: dueDate,
      priority: 'none',
      tags: [],
      completed: false,
      createdAt: new Date().toISOString(),
    }
    editingTask.value = null
  }
  editorVisible.value = true
}

const closeEditor = () => {
  editorVisible.value = false
  newTag.value = ''
}

const handleSave = () => {
  const taskData = {
    id: form.value.id || Date.now().toString(),
    title: form.value.title,
    dueDate: form.value.dueDate
      ? new Date(form.value.dueDate).toISOString()
      : null,
    priority: form.value.priority,
    tags: form.value.tags,
    completed: form.value.completed,
    createdAt: form.value.createdAt || new Date().toISOString(),
  }

  taskStore.saveTask(taskData)
  closeEditor()
}

const confirmDelete = (taskId) => {
  deleteTaskId.value = taskId
  confirmDialogVisible.value = true
}

const handleDeleteTask = () => {
  taskStore.deleteTask(deleteTaskId.value)
  confirmDialogVisible.value = false
}

// Методы работы с тегами
const addTag = () => {
  if (newTag.value.trim() && !form.value.tags.includes(newTag.value.trim())) {
    form.value.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  form.value.tags = form.value.tags.filter((t) => t !== tag)
}

const clearDueDate = () => {
  form.value.dueDate = ''
}

// Навигация
const backToCalendar = () => {
  router.push('/calendar')
}

// Сортировка и фильтрация
const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}

const filteredTasks = computed(() => {
  // Фильтрация по выбранной дате если она есть
  let tasks = selectedDate.value
    ? taskStore.getTasksForDate(selectedDate.value)
    : [...taskStore.tasks]

  // Фильтрация по статусу
  if (filterStatus.value === 'active') {
    tasks = tasks.filter((task) => !task.completed)
  } else if (filterStatus.value === 'completed') {
    tasks = tasks.filter((task) => task.completed)
  } else if (filterStatus.value === 'overdue') {
    tasks = tasks.filter((task) => taskStore.isTaskOverdue(task))
  }

  // Поиск по запросу
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    tasks = tasks.filter((task) => {
      const inTitle = task.title.toLowerCase().includes(search)
      const inTags = task.tags.some((tag) => tag.toLowerCase().includes(search))
      return inTitle || inTags
    })
  }

  // Сортировка и перемещение выполненных задач вниз
  return [...tasks].sort((a, b) => {
    // Сначала выполненные задачи идут вниз
    if (a.completed && !b.completed) return 1
    if (!a.completed && b.completed) return -1

    // Для числовых значений (приоритет)
    if (sortField.value === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 }
      const valA = priorityOrder[a.priority]
      const valB = priorityOrder[b.priority]
      return sortDirection.value === 'asc' ? valA - valB : valB - valA
    }

    // Для дат
    if (sortField.value === 'dueDate' || sortField.value === 'createdAt') {
      const valA = a[sortField.value]
        ? new Date(a[sortField.value]).getTime()
        : 0
      const valB = b[sortField.value]
        ? new Date(b[sortField.value]).getTime()
        : 0
      return sortDirection.value === 'asc' ? valA - valB : valB - valA
    }

    // Для строк
    const valA = a[sortField.value]?.toString().toLowerCase() || ''
    const valB = b[sortField.value]?.toString().toLowerCase() || ''
    if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1
    if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

// Вспомогательные функции
const formatDate = (dateString, time = false) => {
  if (!dateString) return ''
  const date = new Date(dateString)

  if (time) {
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year:
      date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })
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
.task-manager {
  --primary-color: #31a974;
  --danger-color: #ff3b30;
  --warning-color: #ff9500;
  --success-color: #34c759;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --bg-primary: #323233;
  --bg-secondary: #2a2a2b;
  --border-color: rgba(221, 221, 221, 0.2);
  --card-bg: rgba(50, 50, 51, 0.8);
  --hover-bg: rgba(255, 255, 255, 0.05);
  --border-radius: 1.2rem;

  margin: 0 auto;
  padding: 2rem;
  color: var(--text-primary);
  max-width: 1200px;

  // Анимации
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .task-list-move,
  .task-list-enter-active,
  .task-list-leave-active {
    transition: all 0.3s ease;
  }
  .task-list-enter-from,
  .task-list-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
  .task-list-leave-active {
    position: absolute;
  }

  // Общие стили
  .material-icons {
    font-size: 1.2rem;
    user-select: none;
  }

  // Кнопка назад
  .back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    margin-bottom: 1.5rem;
    cursor: pointer;
    transition: color 0.2s ease;
    font-size: 0.95rem;

    &:hover {
      color: var(--primary-color);
    }
  }

  // Редактор задач
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
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
  }

  .editor-container {
    position: relative;
    background: var(--bg-primary);
    width: 100%;
    max-width: 500px;
    border-radius: var(--border-radius);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 1;
    border: 1px solid var(--border-color);
    overflow: hidden;
    margin: 1rem;
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 1.5rem 1rem;
    border-bottom: 1px solid var(--border-color);

    h2 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 500;
    }

    .close-button {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        background: var(--hover-bg);
        color: var(--text-primary);
      }
    }
  }

  .editor-form {
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.2rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
  }

  .form-row {
    display: flex;
    gap: 1rem;

    .form-group {
      flex: 1;
    }

    @media (max-width: 480px) {
      flex-direction: column;
      gap: 1rem;
    }
  }

  .input-field {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    color: var(--text-primary);
    font-size: 0.95rem;
    transition: all 0.3s ease;

    &:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(49, 169, 116, 0.2);
    }

    &::placeholder {
      color: var(--text-secondary);
      opacity: 0.7;
    }
  }

  .select-field {
    @extend .input-field;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
  }

  .date-picker {
    position: relative;
    display: flex;
    align-items: center;

    .clear-button {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        color: var(--text-primary);
        background: var(--hover-bg);
      }

      &:disabled {
        opacity: 0;
        pointer-events: none;
      }
    }
  }

  .tags-input-container {
    .tags-input {
      position: relative;
      display: flex;
      margin-bottom: 0.5rem;

      .add-tag-button {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--primary-color);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(49, 169, 116, 0.1);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;

      .tag {
        display: inline-flex;
        align-items: center;
        background: rgba(49, 169, 116, 0.15);
        color: var(--primary-color);
        padding: 0.35rem 0.75rem;
        border-radius: var(--border-radius);
        font-size: 0.8rem;
        font-weight: 500;

        .tag-remove {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 0.3rem;
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0.1rem;
          border-radius: 50%;
          transition: all 0.2s ease;

          &:hover {
            background: rgba(0, 0, 0, 0.1);
          }

          .material-icons {
            font-size: 0.9rem;
          }
        }
      }
    }
  }

  .editor-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }

  // Основной интерфейс
  .main-interface {
    .controls {
      margin-bottom: 2rem;
    }

    .search-container {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;

      @media (max-width: 768px) {
        flex-direction: column;
      }
    }

    .search-input-container {
      flex: 1;
      position: relative;

      .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary);
        pointer-events: none;
      }

      .clear-search {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: all 0.2s ease;

        &:hover {
          color: var(--text-primary);
          background: var(--hover-bg);
        }
      }
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      color: var(--text-primary);
      font-size: 0.95rem;
      transition: all 0.3s ease;

      &:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(49, 169, 116, 0.2);
      }
    }

    .filter-select {
      width: 200px;
      @extend .select-field;

      @media (max-width: 768px) {
        width: 100%;
      }
    }

    .actions-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .new-task-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: darken(#31a974, 8%);
        box-shadow: 0 2px 10px rgba(49, 169, 116, 0.3);
      }
    }

    .sort-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      @media (max-width: 768px) {
        width: 100%;
      }
    }

    .sort-select {
      width: 160px;
      @extend .select-field;

      @media (max-width: 768px) {
        width: 100%;
      }
    }

    .sort-direction {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--hover-bg);
        color: var(--text-primary);
      }
    }
  }

  // Статистика
  .stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;

    @media (max-width: 480px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  .stat-card {
    position: relative;
    background: var(--card-bg);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    border: 1px solid var(--border-color);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--primary-color);
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .stat-icon {
      position: absolute;
      right: 1.5rem;
      top: 1.5rem;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.2;

      .material-icons {
        font-size: 1.5rem;
      }
    }
  }

  // Список задач
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .task-card {
    display: flex;
    align-items: flex-start;
    background: var(--card-bg);
    border-radius: var(--border-radius);
    padding: 1.25rem;
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      border-color: rgba(49, 169, 116, 0.3);
    }

    &.completed {
      opacity: 0.7;
      background: rgba(50, 50, 51, 0.6);

      .task-title {
        text-decoration: line-through;
      }

      .checkbox {
        background: rgba(120, 120, 120, 0.3);
        border-color: rgba(120, 120, 120, 0.5);
      }
    }

    &.overdue {
      border-left: 4px solid var(--danger-color);
    }

    &.high {
      border-left: 4px solid var(--danger-color);
    }

    &.medium {
      border-left: 4px solid var(--warning-color);
    }

    &.low {
      border-left: 4px solid var(--success-color);
    }

    .task-checkbox {
      margin-right: 1rem;
      padding-top: 0.15rem;

      .checkbox {
        width: 1.25rem;
        height: 1.25rem;
        border: 2px solid var(--primary-color);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &.checked {
          background: var(--primary-color);

          .material-icons {
            color: white;
            font-size: 1rem;
          }
        }
      }
    }

    .task-content {
      flex: 1;
      cursor: pointer;

      .task-header {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .task-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 500;
        color: var(--text-primary);
      }

      .task-priority {
        margin-left: 0.75rem;

        span {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;

          &.high {
            background: rgba(255, 59, 48, 0.15);
            color: var(--danger-color);
          }
          &.medium {
            background: rgba(255, 149, 0, 0.15);
            color: var(--warning-color);
          }
          &.low {
            background: rgba(52, 199, 89, 0.15);
            color: var(--success-color);
          }
        }
      }

      .task-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 0.75rem;
        font-size: 0.85rem;
        color: var(--text-secondary);

        .task-date,
        .task-created {
          display: flex;
          align-items: center;
          gap: 0.3rem;

          .material-icons {
            font-size: 1rem;
            opacity: 0.7;
          }
        }

        .overdue-badge {
          margin-left: 0.5rem;
          padding: 0.15rem 0.5rem;
          background: rgba(255, 59, 48, 0.15);
          border-radius: 4px;
          color: var(--danger-color);
          font-size: 0.75rem;
          font-weight: 600;
        }
      }

      .task-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;

        .tag {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          background: rgba(49, 169, 116, 0.15);
          border-radius: var(--border-radius);
          color: var(--primary-color);
        }
      }
    }

    .task-actions {
      display: flex;
      gap: 0.5rem;
      margin-left: 1rem;

      @media (max-width: 480px) {
        margin-left: 0;
        margin-top: 1rem;
        justify-content: flex-end;
      }

      .action-button {
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--hover-bg);
          color: var(--text-primary);

          &.danger {
            background: rgba(255, 59, 48, 0.1);
            color: var(--danger-color);
          }
        }

        .material-icons {
          font-size: 1rem;
        }
      }
    }

    @media (max-width: 480px) {
      flex-direction: column;
    }
  }

  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
    border: 1px dashed var(--border-color);
    margin: 2rem 0;

    .empty-icon {
      width: 3.5rem;
      height: 3.5rem;
      background: rgba(49, 169, 116, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.2rem;

      .material-icons {
        font-size: 1.8rem;
        color: var(--primary-color);
      }
    }

    h3 {
      font-size: 1.2rem;
      margin: 0 0 0.5rem;
      color: var(--text-primary);
    }

    p {
      font-size: 0.9rem;
      margin: 0 0 1.5rem;
      color: var(--text-secondary);
    }

    .primary-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
  }

  // Диалог подтверждения
  .confirm-dialog {
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

  .dialog-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
  }

  .dialog-content {
    position: relative;
    background: var(--bg-primary);
    width: 100%;
    max-width: 400px;
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 1;
    border: 1px solid var(--border-color);
    text-align: center;
    margin: 1rem;
  }

  .dialog-icon {
    width: 3rem;
    height: 3rem;
    background: rgba(255, 59, 48, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;

    .material-icons {
      font-size: 1.8rem;
      color: var(--danger-color);
    }
  }

  .dialog-content h3 {
    margin: 0 0 0.5rem;
    font-size: 1.2rem;
    color: var(--text-primary);
  }

  .dialog-content p {
    margin: 0 0 1.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .dialog-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  // Кнопки
  .primary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: darken(#31a974, 8%);
      box-shadow: 0 2px 10px rgba(49, 169, 116, 0.3);
    }

    &.danger {
      background: var(--danger-color);

      &:hover {
        background: darken(#ff3b30, 8%);
        box-shadow: 0 2px 10px rgba(255, 59, 48, 0.3);
      }
    }
  }

  .secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: var(--hover-bg);
    }
  }

  /* Адаптив */
  @media (max-width: 768px) {
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    .stats-container {
      grid-template-columns: 1fr;
    }
  }
}
</style>
