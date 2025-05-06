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

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/types'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

const selectedDate = ref<Date | null>(null)
const searchQuery = ref('')
const filterStatus = ref<'all' | 'active' | 'completed' | 'overdue'>('all')
const sortField = ref<'title' | 'dueDate' | 'createdAt' | 'priority'>('dueDate')
const sortDirection = ref<'asc' | 'desc'>('asc')

const editorVisible = ref(false)
const form = ref<Task>({
  id: '',
  title: '',
  dueDate: '',
  priority: 'medium',
  tags: [],
  completed: false,
  createdAt: '',
})

const editingTask = ref<Task | null>(null)
const newTag = ref('')
const confirmDialogVisible = ref(false)
const deleteTaskId = ref<string | null>(null)

onMounted(() => {
  const dateParam = route.query.date as string
  if (dateParam) {
    selectedDate.value = new Date(dateParam)
  }

  const taskId = route.query.edit as string
  if (taskId) {
    const taskToEdit = taskStore.getTaskById(taskId)
    if (taskToEdit) openEditor(taskToEdit)
  }
})

watch(route, () => {
  const dateParam = route.query.date as string
  selectedDate.value = dateParam ? new Date(dateParam) : null
})

const openEditor = (task: Task | null = null) => {
  if (task) {
    editingTask.value = task
    form.value = { ...task }
  } else {
    editingTask.value = null
    form.value = {
      id: '',
      title: '',
      dueDate: selectedDate.value ? selectedDate.value.toISOString() : '',
      priority: 'medium',
      tags: [],
      completed: false,
      createdAt: '',
    }
  }
  editorVisible.value = true
  router.push({ query: { ...route.query, edit: task?.id || 'new' } })
}

const closeEditor = () => {
  editorVisible.value = false
  editingTask.value = null
  router.push({ path: route.path, query: { ...route.query, edit: undefined } })
}

const handleSave = () => {
  const taskData: Task = {
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

  if (editingTask.value) {
    taskStore.updateTask(taskData)
  } else {
    taskStore.addTask(taskData)
  }

  closeEditor()
}

const confirmDelete = (taskId: string) => {
  deleteTaskId.value = taskId
  confirmDialogVisible.value = true
}

const handleDeleteTask = () => {
  if (deleteTaskId.value) {
    taskStore.deleteTask(deleteTaskId.value)
  }
  confirmDialogVisible.value = false
  deleteTaskId.value = null
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  newTag.value = ''
}

const removeTag = (tag: string) => {
  form.value.tags = form.value.tags.filter((t) => t !== tag)
}

const clearDueDate = () => {
  form.value.dueDate = ''
}

const backToCalendar = () => {
  router.push({ path: '/', query: {} })
}

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'Низкий'
    case 'medium':
      return 'Средний'
    case 'high':
      return 'Высокий'
    default:
      return ''
  }
}

const formatDate = (dateStr: string | null, includeTime = false) => {
  if (!dateStr) return ''
  const options = includeTime
    ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'long' }

  return new Date(dateStr).toLocaleDateString('ru-RU', options)
}

const filteredTasks = computed(() => {
  let tasks = [...taskStore.tasks]

  if (selectedDate.value) {
    const dateStr = selectedDate.value.toISOString().split('T')[0]
    tasks = tasks.filter((task) => task.dueDate?.startsWith(dateStr))
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter((task) => task.title.toLowerCase().includes(query))
  }

  if (filterStatus.value === 'active') {
    tasks = tasks.filter((task) => !task.completed)
  } else if (filterStatus.value === 'completed') {
    tasks = tasks.filter((task) => task.completed)
  } else if (filterStatus.value === 'overdue') {
    tasks = tasks.filter((task) => taskStore.isTaskOverdue(task))
  }

  tasks.sort((a, b) => {
    const aVal = a[sortField.value]
    const bVal = b[sortField.value]

    if (!aVal) return 1
    if (!bVal) return -1

    if (sortField.value === 'title' || sortField.value === 'priority') {
      return sortDirection.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return sortDirection.value === 'asc'
      ? new Date(aVal).getTime() - new Date(bVal).getTime()
      : new Date(bVal).getTime() - new Date(aVal).getTime()
  })

  return tasks
})

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}
</script>

<style scoped>
/* Основные стили */
.task-manager {
  width: 100%;
  margin: 0 auto;
  color: var(--text-primary);
  border: var(--border);
}

/* Кнопка назад */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: var(--space-sm) var(--space-sm);
  margin: 0 0 var(--space-md) -0.5rem;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  font-size: var(--text-base);
  border-radius: var(--radius-lg);
}

