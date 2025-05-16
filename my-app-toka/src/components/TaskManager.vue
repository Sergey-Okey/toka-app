<template>
  <div class="task-manager">
    <!-- Шапка -->
    <div class="task-header">
      <h1 class="task-title">Менеджер задач</h1>
      <button class="create-button" @click="openCreateModal">
        <i class="material-icons-outlined">add</i>
        <span>Новая задача</span>
      </button>
    </div>

    <!-- Аналитика -->
    <div class="analytics-section">
      <h2 class="section-title">Аналитика выполнения</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>По приоритету</h3>
          <div class="priority-stats">
            <div v-for="i in 5" :key="i" class="priority-stat">
              <div class="priority-label">Приоритет {{ i }}</div>
              <div class="priority-bar-container">
                <div
                  class="priority-bar"
                  :style="{
                    width: `${priorityCompletionRate(i)}%`,
                    backgroundColor: getPriorityColor(i),
                  }"
                ></div>
              </div>
              <div class="priority-time">
                Среднее:
                {{ formatTime(taskStore.getPriorityStats[i]?.avgTime || 0) }}
              </div>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <h3>По тегам</h3>
          <div class="tag-stats">
            <div
              v-for="tag in Object.values(taskStore.getTagStats)"
              :key="tag.name"
              class="tag-stat"
            >
              <div class="tag-info">
                <span
                  class="tag-color"
                  :style="{ backgroundColor: tag.color }"
                ></span>
                {{ tag.name }}
              </div>
              <div class="tag-count">{{ tag.count }} задач</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Список задач -->
    <div class="tasks-section">
      <h2 class="section-title">Активные задачи</h2>

      <div class="task-filters">
        <div class="search-box">
          <i class="material-icons-outlined">search</i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск задач..."
            class="search-input"
          />
        </div>

        <div class="priority-filter">
          <label>Приоритет:</label>
          <div class="priority-selector">
            <button
              v-for="i in 5"
              :key="i"
              class="priority-option"
              :class="{ active: priorityFilter === i }"
              @click="priorityFilter = priorityFilter === i ? null : i"
              :style="{ backgroundColor: getPriorityColor(i) }"
            >
              {{ i }}
            </button>
          </div>
        </div>
      </div>

      <div class="task-list">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-card"
          @click="openCompleteModal(task)"
        >
          <div class="task-card-header">
            <div
              class="task-priority"
              :style="{ backgroundColor: getPriorityColor(task.priority) }"
            >
              {{ task.priority }}
            </div>
            <h3 class="task-card-title">{{ task.title }}</h3>
          </div>

          <p class="task-card-description">{{ task.description }}</p>

          <div class="task-card-footer">
            <div class="task-tags">
              <span
                v-for="tag in task.tags"
                :key="tag.id"
                class="task-tag"
                :style="{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  borderColor: tag.color,
                }"
              >
                {{ tag.name }}
              </span>
            </div>

            <div class="task-estimate">
              <i class="material-icons-outlined">schedule</i>
              {{ formatTime(task.estimatedTime) }}
            </div>
          </div>
        </div>

        <div v-if="filteredTasks.length === 0" class="empty-state">
          <i class="material-icons-outlined">task_alt</i>
          <p>Нет задач по выбранным фильтрам</p>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания задачи -->
    <transition name="modal">
      <div
        v-if="isCreateModalOpen"
        class="modal-overlay"
        @click.self="closeCreateModal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2>Новая задача</h2>
            <button class="modal-close" @click="closeCreateModal">
              <i class="material-icons-outlined">close</i>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Название задачи</label>
              <input
                v-model="newTask.title"
                type="text"
                class="form-input"
                placeholder="Что нужно сделать?"
              />
            </div>

            <div class="form-group">
              <label>Описание</label>
              <textarea
                v-model="newTask.description"
                class="form-textarea"
                placeholder="Детали задачи..."
              ></textarea>
            </div>

            <div class="form-group">
              <label>Приоритет</label>
              <div class="priority-selector large">
                <button
                  v-for="i in 5"
                  :key="i"
                  class="priority-option"
                  :class="{ active: newTask.priority === i }"
                  @click="newTask.priority = i"
                  :style="{ backgroundColor: getPriorityColor(i) }"
                >
                  {{ i }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Ожидаемое время</label>
              <TimePicker v-model="newTask.estimatedTime" />
            </div>

            <div class="form-group">
              <label>Теги</label>
              <div class="tags-selector">
                <div
                  v-for="tag in taskStore.tags"
                  :key="tag.id"
                  class="tag-option"
                  :class="{ selected: isTagSelected(tag.id) }"
                  @click="toggleTag(tag.id)"
                  :style="{
                    backgroundColor: isTagSelected(tag.id)
                      ? `${tag.color}40`
                      : 'transparent',
                    borderColor: tag.color,
                    color: isTagSelected(tag.id)
                      ? tag.color
                      : 'var(--text-secondary)',
                  }"
                >
                  {{ tag.name }}
                </div>
                <button class="add-tag-button" @click="showTagModal = true">
                  <i class="material-icons-outlined">add</i>
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="cancel-button" @click="closeCreateModal">
              Отмена
            </button>
            <button
              class="save-button"
              @click="createTask"
              :disabled="!newTask.title.trim()"
            >
              Создать задачу
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Модальное окно завершения задачи -->
    <transition name="modal">
      <div
        v-if="isCompleteModalOpen"
        class="modal-overlay"
        @click.self="closeCompleteModal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2>Завершение задачи</h2>
            <button class="modal-close" @click="closeCompleteModal">
              <i class="material-icons-outlined">close</i>
            </button>
          </div>

          <div class="modal-body">
            <h3 class="task-to-complete">{{ currentTask?.title }}</h3>

            <div class="time-input-group">
              <label>Затраченное время:</label>
              <TimePicker v-model="timeSpent" />
            </div>

            <div class="notes-group">
              <label>Заметки (опционально):</label>
              <textarea
                v-model="completionNotes"
                class="form-textarea"
                placeholder="Что было сделано? Какие были сложности?"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="cancel-button" @click="closeCompleteModal">
              Отмена
            </button>
            <button
              class="save-button"
              @click="completeCurrentTask"
              :disabled="timeSpent <= 0"
            >
              Завершить задачу
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Модальное окно создания тега -->
    <transition name="modal">
      <div
        v-if="showTagModal"
        class="modal-overlay"
        @click.self="showTagModal = false"
      >
        <div class="modal-content small">
          <div class="modal-header">
            <h2>Новый тег</h2>
            <button class="modal-close" @click="showTagModal = false">
              <i class="material-icons-outlined">close</i>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Название тега</label>
              <input
                v-model="newTag.name"
                type="text"
                class="form-input"
                placeholder="Работа, Личное и т.д."
              />
            </div>

            <div class="form-group">
              <label>Цвет</label>
              <ColorPicker v-model="newTag.color" />
            </div>
          </div>

          <div class="modal-footer">
            <button class="cancel-button" @click="showTagModal = false">
              Отмена
            </button>
            <button
              class="save-button"
              @click="addNewTag"
              :disabled="!newTag.name.trim()"
            >
              Создать тег
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/store/tasks'
import TimePicker from '@/components/ui/TimePicker.vue'
import ColorPicker from '@/components/ui/ColorPicker.vue'
import type { Task } from '@/store/tasks'

