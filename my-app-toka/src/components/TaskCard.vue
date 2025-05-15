<template>
  <div
    class="task-card"
    :class="{
      completed: task.completed,
      overdue: isOverdue,
      [task.priority]: task.priority !== 'none',
    }"
  >
    <div
      class="task-checkbox"
      role="checkbox"
      :aria-checked="task.completed"
      tabindex="0"
      @click="$emit('toggle-complete')"
      @keydown.enter.space.prevent="$emit('toggle-complete')"
    >
      <div class="checkbox" :class="{ checked: task.completed }">
        <i class="material-icons" v-if="task.completed">check</i>
      </div>
    </div>

    <div class="task-content" @click="$emit('edit', task)" :title="task.title">
      <div class="task-header">
        <h3 class="task-title" :title="task.title">{{ task.title }}</h3>
        <div class="task-priority" v-if="task.priority !== 'none'">
          <span :class="task.priority">{{ priorityLabel }}</span>
        </div>
      </div>

      <div class="task-meta">
        <div
          v-if="task.dueDate"
          class="task-date"
          :aria-label="dueDateAriaLabel"
        >
          <i class="material-icons" aria-hidden="true">event</i>
          <span>{{ formattedDueDate }}</span>
          <span v-if="isOverdue" class="overdue-badge" role="alert"
            >Просрочено</span
          >
        </div>

        <div class="task-created" :aria-label="createdAtAriaLabel">
          <i class="material-icons" aria-hidden="true">schedule</i>
          <span>{{ formattedCreatedAt }}</span>
        </div>
      </div>

      <div v-if="task.tags.length > 0" class="task-tags">
        <transition-group name="tag-list" tag="div">
          <span v-for="tag in task.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </transition-group>
      </div>
    </div>

    <div class="task-actions">
      <button
        class="action-button"
        @click.stop="$emit('edit', task)"
        aria-label="Редактировать задачу"
        type="button"
      >
        <i class="material-icons">edit</i>
      </button>
      <button
        class="action-button danger"
        @click.stop="confirmDelete"
        aria-label="Удалить задачу"
        type="button"
      >
        <i class="material-icons">delete</i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/stores/taskStore'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits([
  'edit',
  'delete',
  'toggle-complete',
  'confirm-delete',
])

const isOverdue = computed(() => {
  if (props.task.completed || !props.task.dueDate) return false
  return new Date(props.task.dueDate) < new Date()
})

const priorityLabel = computed(() => {
  switch (props.task.priority) {
    case 'high':
      return 'Высокий'
    case 'medium':
      return 'Средний'
    case 'low':
      return 'Низкий'
    default:
      return 'Без приоритета'
  }
})

const formattedDueDate = computed(() => {
  return formatDate(props.task.dueDate)
})

const formattedCreatedAt = computed(() => {
  return formatDate(props.task.createdAt, true)
})

const dueDateAriaLabel = computed(() => {
  return isOverdue.value
    ? `Дата выполнения ${formattedDueDate.value}, просрочено`
    : `Дата выполнения ${formattedDueDate.value}`
})

const createdAtAriaLabel = computed(() => {
  return `Дата создания ${formattedCreatedAt.value}`
})

function formatDate(dateStr: string, withTime = false) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const options: Intl.DateTimeFormatOptions = withTime
    ? {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    : { day: '2-digit', month: '2-digit', year: 'numeric' }
  return d.toLocaleDateString('ru-RU', options)
}

function confirmDelete() {
  // Передаём родителю событие подтверждения удаления — там логика confirm/modal
  emit('confirm-delete', props.task.id)
}
</script>

<style scoped>
.task-card {
  display: flex;
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  border: 1px solid var(--border);
  position: relative;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  animation: pulse-border 1.5s infinite ease-in-out;
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

@keyframes pulse-border {
  0%,
  100% {
    border-left-color: var(--error);
  }
  50% {
    border-left-color: rgba(var(--error-rgb), 0.5);
  }
}

.task-checkbox {
  margin-right: 16px;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
  cursor: pointer;
  outline-offset: 2px;
}

.task-checkbox:focus {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  user-select: none;
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
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.2s ease;
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
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.task-title {
  font-size: 16px;
  margin: 0;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
  font-weight: 500;
}

.task-priority span {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 10px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  user-select: none;
}

.task-priority .high {
  background-color: rgba(var(--error-rgb), 0.1);
  color: var(--error);
}

.task-priority .medium {
  background-color: rgba(var(--warning-rgb), 0.1);
  color: var(--warning);
}

.task-priority .low {
  background-color: rgba(var(--secondary-rgb), 0.1);
  color: var(--secondary);
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.task-date,
.task-created {
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-date i,
.task-created i {
  font-size: 18px;
  opacity: 0.8;
}

.overdue-badge {
  color: var(--error);
  font-size: 12px;
  font-weight: bold;
  margin-left: 4px;
  background: rgba(var(--error-rgb), 0.1);
  padding: 2px 6px;
  border-radius: 10px;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.tag {
  background: var(--primary-light);
  color: var(--primary);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
  height: 24px;
  user-select: none;
}

.task-actions {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-left: 8px;
}

.action-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.action-button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-button.danger:hover {
  color: var(--error);
}

.action-button i {
  font-size: 18px;
}

/* Анимации */
.tag-list-enter-active,
.tag-list-leave-active {
  transition: all 0.3s ease;
}

.tag-list-enter-from,
.tag-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.tag-list-move {
  transition: transform 0.3s ease;
}
</style>
