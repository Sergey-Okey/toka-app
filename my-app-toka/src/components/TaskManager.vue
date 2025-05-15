<template>
  <div class="task-manager">
    <!-- Назад -->
    <button
      v-if="selectedDate"
      class="back-button"
      @click="backToCalendar"
      aria-label="Вернуться к календарю"
    >
      <i class="material-icons">arrow_back</i>
      Назад
    </button>

    <!-- Редактор -->
    <TaskEditor
      :visible="editorVisible"
      :task="editingTask"
      @close="closeEditor"
      @save="handleSave"
    />

    <div class="manager-body">
      <!-- Управление -->
      <div class="manager-controls">
        <TaskFilters
          v-model:searchQuery="searchQuery"
          v-model:filterStatus="filterStatus"
          v-model:sortField="sortField"
          v-model:sortDirection="sortDirection"
          @new-task="openEditor(null)"
        />
      </div>

      <!-- Статистика -->
      <TaskStats :stats="stats" />

      <!-- Список задач -->
      <div class="task-list">
        <transition-group name="fade-slide" tag="div" class="task-list-inner">
          <TaskCard
            v-for="task in paginatedTasks"
            :key="task.id"
            :task="task"
            @edit="openEditor"
            @delete="confirmDelete"
            @toggle-complete="() => taskStore.toggleTaskCompletion(task.id)"
          />
        </transition-group>

        <div v-if="filteredTasks.length === 0" class="empty-state">
          <EmptyState @create-task="openEditor(null)" />
        </div>

        <Pagination
          v-if="filteredTasks.length > pageSize"
          v-model:currentPage="currentPage"
          :total-items="filteredTasks.length"
          :page-size="pageSize"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import type { Task, TaskStats as Stats } from '@/types'
import TaskEditor from './TaskEditor.vue'
import TaskFilters from './TaskFilters.vue'
import TaskStats from './TaskStats.vue'
import TaskCard from './TaskCard.vue'
import EmptyState from './EmptyState.vue'
import Pagination from './Pagination.vue'

const taskStore = useTaskStore()

const editorVisible = ref(false)
const editingTask = ref<Task | null>(null)
const searchQuery = ref('')
const filterStatus = ref<'all' | 'completed' | 'pending'>('all')
const sortField = ref<'createdAt' | 'priority'>('createdAt')
const sortDirection = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const pageSize = 6

const selectedDate = ref<string | null>(null)

function openEditor(task: Task | null) {
  editingTask.value = task
  editorVisible.value = true
}

function closeEditor() {
  editorVisible.value = false
  editingTask.value = null
}

function handleSave(task: Task) {
  if (task.id) {
    taskStore.updateTask(task)
  } else {
    taskStore.addTask(task)
  }
  closeEditor()
}

function confirmDelete(task: Task) {
  if (confirm(`Удалить задачу «${task.title}»?`)) {
    taskStore.deleteTask(task.id)
  }
}

function backToCalendar() {
  selectedDate.value = null
  // Можно добавить логику для перехода в календарь
}

const filteredTasks = computed(() => {
  return taskStore.filteredTasks({
    search: searchQuery.value,
    status: filterStatus.value,
    sortBy: sortField.value,
    sortOrder: sortDirection.value,
  })
})

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredTasks.value.slice(start, start + pageSize)
})

const stats = computed<Stats>(() => taskStore.getStats())
</script>

<style scoped lang="scss">
.task-manager {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: var(--space-md);

  .back-button {
    align-self: flex-start;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: none;
    color: var(--accent);
    font-weight: 500;
    cursor: pointer;
    transition: color 0.3s;

    i {
      font-size: 20px;
    }

    &:hover {
      color: var(--accent-hover);
    }
  }

  .manager-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .manager-controls {
    background: var(--bg-secondary);
    padding: var(--space-md);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);

    .task-list-inner {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .empty-state {
      margin-top: 2rem;
      text-align: center;
    }
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (min-width: 768px) {
  .task-manager {
    padding: var(--space-lg);

    .manager-body {
      flex-direction: row;
      align-items: flex-start;
    }

    .manager-controls {
      flex: 0 0 280px;
    }

    .task-list {
      flex: 1;
    }
  }
}
</style>