.back-button:hover {
  background: var(--bg-tertiary);
  color: var(--primary);
}

.back-button i {
  font-size: 1.25rem;
  transition: transform 0.2s var(--ease-out);
}

.back-button:hover i {
  transform: translateX(-2px);
}

/* Основной интерфейс */
.main-interface {
  padding: 40px;
  box-shadow: var(--space-lg);
}

/* Элементы управления */
.controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

@media (min-width: 600px) {
  .search-container {
    flex-direction: row;
    align-items: center;
  }
}

.search-input-container {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: 1.25rem;
  transition: color var(--transition-fast) var(--ease-out);
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 0.75rem var(--space-md) 0.75rem 3rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--transition-normal) var(--ease-out);
  height: 44px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-input:hover {
  border-color: var(--text-tertiary);
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow:
    0 0 0 3px rgba(var(--primary-rgb), 0.15),
    inset 0 1px 2px rgba(0, 0, 0, 0.05);
  outline: none;
}

.search-input:focus ~ .search-icon {
  color: var(--primary);
}

.clear-search {
  position: absolute;
  right: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: 50%;
  transition: all var(--transition-fast) var(--ease-out);
  z-index: 2;
}

.clear-search:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.filter-select {
  width: 100%;
  padding: 0.75rem var(--space-md);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-base);
  height: 44px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
}

.filter-select:hover {
  border-color: var(--text-tertiary);
}

.filter-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
  outline: none;
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%2331a974' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

@media (min-width: 600px) {
  .filter-select {
    width: auto;
    min-width: 180px;
  }
}

.actions-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

@media (min-width: 600px) {
  .actions-container {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

/* Кнопки */
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  background: var(--primary);
  border: none;
  color: white;
  padding: 0.75rem var(--space-md);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 500;
  font-size: var(--text-base);
  transition: all var(--transition-fast) var(--ease-out);
  height: 44px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.primary-button:hover {
  background: #2a9765;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.primary-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.primary-button.danger {
  background: var(--error);
}

.primary-button.danger:hover {
  background: #d32f2f;
}

.primary-button i {
  font-size: 1.25rem;
}

.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 0.75rem var(--space-md);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--text-base);
  transition: all var(--transition-fast) var(--ease-out);
  height: 44px;
}

.secondary-button:hover {
  background: var(--bg-secondary);
  border-color: var(--text-tertiary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.secondary-button:active {
  background: var(--bg-tertiary);
}

.new-task-button {
  width: 100%;
}

@media (min-width: 600px) {
  .new-task-button {
    width: auto;
  }
}

/* Сортировка */
.sort-container {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.sort-select {
  padding: 0.75rem var(--space-md);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-base);
  height: 44px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
  width: 100%;
}

@media (min-width: 400px) {
  .sort-select {
    width: auto;
    min-width: 140px;
  }
}

.sort-select:hover {
  border-color: var(--text-tertiary);
}

.sort-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
  outline: none;
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%2331a974' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.sort-direction {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out);
  height: 44px;
  width: 44px;
}

.sort-direction:hover {
  background: var(--bg-tertiary);
  border-color: var(--text-tertiary);
}

.sort-direction i {
  font-size: 1.25rem;
  transition: transform 0.2s var(--ease-out);
}

.sort-direction:hover i {
  transform: scale(1.1);
}

/* Статистика */
.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

@media (min-width: 600px) {
  .stats-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: transform var(--transition-fast) var(--ease-out);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  margin-bottom: var(--space-xs);
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.stat-icon {
  position: absolute;
  right: var(--space-md);
  top: var(--space-md);
  color: var(--primary);
  font-size: var(--text-base);
}

/* Список задач */
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
  padding: var(--space-xl) var(--space-md);
  text-align: center;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px dashed var(--border);
}

.empty-icon {
  font-size: var(--text-2xl);
  color: var(--text-tertiary);
  margin-bottom: var(--space-md);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 50%;
}

.empty-icon i {
  font-size: 2.5rem;
}

.empty-state h3 {
  margin-bottom: var(--space-xs);
  font-size: var(--text-xl);
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
  max-width: 400px;
  line-height: 1.5;
}

/* Карточка задачи */
.task-card {
  display: flex;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal) var(--ease-out);
  border-left: 4px solid transparent;
  border: 1px solid var(--border);
  position: relative;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--text-tertiary);
}

.task-card.completed {
  opacity: 0.7;
  background: var(--bg-tertiary);
}

