<template>
  <div class="task-manager">
    <!-- Кнопка назад -->
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
                placeholder="Введите название"
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
                <select v-model="form.priority" class="select-field">
                  <option value="none">Без приоритета</option>
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Таймер выполнения</label>
              <div class="timer-input">
                <input
                  v-model="form.estimatedTime"
                  type="number"
                  min="0"
                  placeholder="Часы"
                  class="input-field small"
                />
                <span>ч</span>
                <input
                  v-model="form.estimatedMinutes"
                  type="number"
                  min="0"
                  max="59"
                  placeholder="Мин"
                  class="input-field small"
                />
                <span>мин</span>
                <button
                  v-if="activeTaskId === form.id"
                  type="button"
                  class="timer-control"
                  @click.stop="stopTimer"
                >
                  <i class="material-icons">pause</i>
                </button>
                <button
                  v-else
                  type="button"
                  class="timer-control"
                  @click.stop="startTimer(form.id)"
                >
                  <i class="material-icons">play_arrow</i>
                </button>
              </div>
              <div v-if="form.timeSpent" class="time-spent">
                Затрачено: {{ formatTime(form.timeSpent) }}
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
                    <span
                      class="tag-bullet"
                      :style="{ backgroundColor: tag.color || taskStore.getTagColor(tag.name) }"
                    ></span>
                    {{ tag.name }}
                    <button @click="removeTag(tag)" class="tag-remove">
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

    <!-- Основной интерфейс -->
    <div class="main-interface">
      <div class="controls">
        <div class="search-container" :class="{ focused: searchFocused }">
          <div class="search-input-container">
            <i class="material-icons search-icon">search</i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск задач..."
              class="search-input"
              @focus="expandSearch"
              @blur="collapseSearch"
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

      <!-- Список задач -->
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
                <div class="task-priority" v-if="task.priority !== 'none'">
                  <span :class="task.priority">{{ getPriorityLabel(task.priority) }}</span>
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

                <div v-if="task.estimatedTime || task.estimatedMinutes" class="task-timer">
                  <i class="material-icons">timer</i>
                  <span>{{ task.estimatedTime || 0 }}ч {{ task.estimatedMinutes || 0 }}мин</span>
                  <button
                    v-if="activeTaskId === task.id"
                    class="timer-control"
                    @click.stop="stopTimer"
                  >
                    <i class="material-icons">pause</i>
                  </button>
                  <button v-else class="timer-control" @click.stop="startTimer(task.id)">
                    <i class="material-icons">play_arrow</i>
                  </button>
                  <div v-if="task.timeSpent" class="time-spent">
                    {{ formatTime(task.timeSpent) }}
                  </div>
                </div>
              </div>

              <div v-if="task.tags && task.tags.length > 0" class="task-tags">
                <span
                  v-for="tag in task.tags"
                  :key="tag.name"
                  class="tag"
                  :style="{ backgroundColor: tag.color || taskStore.getTagColor(tag.name) }"
                >
                  <span
                    class="tag-bullet"
                    :style="{ backgroundColor: tag.color || taskStore.getTagColor(tag.name) }"
                  ></span>
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

    <!-- Диалог подтверждения -->
    <transition name="fade">
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
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import type { Task, Tag } from '@/stores/taskStore'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

// Состояние компонента
const selectedDate = ref<Date | null>(null)
const searchQuery = ref('')
const searchFocused = ref(false)
const filterStatus = ref<'all' | 'active' | 'completed' | 'overdue'>('all')
const sortField = ref<'title' | 'dueDate' | 'createdAt' | 'priority'>('dueDate')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Таймер
const activeTaskId = ref<string | null>(null)
const timerInterval = ref<NodeJS.Timeout | null>(null)
const startTime = ref<number | null>(null)

// Редактор задач
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
  estimatedTime: 0,
  estimatedMinutes: 0,
  timeSpent: 0,
})
const newTag = ref<Partial<Tag>>({ name: '', color: '#31a974' })

// Диалог подтверждения
const confirmDialogVisible = ref(false)
const deleteTaskId = ref<string | null>(null)

// Методы для таймера
const startTimer = (taskId: string) => {
  stopTimer() // Останавливаем предыдущий таймер, если был

  activeTaskId.value = taskId
  startTime.value = Date.now()

  timerInterval.value = setInterval(() => {
    if (startTime.value) {
      const elapsedSeconds = Math.floor((Date.now() - startTime.value) / 1000)

      // Обновляем время в хранилище
      const task = taskStore.tasks.find((t) => t.id === taskId)
      if (task) {
        task.timeSpent = (task.timeSpent || 0) + 1
        taskStore.updateTask(task)
      }

      // Обновляем время в форме, если редактируется эта задача
      if (form.value.id === taskId) {
        form.value.timeSpent = (form.value.timeSpent || 0) + 1
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

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${hours > 0 ? `${hours}ч ` : ''}${minutes > 0 ? `${minutes}м ` : ''}${secs}с`
}

// Остальные методы остаются без изменений, кроме handleSave
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
    lastModified: new Date().toISOString(),
    estimatedTime: form.value.estimatedTime || 0,
    estimatedMinutes: form.value.estimatedMinutes || 0,
    timeSpent: form.value.timeSpent || 0,
  }

  if (editingTask.value) {
    taskStore.updateTask(taskData)
  } else {
    taskStore.addTask(taskData)
  }
  closeEditor()
}

// Добавляем очистку таймера при размонтировании
onUnmounted(() => {
  stopTimer()
})

// Остальной код компонента остается без изменений...
</script>

<style scoped>
/* Основные стили остаются без изменений, добавляем только новые для таймера и поиска */

/* Анимация поиска */
.search-container {
  transition: all 0.3s ease;
}

.search-input-container {
  position: relative;
  width: 40px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-container.focused .search-input-container,
.search-container:hover .search-input-container {
  width: 200px;
}

.search-input {
  width: 100%;
  padding-left: 40px;
  transition: all 0.3s ease;
}

.search-icon {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  transition: all 0.3s ease;
}

.search-container.focused .search-icon {
  color: var(--primary);
}

/* Стили для таймера */
.timer-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timer-control {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timer-control:hover {
  background: #2a9765;
  transform: scale(1.1);
}

.timer-control i {
  font-size: 18px;
}

.time-spent {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.task-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.task-timer .timer-control {
  width: 24px;
  height: 24px;
}

.task-timer .timer-control i {
  font-size: 16px;
}

/* Остальные стили остаются без изменений */
</style>