const taskStore = useTaskStore()

// Состояние UI
const isCreateModalOpen = ref(false)
const isCompleteModalOpen = ref(false)
const showTagModal = ref(false)
const searchQuery = ref('')
const priorityFilter = ref<number | null>(null)

// Данные форм
const newTask = ref({
  title: '',
  description: '',
  priority: 3,
  estimatedTime: 60, // 1 час по умолчанию
  tags: [] as string[],
})

const currentTask = ref<Task | null>(null)
const timeSpent = ref(0)
const completionNotes = ref('')

const newTag = ref({
  name: '',
  color: '#31a974',
})

// Фильтрация задач
const filteredTasks = computed(() => {
  return taskStore.tasks
    .filter((task) => !task.completedAt)
    .filter((task) => {
      const matchesSearch =
        !searchQuery.value ||
        task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.value.toLowerCase())

      const matchesPriority =
        priorityFilter.value === null || task.priority === priorityFilter.value

      return matchesSearch && matchesPriority
    })
})

// Статистика по приоритетам
const priorityCompletionRate = (priority: number) => {
  const totalTasks = taskStore.tasks.filter(
    (t) => t.priority === priority
  ).length
  const completedTasks = taskStore.tasks.filter(
    (t) => t.priority === priority && t.completedAt
  ).length

  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
}

// Работа с тегами
const isTagSelected = (tagId: string) => {
  return newTask.value.tags.includes(tagId)
}

const toggleTag = (tagId: string) => {
  if (isTagSelected(tagId)) {
    newTask.value.tags = newTask.value.tags.filter((id) => id !== tagId)
  } else {
    newTask.value.tags.push(tagId)
  }
}

// Цвета для приоритетов
const getPriorityColor = (priority: number) => {
  const colors = ['#4caf50', '#8bc34a', '#ffc107', '#ff9800', '#f44336']
  return colors[Math.min(priority - 1, 4)]
}

