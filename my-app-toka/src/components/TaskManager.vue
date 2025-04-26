<template>
  <div class="task-manager">
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
            <div class="date-picker">
              <input v-model="form.dueDate" type="date" />
              <button
                type="button"
                class="icon-button"
                @click="clearDueDate"
                :disabled="!form.dueDate"
              >
                <i class="material-icons">close</i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Приоритет</label>
            <div class="priority-buttons">
              <button
                type="button"
                :class="{ active: form.priority === 'high' }"
                @click="form.priority = 'high'"
              >
                Высокий
              </button>
              <button
                type="button"
                :class="{ active: form.priority === 'medium' }"
                @click="form.priority = 'medium'"
              >
                Средний
              </button>
              <button
                type="button"
                :class="{ active: form.priority === 'low' }"
                @click="form.priority = 'low'"
              >
                Низкий
              </button>
              <button
                type="button"
                :class="{ active: form.priority === 'none' }"
                @click="form.priority = 'none'"
              >
                Без приоритета
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Теги</label>
            <div class="tags-input">
              <input
                v-model="newTag"
                type="text"
                placeholder="Добавить тег"
                @keydown.enter.prevent="addTag"
              />
              <button
                type="button"
                class="icon-button small"
                @click="addTag"
                :disabled="!newTag"
              >
                <i class="material-icons">add</i>
              </button>
            </div>
            <div class="tags-list">
              <span v-for="tag in form.tags" :key="tag" class="tag">
                {{ tag }}
                <i class="material-icons" @click="removeTag(tag)">close</i>
              </span>
            </div>
          </div>

          <div class="editor-actions">
            <button type="button" class="secondary-button" @click="closeEditor">
              Отмена
            </button>
            <button type="submit" class="primary-button">
              {{ editingTask ? 'Обновить' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Основной интерфейс -->
    <div class="main-interface">
      <div class="controls">
        <div class="search-filter">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск задач..."
            class="search-input"
          />
          <select v-model="filterStatus" class="filter-select">
            <option value="all">Все задачи</option>
            <option value="active">Активные</option>
            <option value="completed">Завершенные</option>
            <option value="overdue">Просроченные</option>
          </select>
        </div>

        <div class="actions">
          <button class="primary-button" @click="openEditor(null)">
            <i class="material-icons">add</i>
            Новая задача
          </button>
          <div class="sort-controls">
            <select v-model="sortField">
              <option value="dueDate">По дате</option>
              <option value="title">По названию</option>
              <option value="priority">По приоритету</option>
              <option value="createdAt">По дате создания</option>
            </select>
            <button class="icon-button" @click="toggleSortDirection">
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
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalTasks }}</div>
          <div class="stat-label">Всего задач</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeTasks }}</div>
          <div class="stat-label">Активных</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ completedTasks }}</div>
          <div class="stat-label">Завершено</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ overdueTasks }}</div>
          <div class="stat-label">Просрочено</div>
        </div>
      </div>

      <!-- Список задач -->
      <div class="task-list">
        <div v-if="filteredTasks.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="material-icons">checklist</i>
          </div>
          <h3>Нет задач</h3>
          <p>Добавьте новую задачу, нажав на кнопку +</p>
          <button class="primary-button" @click="openEditor(null)">
            Создать первую задачу
          </button>
        </div>

        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-card"
          :class="{
            completed: task.completed,
            overdue: isTaskOverdue(task),
            priority: task.priority !== 'none',
            [task.priority]: task.priority !== 'none',
          }"
        >
          <div class="task-main" @click="toggleTaskCompletion(task.id)">
            <div class="task-checkbox">
              <i class="material-icons">
                {{ task.completed ? 'check_circle' : 'radio_button_unchecked' }}
              </i>
            </div>

            <div class="task-content">
              <h3 class="task-title">{{ task.title }}</h3>

              <div class="task-meta">
                <div v-if="task.dueDate" class="task-due-date">
                  <i class="material-icons">calendar_today</i>
                  <span>{{ formatDate(task.dueDate) }}</span>
                  <span v-if="isTaskOverdue(task)" class="overdue-badge">
                    Просрочено
                  </span>
                </div>

                <div class="task-info">
                  <div
                    v-if="task.priority !== 'none'"
                    class="task-priority"
                    :class="task.priority"
                  >
                    <i class="material-icons">priority_high</i>
                    {{ getPriorityLabel(task.priority) }}
                  </div>
                  <div class="task-created">
                    <i class="material-icons">schedule</i>
                    {{ formatDate(task.createdAt, true) }}
                  </div>
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
              @click.stop="confirmDelete(task.id)"
            >
              <i class="material-icons">delete</i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог подтверждения удаления -->
    <div v-if="confirmDialogVisible" class="confirm-dialog">
      <div class="dialog-backdrop" @click="confirmDialogVisible = false"></div>
      <div class="dialog-content">
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
          <button
            class="primary-button danger"
            @click="deleteTask(deleteTaskId)"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'TaskManager',
  setup() {
    // Состояние приложения
    const tasks = ref([])
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

    // Загрузка задач из localStorage
    onMounted(() => {
      const savedTasks = localStorage.getItem('tasks')
      if (savedTasks) {
        tasks.value = JSON.parse(savedTasks)
      }
    })

    // Сохранение задач в localStorage
    const saveTasks = () => {
      localStorage.setItem('tasks', JSON.stringify(tasks.value))
    }

    // Проверка просроченности задачи
    const isTaskOverdue = (task) => {
      if (task.completed || !task.dueDate) return false
      return new Date(task.dueDate) < new Date()
    }

    // Форматирование даты
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
          date.getFullYear() !== new Date().getFullYear()
            ? 'numeric'
            : undefined,
      })
    }

    // Метки приоритетов
    const getPriorityLabel = (priority) => {
      const labels = {
        high: 'Высокий',
        medium: 'Средний',
        low: 'Низкий',
      }
      return labels[priority] || ''
    }

    // Открытие редактора
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
        form.value = {
          id: null,
          title: '',
          dueDate: '',
          priority: 'none',
          tags: [],
          completed: false,
          createdAt: new Date().toISOString(),
        }
        editingTask.value = null
      }
      editorVisible.value = true
    }

    // Закрытие редактора
    const closeEditor = () => {
      editorVisible.value = false
      newTag.value = ''
    }

    // Очистка даты выполнения
    const clearDueDate = () => {
      form.value.dueDate = ''
    }

    // Добавление тега
    const addTag = () => {
      if (
        newTag.value.trim() &&
        !form.value.tags.includes(newTag.value.trim())
      ) {
        form.value.tags.push(newTag.value.trim())
        newTag.value = ''
      }
    }

    // Удаление тега
    const removeTag = (tag) => {
      form.value.tags = form.value.tags.filter((t) => t !== tag)
    }

    // Сохранение задачи
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

      if (editingTask.value) {
        const index = tasks.value.findIndex((t) => t.id === taskData.id)
        if (index !== -1) {
          tasks.value[index] = taskData
        }
      } else {
        tasks.value.unshift(taskData)
      }

      saveTasks()
      closeEditor()
    }

    // Переключение статуса выполнения
    const toggleTaskCompletion = (taskId) => {
      const task = tasks.value.find((t) => t.id === taskId)
      if (task) {
        task.completed = !task.completed
        saveTasks()
      }
    }

    // Подтверждение удаления
    const confirmDelete = (taskId) => {
      deleteTaskId.value = taskId
      confirmDialogVisible.value = true
    }

    // Удаление задачи
    const deleteTask = (taskId) => {
      tasks.value = tasks.value.filter((task) => task.id !== taskId)
      saveTasks()
      confirmDialogVisible.value = false
    }

    // Переключение направления сортировки
    const toggleSortDirection = () => {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    }

    // Вычисляемые свойства
    const sortedTasks = computed(() => {
      return [...tasks.value].sort((a, b) => {
        // Для числовых значений
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

    const filteredTasks = computed(() => {
      return sortedTasks.value.filter((task) => {
        // Фильтрация по статусу
        if (filterStatus.value === 'active' && task.completed) return false
        if (filterStatus.value === 'completed' && !task.completed) return false
        if (
          filterStatus.value === 'overdue' &&
          (!isTaskOverdue(task) || task.completed)
        )
          return false

        // Поиск по запросу
        if (searchQuery.value) {
          const search = searchQuery.value.toLowerCase()
          const inTitle = task.title.toLowerCase().includes(search)
          const inTags = task.tags.some((tag) =>
            tag.toLowerCase().includes(search)
          )
          return inTitle || inTags
        }

        return true
      })
    })

    // Статистика
    const totalTasks = computed(() => tasks.value.length)
    const activeTasks = computed(
      () => tasks.value.filter((t) => !t.completed).length
    )
    const completedTasks = computed(
      () => tasks.value.filter((t) => t.completed).length
    )
    const overdueTasks = computed(
      () => tasks.value.filter((t) => isTaskOverdue(t)).length
    )

    return {
      tasks,
      editorVisible,
      editingTask,
      confirmDialogVisible,
      deleteTaskId,
      newTag,
      sortField,
      sortDirection,
      filterStatus,
      searchQuery,
      form,
      totalTasks,
      activeTasks,
      completedTasks,
      overdueTasks,
      openEditor,
      closeEditor,
      clearDueDate,
      addTag,
      removeTag,
      handleSave,
      toggleTaskCompletion,
      confirmDelete,
      deleteTask,
      toggleSortDirection,
      isTaskOverdue,
      formatDate,
      getPriorityLabel,
      sortedTasks,
      filteredTasks,
    }
  },
}
</script>

<style lang="scss" scoped>
.task-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  // Общие стили
  .material-icons {
    font-size: 1.2rem;
    user-select: none;
  }

  // Кнопки
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    border-radius: 0.8rem;
    background: none;
  }

  .primary-button {
    padding: 0.8rem 1.5rem;
    background-color: #31a974;
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:hover {
      background-color: darken(#31a974, 10%);
      box-shadow: 0 0 15px rgba(49, 169, 116, 0.4);
    }

    &.danger {
      background-color: #ff3b30;

      &:hover {
        background-color: darken(#ff3b30, 10%);
        box-shadow: 0 0 15px rgba(255, 59, 48, 0.4);
      }
    }
  }

  .secondary-button {
    padding: 0.8rem 1.5rem;
    background-color: rgba(221, 221, 221, 0.2);
    color: #ffffff;
    font-size: 1rem;

    &:hover {
      background-color: rgba(221, 221, 221, 0.3);
    }
  }

  .icon-button {
    width: 2.5rem;
    height: 2.5rem;
    background-color: rgba(221, 221, 221, 0.1);
    color: #31a974;

    &:hover {
      background-color: rgba(49, 169, 116, 0.2);
    }

    &.small {
      width: 2rem;
      height: 2rem;
    }
  }

  .action-button {
    width: 2.2rem;
    height: 2.2rem;
    background-color: rgba(221, 221, 221, 0.1);
    color: #9b9a9a;
    border-radius: 50%;

    &:hover {
      background-color: rgba(221, 221, 221, 0.2);
    }

    &.danger:hover {
      background-color: rgba(255, 59, 48, 0.1);
      color: #ff3b30;
    }
  }

  // Формы и инпуты
  input,
  select {
    padding: 0.8rem;
    border-radius: 0.8rem;
    border: 1px solid rgba(221, 221, 221, 0.3);
    background-color: rgba(40, 40, 42, 0.8);
    color: #ffffff;
    font-size: 1rem;
    outline: none;
    transition: all 0.3s ease;

    &:focus {
      border-color: #31a974;
      box-shadow: 0 0 10px rgba(49, 169, 116, 0.3);
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
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
  }

  .editor-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    background-color: rgba(30, 30, 32, 0.9);
    border-radius: 1.2rem;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 1;
    border: 1px solid rgba(221, 221, 221, 0.2);

    h2 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      color: #ffffff;
    }

    .form-group {
      margin-bottom: 1.2rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: #b0b0b0;
      }

      .date-picker {
        display: flex;
        gap: 0.5rem;
        align-items: center;

        input {
          flex: 1;
        }
      }

      .priority-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;

        button {
          padding: 0.6rem;
          background-color: rgba(221, 221, 221, 0.1);
          color: #b0b0b0;
          font-size: 0.9rem;
          border-radius: 0.6rem;

          &.active {
            background-color: rgba(49, 169, 116, 0.2);
            color: #31a974;
            font-weight: 600;
          }

          &:hover:not(.active) {
            background-color: rgba(221, 221, 221, 0.2);
          }
        }
      }

      .tags-input {
        display: flex;
        gap: 0.5rem;

        input {
          flex: 1;
        }
      }

      .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.6rem;
          background-color: rgba(49, 169, 116, 0.2);
          border-radius: 0.4rem;
          color: #31a974;
          font-size: 0.8rem;

          i {
            font-size: 0.9rem;
            cursor: pointer;
            opacity: 0.7;

            &:hover {
              opacity: 1;
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
    }
  }

  // Основной интерфейс
  .main-interface {
    .controls {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;

      .search-filter {
        display: flex;
        gap: 1rem;

        .search-input {
          flex: 1;
        }

        .filter-select {
          width: 200px;
        }
      }

      .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1.5rem;
      }

      .sort-controls {
        display: flex;
        align-items: center;
        gap: 0.8rem;

        select {
          width: 160px;
        }
      }
    }

    // Статистика
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;

      .stat-card {
        background-color: rgba(30, 30, 32, 0.8);
        border-radius: 1rem;
        padding: 1.2rem;
        border: 1px solid rgba(221, 221, 221, 0.2);
        text-align: center;

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #31a974;
          margin-bottom: 0.3rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #b0b0b0;
        }
      }
    }

    // Список задач
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .task-card {
      background-color: rgba(30, 30, 32, 0.8);
      backdrop-filter: blur(50px);
      border-radius: 1.2rem;
      padding: 1.5rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(221, 221, 221, 0.2);
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 0 30px rgba(49, 169, 116, 0.3);
        border-color: #31a974;
      }

      &.completed {
        opacity: 0.7;
      }

      &.overdue {
        border-left: 3px solid rgba(255, 59, 48, 0.5);
      }

      &.priority {
        border-left-width: 3px;
        border-left-style: solid;
      }

      &.high {
        border-left-color: rgba(255, 59, 48, 0.5);
      }

      &.medium {
        border-left-color: rgba(255, 149, 0, 0.5);
      }

      &.low {
        border-left-color: rgba(52, 199, 89, 0.5);
      }

      .task-main {
        display: flex;
        gap: 1rem;
        cursor: pointer;

        .task-checkbox {
          flex-shrink: 0;

          .material-icons {
            font-size: 1.5rem;
            color: #31a974;
          }
        }

        .task-content {
          flex-grow: 1;

          .task-title {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 500;
            color: #ffffff;
          }

          .task-meta {
            margin-top: 0.5rem;

            .task-due-date {
              display: flex;
              align-items: center;
              gap: 0.3rem;
              font-size: 0.9rem;
              color: #b0b0b0;

              .overdue-badge {
                margin-left: 0.5rem;
                padding: 0.2rem 0.5rem;
                background-color: rgba(255, 59, 48, 0.2);
                border-radius: 0.4rem;
                color: #ff3b30;
                font-size: 0.7rem;
              }
            }

            .task-info {
              display: flex;
              gap: 1rem;
              margin-top: 0.5rem;

              .task-priority {
                display: flex;
                align-items: center;
                gap: 0.3rem;
                font-size: 0.8rem;
                padding: 0.2rem 0.7rem;
                border-radius: 0.4rem;

                &.high {
                  background-color: rgba(255, 59, 48, 0.2);
                  color: #ff3b30;
                }

                &.medium {
                  background-color: rgba(255, 149, 0, 0.2);
                  color: #ff9500;
                }

                &.low {
                  background-color: rgba(52, 199, 89, 0.2);
                  color: #34c759;
                }
              }

              .task-created {
                display: flex;
                align-items: center;
                gap: 0.3rem;
                font-size: 0.8rem;
                color: #b0b0b0;
              }
            }
          }

          .task-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.7rem;

            .tag {
              font-size: 0.7rem;
              padding: 0.2rem 0.7rem;
              background-color: rgba(49, 169, 116, 0.2);
              border-radius: 0.4rem;
              color: #31a974;
            }
          }
        }
      }

      &.completed {
        .task-checkbox .material-icons {
          color: #9b9a9a;
        }

        .task-title {
          text-decoration: line-through;
          color: #9b9a9a;
        }
      }

      .task-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.7rem;
        margin-top: 1rem;
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      background-color: rgba(30, 30, 32, 0.8);
      border-radius: 1.2rem;
      border: 1px dashed rgba(221, 221, 221, 0.3);

      .empty-icon {
        width: 4rem;
        height: 4rem;
        background-color: rgba(49, 169, 116, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.2rem;

        .material-icons {
          font-size: 2rem;
          color: #31a974;
        }
      }

      h3 {
        font-size: 1.3rem;
        margin: 0 0 0.7rem 0;
        color: #ffffff;
      }

      p {
        font-size: 0.9rem;
        margin: 0 0 1.5rem 0;
        color: #b0b0b0;
      }
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

    .dialog-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
    }

    .dialog-content {
      position: relative;
      width: 100%;
      max-width: 400px;
      background-color: rgba(30, 30, 32, 0.9);
      border-radius: 1.2rem;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 1;
      border: 1px solid rgba(221, 221, 221, 0.2);

      h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.3rem;
        color: #ffffff;
      }

      p {
        margin: 0 0 1.5rem 0;
        font-size: 0.9rem;
        color: #b0b0b0;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }
    }
  }
}

/* Адаптив */
@media (max-width: 768px) {
  .task-manager {
    padding: 1.5rem 1rem;

    .editor-container {
      padding: 1.5rem;
      margin: 0 1rem;
    }

    .main-interface {
      .controls {
        .search-filter {
          flex-direction: column;

          .filter-select {
            width: 100%;
          }
        }

        .actions {
          flex-direction: column;
          align-items: stretch;
        }
      }

      .stats {
        grid-template-columns: 1fr 1fr;
      }
    }
  }
}
</style>
