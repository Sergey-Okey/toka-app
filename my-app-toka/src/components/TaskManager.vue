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
                  <input v-model="form.dueDate" type="date" class="input-field" />
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

            <div class="form-row">
              <div class="form-group">
                <label>Категория</label>
                <div class="category-select">
                  <select v-model="form.category" class="select-field">
                    <option value="">Без категории</option>
                    <option
                      v-for="category in taskStore.taskCategories"
                      :key="category"
                      :value="category"
                    >
                      {{ category }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Время выполнения</label>
                <input
                  v-model="form.timeSpent"
                  type="number"
                  min="0"
                  step="5"
                  placeholder="Минут"
                  class="input-field"
                />
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
                  <div class="tag-actions">
                    <button
                      type="button"
                      class="add-tag-button"
                      @click="addTag"
                      :disabled="!newTag"
                    >
                      <i class="material-icons">add</i>
                    </button>
                    <ColorPicker v-model="newTagColor" class="color-picker" />
                  </div>
                </div>
                <div class="tags-list">
                  <span
                    v-for="tag in form.tags"
                    :key="tag.name"
                    class="tag"
                    :style="{
                      backgroundColor: tagColors[tag.name] || 'var(--primary)',
                      color: getContrastColor(tagColors[tag.name] || 'var(--primary)'),
                    }"
                  >
                    {{ tag.name }}
                    <button @click="removeTag(tag.name)" class="tag-remove">
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
                placeholder="Добавьте описание задачи"
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

    <!-- Основной интерфейс -->
    <div class="main-interface">
      <div class="controls">
        <div class="search-container">
          <div class="search-input-container" :class="{ expanded: searchFocused || searchQuery }">
            <i class="material-icons search-icon">search</i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск задач..."
              class="search-input"
              @focus="searchFocused = true"
              @blur="searchFocused = false"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
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
            Новая задача
          </button>

          <div class="sort-container">
            <select v-model="sortField" class="sort-select">
              <option value="dueDate">По дате</option>
              <option value="title">По названию</option>
              <option value="priority">По приоритету</option>
              <option value="createdAt">По дате создания</option>
              <option value="timeSpent">По времени выполнения</option>
            </select>
            <button class="sort-direction" @click="toggleSortDirection">
              <i class="material-icons">
                {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
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

      <!-- Фильтры тегов -->
      <div v-if="selectedTags.length > 0" class="selected-tags">
        <span
          v-for="tag in selectedTags"
          :key="tag"
          class="tag"
          :style="{
            backgroundColor: tagColors[tag] || 'var(--primary)',
            color: getContrastColor(tagColors[tag] || 'var(--primary)'),
          }"
        >
          {{ tag }}
          <button @click="removeSelectedTag(tag)" class="tag-remove">
            <i class="material-icons">close</i>
          </button>
        </span>
        <button class="clear-tags-button" @click="selectedTags = []">Очистить</button>
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
            <div class="task-checkbox" @click="taskStore.toggleTaskCompletion(task.id)">
              <div class="checkbox" :class="{ checked: task.completed }">
                <i class="material-icons" v-if="task.completed">check</i>
              </div>
            </div>

            <div class="task-content" @click="openEditor(task)">
              <div class="task-header">
                <h3 class="task-title">{{ task.title }}</h3>
                <div class="task-meta-icons">
                  <div class="task-priority" v-if="task.priority !== 'none'">
                    <span :class="task.priority">{{ getPriorityLabel(task.priority) }}</span>
                  </div>
                  <div v-if="task.category" class="task-category">
                    <i class="material-icons">label</i>
                    <span>{{ task.category }}</span>
                  </div>
                  <div v-if="task.timeSpent" class="task-time">
                    <i class="material-icons">timer</i>
                    <span>{{ task.timeSpent }} мин</span>
                  </div>
                </div>
              </div>

              <div v-if="task.description" class="task-description">
                {{ truncateDescription(task.description) }}
              </div>

              <div class="task-meta">
                <div v-if="task.dueDate" class="task-date">
                  <i class="material-icons">event</i>
                  <span>{{ formatDate(task.dueDate) }}</span>
                  <span v-if="taskStore.isTaskOverdue(task)" class="overdue-badge">
                    Просрочено
                  </span>
                </div>

                <div class="task-created">
                  <i class="material-icons">schedule</i>
                  <span>{{ formatDate(task.createdAt, true) }}</span>
                </div>
              </div>

              <div v-if="task.tags.length > 0" class="task-tags">
                <span
                  v-for="tag in task.tags"
                  :key="tag.name"
                  class="tag"
                  :style="{
                    backgroundColor: tagColors[tag.name] || 'var(--primary)',
                    color: getContrastColor(tagColors[tag.name] || 'var(--primary)'),
                  }"
                  @click.stop="addSelectedTag(tag.name)"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>

            <div class="task-actions">
              <button class="action-button" @click.stop="openEditor(task)">
                <i class="material-icons">edit</i>
              </button>
              <button class="action-button danger" @click.stop="confirmDelete(task.id)">
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
        <div class="dialog-backdrop" @click="confirmDialogVisible = false"></div>
        <div class="dialog-content">
          <div class="dialog-icon">
            <i class="material-icons">warning</i>
          </div>
          <h3>Удалить задачу?</h3>
          <p>Вы уверены, что хотите удалить эту задачу? Это действие нельзя отменить.</p>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import type { Task, Tag } from '@/types'