.task-card.completed .task-title {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.task-card.overdue:not(.completed) {
  border-left-color: var(--error);
}

.task-card.high:not(.completed) {
  border-left-color: var(--error);
}

.task-card.medium:not(.completed) {
  border-left-color: var(--warning);
}

.task-card.low:not(.completed) {
  border-left-color: var(--secondary);
}

.task-checkbox {
  margin-right: var(--space-md);
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  flex-shrink: 0;
}

.checkbox:hover {
  border-color: var(--primary);
}

.checkbox.checked {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.checkbox i {
  font-size: 1rem;
  opacity: 0;
  transition: opacity var(--transition-fast) var(--ease-out);
  transform: translateY(1px);
}

.checkbox.checked i {
  opacity: 1;
}

.task-content {
  flex-grow: 1;
  cursor: pointer;
  min-width: 0;
}

.task-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-xs);
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.task-title {
  font-size: var(--text-base);
  margin: 0;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
  font-weight: 500;
}

.task-priority span {
  font-size: var(--text-xs);
  padding: 0.25rem var(--space-sm);
  border-radius: 10px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-priority .high {
  background-color: rgba(var(--error), 0.1);
  color: var(--error);
}

.task-priority .medium {
  background-color: rgba(var(--warning), 0.1);
  color: var(--warning);
}

.task-priority .low {
  background-color: rgba(var(--secondary), 0.1);
  color: var(--secondary);
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.task-date,
.task-created {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.task-date i,
.task-created i {
  font-size: 1.1rem;
  opacity: 0.8;
}

.overdue-badge {
  color: var(--error);
  font-size: var(--text-xs);
  font-weight: bold;
  margin-left: var(--space-xs);
  background: rgba(var(--error), 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}

.tag {
  background: var(--primary);
  color: var(--text-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 10px;
  font-size: var(--text-base);
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  transition: all var(--transition-fast) var(--ease-out);
  border: 1px solid transparent;
  height: 24px;
}

.tag:hover {
  background: var(--bg-secondary);
  border-color: var(--border);
  color: var(--text-primary);
}

.tag .tag-remove {
  opacity: 0;
  color: var(--text-tertiary);
  transition: all var(--transition-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.tag .tag-remove:hover {
  background: var(--bg-tertiary);
  color: var(--error);
}

.tag:hover .tag-remove {
  opacity: 1;
}

.task-actions {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  margin-left: var(--space-md);
}

.action-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.action-button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transform: scale(1.1);
}

.action-button:active {
  transform: scale(0.95);
}

.action-button.danger:hover {
  color: var(--error);
}

.action-button i {
  font-size: 1.25rem;
}

/* Редактор задач */
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
  padding: var(--space-md);
  animation: modal-fade-in 0.3s var(--ease-out) forwards;
  opacity: 0;
}

@keyframes modal-fade-in {
  to {
    opacity: 1;
    backdrop-filter: blur(4px);
  }
}

.editor-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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
  z-index: 1;
  border: 1px solid var(--border);
  animation: modal-slide-up 0.3s var(--ease-bounce) forwards;
  transform: translateY(20px);
  opacity: 0;
}

@keyframes modal-slide-up {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg-primary);
  z-index: 2;
}

.editor-header h2 {
  margin: 0;
  font-size: var(--text-xl);
  color: var(--text-primary);
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
  width: 36px;
  height: 36px;
}

.close-button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transform: rotate(90deg);
}

.close-button i {
  font-size: 1.25rem;
}

.editor-form {
  padding: var(--space-md);
}

.form-group {
  margin-bottom: var(--space-md);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

@media (min-width: 500px) {
  .form-row {
    flex-direction: row;
  }

  .form-row .form-group {
    flex: 1;
    margin-bottom: 0;
  }
}

label {
  display: block;
  margin-bottom: var(--space-xs);
  font-size: var(--text-base);
  color: var(--text-secondary);
  font-weight: 500;
}

.input-field {
  width: 100%;
  padding: 0.75rem var(--space-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--transition-normal) var(--ease-out);
  height: 44px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.input-field:hover {
  border-color: var(--text-tertiary);
}

.input-field:focus {
  border-color: var(--primary);
  box-shadow:
    0 0 0 3px rgba(var(--primary-rgb), 0.15),
    inset 0 1px 2px rgba(0, 0, 0, 0.05);
  outline: none;
}

.input-field::placeholder {
  color: var(--text-tertiary);
  opacity: 1;
}

.date-picker {
  position: relative;
  display: flex;
  align-items: center;
}

.date-picker input[type='date']::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.date-picker::after {
  content: '';
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z' stroke='%23999999' stroke-width='1.5' stroke-miterlimit='10' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M15.6947 13.7002H15.7037M15.6947 16.7002H15.7037M11.9955 13.7002H12.0045M11.9955 16.7002H12.0045M8.29431 13.7002H8.30329M8.29431 16.7002H8.30329' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  pointer-events: none;
  transition: all var(--transition-fast) var(--ease-out);
}

.date-picker:focus-within::after {
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z' stroke='%2331a974' stroke-width='1.5' stroke-miterlimit='10' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M15.6947 13.7002H15.7037M15.6947 16.7002H15.7037M11.9955 13.7002H12.0045M11.9955 16.7002H12.0045M8.29431 13.7002H8.30329M8.29431 16.7002H8.30329' stroke='%2331a974' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.clear-button {
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: 50%;
  transition: all var(--transition-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.clear-button:not(:disabled):hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.clear-button i {
  font-size: 1rem;
}

.select-field {
  width: 100%;
  padding: 0.75rem var(--space-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-base);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  height: 44px;
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
}

.select-field:hover {
  border-color: var(--text-tertiary);
}

.select-field:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
  outline: none;
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%2331a974' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

/* Теги в редакторе */
.tags-input-container {
  margin-top: var(--space-xs);
}

.tags-input {
  display: flex;
  margin-bottom: var(--space-xs);
}

.tags-input input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
  flex-grow: 1;
}

.add-tag-button {
  background: var(--bg-primar);
  border: solid 1px var(--border);
  border-left: none;
  border-top-right-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0 var(--space-md);
  transition: all var(--transition-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-tag-button:not(:disabled):hover {
  background: var(--bg-secondary);
  color: var(--primary);
}

.add-tag-button i {
  font-size: 1.25rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border);
  position: sticky;
  bottom: 0;
  background: var(--bg-primary);
  z-index: 2;
}

/* Диалог подтверждения */
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
  padding: var(--space-md);
  animation: modal-fade-in 0.3s var(--ease-out) forwards;
}

.dialog-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.dialog-content {
  position: relative;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 400px;
  padding: var(--space-md);
  box-shadow: var(--shadow-lg);
  z-index: 1;
  text-align: center;
  border: 1px solid var(--border);
  animation: modal-slide-up 0.3s var(--ease-bounce) forwards;
}

.dialog-icon {
  color: var(--error);
  font-size: var(--text-2xl);
  margin-bottom: var(--space-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(var(--error), 0.1);
  border-radius: 50%;
}

.dialog-icon i {
  font-size: 2rem;
}

.dialog-content h3 {
  margin-bottom: var(--space-sm);
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.dialog-content p {
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
}

/* Анимации списка задач */
.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.3s var(--ease-out);
}

.task-list-enter-from,
.task-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.task-list-move {
  transition: transform 0.3s var(--ease-bounce);
}

/* Адаптивность для очень маленьких экранов */
@media (max-width: 400px) {
  .task-manager {
    padding: var(--space-sm);
  }

  .main-interface {
    padding: 20px;
    border-radius: var(--radius-lg);
  }

  .editor-container,
  .dialog-content {
    max-height: 85vh;
  }

  .editor-form,
  .dialog-content {
    padding: var(--space-sm);
  }

  .input-field,
  .select-field,
  .primary-button,
  .secondary-button {
    height: 40px;
    font-size: var(--text-base);
  }

  .task-card {
    padding: var(--space-sm);
  }

  .task-actions {
    margin-left: var(--space-sm);
  }

  .action-button {
    width: 28px;
    height: 28px;
    padding: 0.25rem;
  }

  .action-button i {
    font-size: 1.1rem;
  }

  .checkbox {
    width: 18px;
    height: 18px;
  }

  .checkbox i {
    font-size: 0.9rem;
  }

  .tag {
    height: 22px;
    padding: 0.15rem 0.5rem;
    font-size: var(--text-base);
  }

  .empty-state {
    padding: var(--space-lg) var(--space-sm);
  }

  .empty-icon {
    width: 48px;
    height: 48px;
  }

  .empty-icon i {
    font-size: 2rem;
  }

  .empty-state h3 {
    font-size: var(--text-lg);
  }

  .empty-state p {
    font-size: var(--text-base);
  }
}

/* Эффект ripple для кнопок */
.ripple {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple 0.6s var(--ease-out);
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