// Форматирование времени
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours > 0 ? `${hours}ч ` : ''}${mins}м`
}

// Модальные окна
const openCreateModal = () => {
  newTask.value = {
    title: '',
    description: '',
    priority: 3,
    estimatedTime: 60,
    tags: [],
  }
  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  isCreateModalOpen.value = false
}

const openCompleteModal = (task: Task) => {
  currentTask.value = task
  timeSpent.value = task.estimatedTime
  completionNotes.value = ''
  isCompleteModalOpen.value = true
}

const closeCompleteModal = () => {
  isCompleteModalOpen.value = false
}

// Действия с задачами
const createTask = () => {
  const tags = taskStore.tags.filter((tag) =>
    newTask.value.tags.includes(tag.id)
  )

  taskStore.addTask({
    title: newTask.value.title,
    description: newTask.value.description,
    priority: newTask.value.priority,
    estimatedTime: newTask.value.estimatedTime,
    tags: [...tags],
  })

  closeCreateModal()
}

const completeCurrentTask = () => {
  if (currentTask.value) {
    taskStore.completeTask(currentTask.value.id, timeSpent.value)
    closeCompleteModal()
  }
}

// Добавление тега
const addNewTag = () => {
  const tag = taskStore.addTag({
    name: newTag.value.name,
    color: newTag.value.color,
  })

  newTask.value.tags.push(tag.id)
  newTag.value = { name: '', color: '#31a974' }
  showTagModal.value = false
}
</script>

<style lang="scss" scoped>
.task-manager {
  padding: var(--space-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);

  .task-title {
    font-size: var(--text-2xl);
    color: var(--text-primary);
    font-weight: 600;
  }
}

.create-button {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  background-color: var(--primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-normal) var(--ease-out);

  &:hover {
    background-color: darken(#31a974, 10%);
  }

  i {
    font-size: var(--text-lg);
  }
}

.section-title {
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
  font-weight: 500;
}

.analytics-section {
  margin-bottom: var(--space-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);

  h3 {
    font-size: var(--text-lg);
    margin-bottom: var(--space-md);
    color: var(--text-primary);
  }
}

.priority-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.priority-stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.priority-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.priority-bar-container {
  width: 100%;
  height: 8px;
  background-color: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.priority-bar {
  height: 100%;
  border-radius: 4px;
}

.priority-time {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.tag-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-sm);
}

.tag-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.tag-info {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
}

.tag-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.tag-count {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.tasks-section {
  margin-top: var(--space-xl);
}

.task-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;

  i {
    position: absolute;
    left: var(--space-sm);
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
  }
}

.search-input {
  width: 100%;
  padding: var(--space-sm) var(--space-sm) var(--space-sm)
    calc(var(--space-lg) + var(--space-xs));
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--transition-normal) var(--ease-out);

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-bg);
  }
}

.priority-filter {
  display: flex;
  align-items: center;
  gap: var(--space-sm);

  label {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
}

.priority-selector {
  display: flex;
  gap: var(--space-xs);
}

.priority-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: transform var(--transition-fast) var(--ease-out);

  &:hover {
    transform: scale(1.1);
  }

  &.active {
    transform: scale(1.1);
    box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px currentColor;
  }

  &.large {
    width: 40px;
    height: 40px;
    font-size: var(--text-lg);
  }
}

.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-md);

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.task-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary);
  }
}

.task-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.task-priority {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: var(--text-sm);
}

.task-card-title {
  font-size: var(--text-lg);
  color: var(--text-primary);
  flex: 1;
}

.task-card-description {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.task-tag {
  font-size: var(--text-xs);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid;
  font-weight: 500;
}

.task-estimate {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--text-tertiary);

  i {
    font-size: var(--text-sm);
  }
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-xl) var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border);

  i {
    font-size: 48px;
    color: var(--text-tertiary);
    margin-bottom: var(--space-sm);
  }

  p {
    color: var(--text-secondary);
    margin-bottom: var(--space-md);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalFadeIn 0.3s var(--ease-out);

  &.small {
    max-width: 400px;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  border-bottom: 1px solid var(--border);

  h2 {
    font-size: var(--text-xl);
    color: var(--text-primary);
  }
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--transition-fast) var(--ease-out);

  &:hover {
    color: var(--text-primary);
  }

  i {
    font-size: var(--text-lg);
  }
}

.modal-body {
  padding: var(--space-md);
}

.form-group {
  margin-bottom: var(--space-lg);

  label {
    display: block;
    margin-bottom: var(--space-sm);
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--transition-normal) var(--ease-out);

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-bg);
  }
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.tags-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.tag-option {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid;
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);

  &:hover {
    opacity: 0.8;
  }

  &.selected {
    font-weight: 500;
  }
}

.add-tag-button {
  background: none;
  border: 1px dashed var(--border);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-top: 1px solid var(--border);
}

.cancel-button,
.save-button {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--transition-normal) var(--ease-out);
}

.cancel-button {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);

  &:hover {
    background-color: var(--bg-tertiary);
  }
}

.save-button {
  background-color: var(--primary);
  color: white;
  border: none;

  &:hover {
    background-color: darken(#31a974, 10%);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.task-to-complete {
  font-size: var(--text-lg);
  color: var(--text-primary);
  margin-bottom: var(--space-lg);
}

.time-input-group,
.notes-group {
  margin-bottom: var(--space-lg);

  label {
    display: block;
    margin-bottom: var(--space-sm);
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.5s var(--ease-out);
}

.task-list-enter-from,
.task-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.task-list-move {
  transition: transform 0.5s var(--ease-out);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