import ColorPicker from '@/components/ui/ColorPicker.vue'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

const selectedDate = ref<Date | null>(null)
const searchQuery = ref('')
const searchFocused = ref(false)
const filterStatus = ref<'all' | 'active' | 'completed' | 'overdue'>('all')
const sortField = ref<'title' | 'dueDate' | 'createdAt' | 'priority' | 'timeSpent'>('dueDate')
const sortDirection = ref<'asc' | 'desc'>('asc')
const selectedTags = ref<string[]>([])

const editorVisible = ref(false)
const form = ref<Task>({
  id: '',
  title: '',
  dueDate: '',
  priority: 'medium',
  tags: [],
  completed: false,
  createdAt: '',
  description: '',
  timeSpent: 0,
  category: '',
})

const editingTask = ref<Task | null>(null)
const newTag = ref('')
const newTagColor = ref('')
const confirmDialogVisible = ref(false)
const deleteTaskId = ref<string | null>(null)

// Загружаем цвета тегов из localStorage
const tagColors = ref<Record<string, string>>(JSON.parse(localStorage.getItem('tagColors') || '{}'))

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

// Сохраняем цвета тегов при изменении
watch(
  tagColors,
  (newColors) => {
    localStorage.setItem('tagColors', JSON.stringify(newColors))
  },
  { deep: true }
)

