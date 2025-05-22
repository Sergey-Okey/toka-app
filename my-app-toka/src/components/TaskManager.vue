<template>
  <div class="task-manager">
    <!-- Back button -->
    <button v-if="selectedDate" class="back-button" @click="backToCalendar">
      <i class="material-icons">arrow_back</i>
      <span>Назад к календарю</span>
    </button>

    <!-- Task editor -->
    <transition name="modal">
      <div v-if="editorVisible" class="editor-modal">
        <div class="editor-backdrop" @click="closeEditor"></div>
        <div class="editor-container">
          <div class="editor-header">
            <h2>{{ editingTask ? 'Редактировать задачу' : 'Новая задача' }}</h2>
            <button class="close-button" @click="closeEditor" aria-label="Закрыть редактор">
              <i class="material-icons">close</i>
            </button>
          </div>

          <form @submit.prevent="handleSave" class="editor-form">
            <div class="form-group">
              <label>Название</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="Введите название"
                required
                class="input-field"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Дата выполнения</label>
                <div class="date-picker">
                  <i class="material-icons calendar-icon">event</i>
                  <input v-model="form.dueDate" type="date" class="input-field" />
                  <button
                    type="button"
                    class="clear-button"
                    @click="clearDueDate"
                    :disabled="!form.dueDate"
                    aria-label="Очистить дату"
                  >
                    <i class="material-icons">close</i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Приоритет</label>
                <select v-model="form.priority" class="select-field">
                  <option value="none">Без приоритета</option>
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Оценка времени (часы)</label>
                <input
                  v-model.number="form.estimatedHours"
                  type="number"
                  min="0"
                  class="input-field"
                  placeholder="0"
                />
              </div>
              <div class="form-group">
                <label>Оценка времени (минуты)</label>
                <input
                  v-model.number="form.estimatedMinutes"
                  type="number"
                  min="0"
                  max="59"
                  class="input-field"
                  placeholder="0"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Теги</label>
              <div class="tags-input-container">
                <div class="tags-input">
                  <input
                    v-model="newTag.name"
                    type="text"
                    placeholder="Добавить тег"
                    @keydown.enter.prevent="addTag"
                    class="input-field"
                  />
                  <div class="color-picker-wrapper">
                    <input
                      v-model="newTag.color"
                      type="color"
                      class="color-picker"
                      title="Выберите цвет"
                    />
                    <div
                      class="color-preview"
                      :style="{ backgroundColor: newTag.color || '#31a974' }"
                    ></div>
                  </div>
                  <button
                    type="button"
                    class="add-tag-button"
                    @click="addTag"
                    :disabled="!newTag.name"
                    aria-label="Добавить тег"
                  >
                    <i class="material-icons">add</i>
                  </button>
                </div>
                <div class="tags-list">
                  <span
                    v-for="tag in form.tags"
                    :key="tag.name"
                    class="tag"
                    :style="{ backgroundColor: tag.color || taskStore.getTagColor(tag.name) }"
                  >
                    {{ tag.name }}
                    <button @click="removeTag(tag)" class="tag-remove" aria-label="Удалить тег">
                      <i class="material-icons">close</i>
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Описание</label>
              <textarea
                v-model="form.description"
                placeholder="Описание задачи"
                class="textarea-field"
                rows="3"
              ></textarea>
            </div>

            <div class="editor-actions">
              <button type="button" class="secondary-button" @click="closeEditor">Отмена</button>
              <button type="submit" class="primary-button">
                {{ editingTask ? 'Сохранить' : 'Создать' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Main interface -->
    <div class="main-interface">
      <div class="controls">
        <div class="search-filter-container">
          <div class="search-container">
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
              aria-label="Очистить поиск"
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
          <button class="primary-button new-task-button" @click="openEditor(null)">
            <i class="material-icons">add</i>
            <span>Новая задача</span>
          </button>

          <div class="sort-container">
            <select v-model="sortField" class="sort-select">
              <option value="dueDate">По дате</option>
              <option value="title">По названию</option>
              <option value="priority">По приоритету</option>
              <option value="createdAt">По дате создания</option>
            </select>
            <button
              class="sort-direction"
              @click="toggleSortDirection"
              aria-label="Изменить направление сортировки"
            >
              <i class="material-icons">
                {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
              </i>
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics -->
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

      <!-- Task list -->
      <div class="task-list">
        <div v-if="filteredTasks.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="material-icons">checklist</i>
          </div>
          <h3>Нет задач</h3>
          <p v-if="selectedDate">Нет задач на {{ formattedSelectedDate }}</p>
          <p v-else>Добавьте новую задачу</p>
          <button class="primary-button" @click="openEditor(null)">
            <i class="material-icons">add</i>
            <span>Создать задачу</span>
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
              [task.priority || 'none']: true,
            }"
          >
            <div class="task-checkbox" @click="taskStore.toggleTaskCompletion(task.id)">
              <div class="checkbox" :class="{ checked: task.completed }">
                <i class="material-icons" v-if="task.completed">check</i>
              </div>
            </div>

            <div class="task-content" @click="openEditor(task)">
              <div class="task-header">
                <h3 class="task-title">{{ task.title }}</h3>
                <div class="task-meta">
                  <div v-if="task.priority !== 'none'" class="task-priority">
                    <span :class="task.priority">{{ getPriorityLabel(task.priority) }}</span>
                  </div>
                  <div v-if="task.dueDate" class="task-date">
                    <i class="material-icons">event</i>
                    <span>{{ formatDate(task.dueDate) }}</span>
                    <span v-if="taskStore.isTaskOverdue(task)" class="overdue-badge">
                      Просрочено
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="task.description" class="task-description">
                {{ truncateDescription(task.description) }}
              </div>

              <div class="task-time-info">
                <div class="time-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: getProgressWidth(task) }"></div>
                  </div>
                  <div class="time-values">
                    <span class="time-spent">{{ formatTimeSpent(task.timeSpent || 0) }}</span>
                    <span class="time-separator">/</span>
                    <span class="time-estimated">
                      {{ formatEstimatedTime(task.estimatedHours, task.estimatedMinutes) }}
                    </span>
                  </div>
                </div>

                <button
                  v-if="activeTaskId === task.id"
                  class="timer-button active"
                  @click.stop="stopTimer"
                >
                  <i class="material-icons">pause</i>
                  <span>Пауза</span>
                </button>
                <button v-else class="timer-button" @click.stop="startTimer(task.id)">
                  <i class="material-icons">play_arrow</i>
                  <span>Старт</span>
                </button>
              </div>

              <div v-if="task.tags && task.tags.length > 0" class="task-tags">
                <span
                  v-for="tag in task.tags"
                  :key="tag.name"
                  class="tag"
                  :style="{ backgroundColor: tag.color || taskStore.getTagColor(tag.name) }"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>

            <div class="task-actions">
              <button
                class="action-button"
                @click.stop="openEditor(task)"
                aria-label="Редактировать задачу"
              >
                <i class="material-icons">edit</i>
              </button>
              <button
                class="action-button danger"
                @click.stop="confirmDelete(task.id)"
                aria-label="Удалить задачу"
              >
                <i class="material-icons">delete</i>
              </button>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- Confirmation dialog -->
    <transition name="modal">
      <div v-if="confirmDialogVisible" class="confirm-dialog">
        <div class="dialog-backdrop" @click="confirmDialogVisible = false"></div>
        <div class="dialog-content">
          <div class="dialog-icon">
            <i class="material-icons">warning</i>
          </div>
          <h3>Удалить задачу?</h3>
          <p>Это действие нельзя отменить</p>
          <div class="dialog-actions">
            <button class="secondary-button" @click="confirmDialogVisible = false">Отмена</button>
            <button class="primary-button danger" @click="handleDeleteTask">Удалить</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import type { Task, Tag } from '@/stores/taskStore'

const taskStore = useTaskStore()

// Component state
const selectedDate = ref<Date | null>(null)
const searchQuery = ref('')
const filterStatus = ref<'all' | 'active' | 'completed' | 'overdue'>('all')
const sortField = ref<'title' | 'dueDate' | 'createdAt' | 'priority'>('dueDate')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Timer
const activeTaskId = ref<string | null>(null)
const timerInterval = ref<NodeJS.Timeout | null>(null)
const startTime = ref<number | null>(null)

// Task editor
const editorVisible = ref(false)
const editingTask = ref<Task | null>(null)
const form = ref<Partial<Task>>({
  id: '',
  title: '',
  dueDate: '',
  priority: 'medium',
  tags: [],
  completed: false,
  createdAt: '',
  description: '',
  estimatedHours: 0,
  estimatedMinutes: 0,
  timeSpent: 0,
})
const newTag = ref<Partial<Tag>>({ name: '', color: '#31a974' })

// Confirmation dialog
const confirmDialogVisible = ref(false)
const deleteTaskId = ref<string | null>(null)

// Methods
const startTimer = (taskId: string) => {
  stopTimer() // Stop any existing timer

  activeTaskId.value = taskId
  startTime.value = Date.now()

  timerInterval.value = setInterval(() => {
    if (startTime.value) {
      const task = taskStore.tasks.find((t) => t.id === taskId)
      if (task) {
        task.timeSpent = (task.timeSpent || 0) + 1
        taskStore.updateTask(task)
      }
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  activeTaskId.value = null
  startTime.value = null
}

const formatTimeSpent = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`
}

const formatEstimatedTime = (hours: number = 0, minutes: number = 0) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const getProgressWidth = (task: Task) => {
  if (!task.estimatedHours && !task.estimatedMinutes) return '0%'

  const totalEstimated = (task.estimatedHours || 0) * 3600 + (task.estimatedMinutes || 0) * 60
  const timeSpent = task.timeSpent || 0

  if (totalEstimated === 0) return '0%'

  const progress = Math.min((timeSpent / totalEstimated) * 100, 100)
  return `${progress}%`
}

const handleSave = () => {
  if (!form.value.title) return

  const taskData: Task = {
    id: form.value.id || Date.now().toString(),
    title: form.value.title,
    dueDate: form.value.dueDate || undefined,
    priority: form.value.priority || 'medium',
    tags: form.value.tags?.filter((tag) => tag.name) || [],
    completed: form.value.completed || false,
    createdAt: form.value.createdAt || new Date().toISOString(),
    description: form.value.description,
    estimatedHours: form.value.estimatedHours || 0,
    estimatedMinutes: form.value.estimatedMinutes || 0,
    timeSpent: form.value.timeSpent || 0,
    lastModified: new Date().toISOString(),
  }

  if (editingTask.value) {
    taskStore.updateTask(taskData)
  } else {
    taskStore.addTask(taskData)
  }
  closeEditor()
}

const openEditor = (task: Task | null) => {
  editorVisible.value = true
  editingTask.value = task
  if (task) {
    form.value = { ...task }
  } else {
    form.value = {
      id: '',
      title: '',
      dueDate: '',
      priority: 'medium',
      tags: [],
      completed: false,
      createdAt: '',
      description: '',
      estimatedHours: 0,
      estimatedMinutes: 0,
      timeSpent: 0,
    }
  }
}

const closeEditor = () => {
  editorVisible.value = false
  editingTask.value = null
  form.value = {
    id: '',
    title: '',
    dueDate: '',
    priority: 'medium',
    tags: [],
    completed: false,
    createdAt: '',
    description: '',
    estimatedHours: 0,
    estimatedMinutes: 0,
    timeSpent: 0,
  }
}

const clearDueDate = () => {
  form.value.dueDate = ''
}

const addTag = () => {
  if (newTag.value.name && !form.value.tags?.some((t) => t.name === newTag.value.name)) {
    form.value.tags = [
      ...(form.value.tags || []),
      { name: newTag.value.name, color: newTag.value.color || '#31a974' },
    ]
    newTag.value = { name: '', color: '#31a974' }
  }
}

const removeTag = (tag: Tag) => {
  form.value.tags = (form.value.tags || []).filter((t) => t.name !== tag.name)
}

const filteredTasks = computed(() => {
  let tasks = [...taskStore.tasks]
  if (selectedDate.value) {
    const dateStr = selectedDate.value.toISOString().split('T')[0]
    tasks = tasks.filter((task) => task.dueDate?.startsWith(dateStr))
  }
  if (filterStatus.value === 'active') {
    tasks = tasks.filter((task) => !task.completed && !taskStore.isTaskOverdue(task))
  } else if (filterStatus.value === 'completed') {
    tasks = tasks.filter((task) => task.completed)
  } else if (filterStatus.value === 'overdue') {
    tasks = tasks.filter((task) => taskStore.isTaskOverdue(task))
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        (task.tags && task.tags.some((tag) => tag.name.toLowerCase().includes(q)))
    )
  }
  tasks.sort((a, b) => {
    let aValue: any = a[sortField.value]
    let bValue: any = b[sortField.value]
    if (sortField.value === 'dueDate' || sortField.value === 'createdAt') {
      aValue = aValue ? new Date(aValue).getTime() : 0
      bValue = bValue ? new Date(bValue).getTime() : 0
    }
    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
  return tasks
})

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const backToCalendar = () => {
  selectedDate.value = null
}

const truncateDescription = (desc?: string) => {
  if (!desc) return ''
  return desc.length > 80 ? desc.slice(0, 80) + '...' : desc
}

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'Высокий'
    case 'medium':
      return 'Средний'
    case 'low':
      return 'Низкий'
    default:
      return 'Без приоритета'
  }
}

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}

const confirmDelete = (taskId: string) => {
  confirmDialogVisible.value = true
  deleteTaskId.value = taskId
}

const handleDeleteTask = () => {
  if (deleteTaskId.value) {
    taskStore.deleteTask(deleteTaskId.value)
    deleteTaskId.value = null
    confirmDialogVisible.value = false
  }
}

// Cleanup on unmount
onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.task-manager {
  padding: var(--space-lg);
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  color: var(--text-primary);
  background: var(--bg-primary);
}

/* Back button */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-xs) var(--space-sm);
  margin-bottom: var(--space-md);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast) var(--ease-out);
  font-size: var(--text-sm);
}

.back-button:hover {
  color: var(--primary);
  background: var(--bg-primary);
}

.back-button i {
  font-size: var(--text-lg);
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all var(--transition-normal) var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Editor modal */
.editor-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}

.editor-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: var(--blur);
}

.editor-container {
  position: relative;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  z-index: 1001;
  border: 1px solid var(--border);
  animation: fadeIn var(--transition-slow) var(--ease-out);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border);
}

.editor-header h2 {
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin: 0;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: 50%;
  transition: all var(--transition-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.editor-form {
  padding: var(--space-lg);
}

.form-group {
  margin-bottom: var(--space-md);
}

.form-row {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: var(--space-xs);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
}

.input-field,
.select-field,
.textarea-field {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--transition-fast) var(--ease-out);
}

.input-field:focus,
.select-field:focus,
.textarea-field:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-rgb);
}

.input-field::placeholder {
  color: var(--text-tertiary);
}

.select-field {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-md) center;
  background-size: 16px;
  padding-right: var(--space-xl);
  cursor: pointer;
}

.textarea-field {
  min-height: 100px;
  resize: vertical;
  line-height: 1.5;
}

.date-picker {
  position: relative;
  display: flex;
  align-items: center;
}

.date-picker .calendar-icon {
  position: absolute;
  left: var(--space-md);
  color: var(--text-tertiary);
  pointer-events: none;
}

.date-picker .input-field[type='date'] {
  padding-left: var(--space-xl);
}

.date-picker .clear-button {
  position: absolute;
  right: var(--space-sm);
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out);
}

.date-picker .clear-button:hover {
  color: var(--text-secondary);
  background: var(--bg-primary);
}

.date-picker .clear-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tags-input-container {
  margin-top: var(--space-xs);
}

.tags-input {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.tags-input .input-field {
  flex: 1;
}

.color-picker-wrapper {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-picker {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform var(--transition-fast) var(--ease-out);
}

.color-preview:hover {
  transform: scale(1.1);
}

.add-tag-button {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.add-tag-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--text-tertiary);
}

.add-tag-button:not(:disabled):hover {
  background: var(--primary-dark);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: white;
  font-weight: 500;
  transition: all var(--transition-fast) var(--ease-out);
}

.tag-remove {
  background: none;
  border: none;
  color: inherit;
  margin-left: var(--space-xs);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.tag-remove:hover {
  opacity: 1;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border);
}

/* Buttons */
.primary-button {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  transition: all var(--transition-fast) var(--ease-out);
}

.primary-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.primary-button:active {
  transform: translateY(0);
}

.secondary-button {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.secondary-button:hover {
  background: var(--bg-tertiary);
  border-color: var(--text-tertiary);
}

.danger {
  background: var(--error);
}

.danger:hover {
  background: var(--danger-dark);
}

/* Main interface */
.main-interface {
  margin-top: var(--space-md);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.search-filter-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

@media (min-width: 768px) {
  .search-filter-container {
    flex-direction: row;
    align-items: center;
  }
}

.search-container {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md) var(--space-sm) var(--space-xl);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--transition-fast) var(--ease-out);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-rgb);
}

.clear-search {
  position: absolute;
  right: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out);
}

.clear-search:hover {
  color: var(--text-secondary);
  background: var(--bg-primary);
}

.filter-select,
.sort-select {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.filter-select:focus,
.sort-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-rgb);
}

@media (min-width: 768px) {
  .filter-select {
    width: 200px;
  }
}

.actions-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

@media (min-width: 768px) {
  .actions-container {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.new-task-button {
  width: 100%;
  justify-content: center;
}

@media (min-width: 768px) {
  .new-task-button {
    width: auto;
  }
}

.sort-container {
  display: flex;
  gap: var(--space-sm);
}

@media (min-width: 768px) {
  .sort-container {
    margin-left: auto;
  }
}

.sort-direction {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  i {
    color: var(--primary);
  }
}

.sort-direction:hover {
  background: var(--bg-tertiary);
}

/* Statistics */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--stats-card-min), 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.stat-card {
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  border: 1px solid var(--border);
  transition: all var(--transition-fast) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.stat-icon {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: var(--icon-size);
  height: var(--icon-size);
  background: var(--primary-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

/* Task list */
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) 0;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: var(--bg-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-md);
  color: var(--primary);
}

.empty-icon i {
  font-size: 40px;
}

.empty-state h3 {
  font-size: var(--text-xl);
  margin-bottom: var(--space-xs);
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}

/* Task cards */
.task-card {
  display: flex;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  transition: all var(--transition-fast) var(--ease-out);
  overflow: hidden;
  position: relative;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.task-card.completed {
  opacity: 0.7;
}

.task-card.overdue {
  border-left: 4px solid var(--error);
}

.task-card.high {
  border-left: 4px solid var(--error);
}

.task-card.medium {
  border-left: 4px solid var(--warning);
}

.task-card.low {
  border-left: 4px solid var(--primary);
}

.task-checkbox {
  padding: var(--space-md);
  display: flex;
  align-items: flex-start;
  cursor: pointer;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out);
}

.checkbox.checked {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.task-content {
  flex: 1;
  padding: var(--space-md) 0;
  cursor: pointer;
}

.task-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

@media (min-width: 480px) {
  .task-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.task-title {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: center;
}

.task-priority {
  margin-right: var(--space-sm);
}

.task-priority span {
  font-size: var(--text-xs);
  padding: 2px var(--space-sm);
  border-radius: var(--radius-sm);
  display: inline-block;
  font-weight: 500;
}

.task-priority .high {
  background: var(--danger-light);
  color: var(--danger);
}

.task-priority .medium {
  background: var(--warning-light);
  color: var(--warning-dark);
}

.task-priority .low {
  background: var(--primary-bg);
  color: var(--primary);
}

.task-date {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.overdue-badge {
  font-size: var(--text-xs);
  color: var(--danger);
  font-weight: 500;
  margin-left: var(--space-xs);
}

.task-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
  line-height: 1.5;
}

.task-time-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.time-progress {
  flex: 1;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: var(--space-xs);
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.time-values {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.time-spent {
  color: var(--text-primary);
  font-weight: 500;
}

.time-estimated {
  opacity: 0.8;
}

.timer-button {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--text-xs);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.timer-button:hover {
  background: var(--primary-bg);
  color: var(--primary);
}

.timer-button.active {
  background: var(--primary);
  color: white;
}

.timer-button i {
  font-size: var(--text-sm);
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.task-actions {
  padding: var(--space-md);
  display: flex;
  gap: var(--space-sm);
  align-items: flex-start;
}

@media (min-width: 480px) {
  .task-actions {
    align-items: center;
  }
}

.action-button {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast) var(--ease-out);
}

.action-button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-button.danger:hover {
  background: var(--danger-light);
  color: var(--danger);
}

/* Confirmation dialog */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}

.dialog-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: var(--blur);
}

.dialog-content {
  position: relative;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  width: 100%;
  max-width: 400px;
  text-align: center;
  z-index: 1001;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
}

.dialog-icon {
  width: 60px;
  height: 60px;
  background: var(--danger-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-md);
  color: var(--danger);
}

.dialog-icon i {
  font-size: 30px;
}

.dialog-content h3 {
  font-size: var(--text-lg);
  margin-bottom: var(--space-xs);
  color: var(--text-primary);
}

.dialog-content p {
  color: var(--text-secondary);
  margin-bottom: var(--space-lg);
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}

/* Task list animations */
.task-list-move {
  transition: transform var(--transition-normal) var(--ease-out);
}

.task-list-enter-active,
.task-list-leave-active {
  transition: all var(--transition-normal) var(--ease-out);
}

.task-list-enter-from,
.task-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.task-list-leave-active {
  position: absolute;
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .task-manager {
    padding: var(--space-md);
  }

  .editor-form {
    padding: var(--space-md);
  }

  .form-row {
    flex-direction: column;
    gap: var(--space-md);
  }

  .dialog-content {
    margin: var(--space-md);
  }
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .task-actions {
    justify-content: flex-end;
    padding-top: 0;
    padding-bottom: var(--space-md);
  }

  .task-time-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .timer-button {
    align-self: flex-end;
  }
}
</style>