const openEditor = (task: Task | null = null) => {
  if (task) {
    editingTask.value = task
    form.value = {
      ...task,
      tags: task.tags || [],
    }
  } else {
    editingTask.value = null
    form.value = {
      id: '',
      title: '',
      dueDate: selectedDate.value ? selectedDate.value.toISOString().split('T')[0] : '',
      priority: 'medium',
      tags: [],
      completed: false,
      createdAt: '',
      description: '',
      timeSpent: 0,
      category: '',
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
    dueDate: form.value.dueDate ? new Date(form.value.dueDate).toISOString() : null,
    priority: form.value.priority,
    tags: form.value.tags.map((tag) => ({
      name: tag.name,
      color: tagColors.value[tag.name] || 'var(--primary)',
    })),
    completed: form.value.completed,
    createdAt: form.value.createdAt || new Date().toISOString(),
    description: form.value.description,
    timeSpent: form.value.timeSpent || 0,
    category: form.value.category,
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
  const tagName = newTag.value.trim()
  if (tagName && !form.value.tags.some((t) => t.name === tagName)) {
    form.value.tags.push({
      name: tagName,
      color: 'var(--primary)',
    })
  }
  newTag.value = ''
}

const removeTag = (tagName: string) => {
  form.value.tags = form.value.tags.filter((t) => t.name !== tagName)
}

const addSelectedTag = (tagName: string) => {
  if (!selectedTags.value.includes(tagName)) {
    selectedTags.value.push(tagName)
  }
}

const removeSelectedTag = (tagName: string) => {
  selectedTags.value = selectedTags.value.filter((t) => t !== tagName)
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

const truncateDescription = (text: string, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const getContrastColor = (hexColor: string) => {
  // Конвертируем hex в RGB
  const r = parseInt(hexColor.substr(1, 2), 16)
  const g = parseInt(hexColor.substr(3, 2), 16)
  const b = parseInt(hexColor.substr(5, 2), 16)

  // Рассчитываем яркость по формуле
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  // Возвращаем черный или белый в зависимости от яркости фона
  return brightness > 128 ? '#000000' : '#FFFFFF'
}

const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const filteredTasks = computed(() => {
  let tasks = [...taskStore.tasks]

  if (selectedDate.value) {
    const dateStr = selectedDate.value.toISOString().split('T')[0]
    tasks = tasks.filter((task) => task.dueDate?.startsWith(dateStr))
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.category && task.category.toLowerCase().includes(query)) ||
        (task.tags && task.tags.some((tag) => tag.name.toLowerCase().includes(query)))
    )
  }

  if (selectedTags.value.length > 0) {
    tasks = tasks.filter(
      (task) => task.tags && task.tags.some((tag) => selectedTags.value.includes(tag.name))
    )
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

    if (
      sortField.value === 'title' ||
      sortField.value === 'priority' ||
      sortField.value === 'category'
    ) {
      return sortDirection.value === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    }

    if (sortField.value === 'timeSpent') {
      return sortDirection.value === 'asc'
        ? (a.timeSpent || 0) - (b.timeSpent || 0)
        : (b.timeSpent || 0) - (a.timeSpent || 0)
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

<style lang="scss" scoped>
.search-input-container {
  position: relative;
  flex-grow: 1;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  transition: all 0.3s var(--ease-out);
  overflow: hidden;
  background: var(--bg-primary);
  border: 1px solid var(--border);
}

.search-input-container.expanded {
  width: 100%;
  border-radius: var(--radius-lg);
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
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem var(--space-md) 0.75rem 3rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--transition-normal) var(--ease-out);
  height: 42px;
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
}

.search-input-container.expanded .search-input {
  opacity: 1;
  position: static;
}

.search-input:hover {
  border-color: var(--text-tertiary);
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
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

/* Обновленные стили для тегов */
.tag-actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.color-picker {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.selected-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
  padding: var(--space-sm) 0;
}

.clear-tags-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--text-sm);
  padding: 0 var(--space-xs);
  transition: all var(--transition-fast) var(--ease-out);
}

.clear-tags-button:hover {
  color: var(--primary);
}

/* Новые стили для описания задачи */
.task-description {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin: var(--space-xs) 0 var(--space-sm);
  line-height: 1.5;
  white-space: pre-line;
}

/* Стили для мета-информации */
.task-meta-icons {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.task-category,
.task-time {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.task-category i,
.task-time i {
  font-size: 1rem;
  opacity: 0.7;
}

/* Стили для текстового поля */
.textarea-field {
  width: 100%;
  padding: var(--space-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--transition-normal) var(--ease-out);
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.textarea-field:hover {
  border-color: var(--text-tertiary);
}

.textarea-field:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
  outline: none;
}

/* Анимация для поиска */
@keyframes search-expand {
  from {
    width: 44px;
    border-radius: 22px;
  }
  to {
    width: 100%;
    border-radius: var(--radius-lg);
  }
}

@keyframes search-collapse {
  from {
    width: 100%;
    border-radius: var(--radius-lg);
  }
  to {
    width: 44px;
    border-radius: 22px;
  }
}
</style>
