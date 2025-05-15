<template>
  <transition name="modal">
    <div v-if="visible" class="editor-modal">
      <div class="editor-backdrop" @click="close" />

      <div class="editor-container">
        <div class="editor-header">
          <h2>{{ task ? 'Редактировать задачу' : 'Новая задача' }}</h2>
          <button
            class="close-button"
            @click="close"
            aria-label="Закрыть редактор"
          >
            <i class="material-icons">close</i>
          </button>
        </div>

        <form @submit.prevent="save" class="editor-form">
          <div class="form-group">
            <label for="task-title">Название</label>
            <input
              id="task-title"
              v-model="form.title"
              type="text"
              placeholder="Введите название задачи"
              required
              class="input-field"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="due-date">Дата выполнения</label>
              <div class="date-picker">
                <input
                  id="due-date"
                  v-model="form.dueDate"
                  type="date"
                  class="input-field"
                />
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
              <label for="priority">Приоритет</label>
              <select
                id="priority"
                v-model="form.priority"
                class="select-field"
              >
                <option value="none">Без приоритета</option>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
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
                  :disabled="!newTag.trim()"
                  aria-label="Добавить тег"
                >
                  <i class="material-icons">add</i>
                </button>
              </div>
              <div class="tags-list">
                <transition-group name="tag-list" tag="div">
                  <span v-for="tag in form.tags" :key="tag" class="tag">
                    {{ tag }}
                    <button
                      @click="removeTag(tag)"
                      class="tag-remove"
                      aria-label="Удалить тег"
                    >
                      <i class="material-icons">close</i>
                    </button>
                  </span>
                </transition-group>
              </div>
            </div>
          </div>

          <div class="editor-actions">
            <button type="button" class="secondary-button" @click="close">
              Отмена
            </button>
            <button type="submit" class="primary-button">
              {{ task ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, type PropType } from 'vue'
import type { Task } from '@/stores/taskStore'

const props = defineProps({
  visible: Boolean,
  task: Object as PropType<Task | null>,
})

const emit = defineEmits(['close', 'save'])

const newTag = ref('')
const form = ref<Task>({
  id: '',
  title: '',
  dueDate: '',
  priority: 'none',
  completed: false,
  tags: [],
  createdAt: '',
})

watch(
  () => props.task,
  (task) => {
    if (task) {
      form.value = { ...task }
    } else {
      form.value = {
        id: '',
        title: '',
        dueDate: '',
        priority: 'none',
        completed: false,
        tags: [],
        createdAt: '',
      }
    }
  },
  { immediate: true }
)

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter((t) => t !== tag)
}

function clearDueDate() {
  form.value.dueDate = ''
}

function close() {
  emit('close')
}

function save() {
  emit('save', { ...form.value })
}
</script>

<style scoped>
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
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.editor-container {
  position: relative;
  background: var(--bg-primary);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1;
  border: 1px solid var(--border);
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg-primary);
  z-index: 2;
}

.editor-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.close-button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.editor-form {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.input-field:hover {
  border-color: var(--text-tertiary);
}

.input-field:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
  outline: none;
}

.date-picker {
  position: relative;
  display: flex;
  align-items: center;
}

.date-picker::after {
  content: '';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z' stroke='%23999999' stroke-width='1.5' stroke-miterlimit='10' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M15.6947 13.7002H15.7037M15.6947 16.2037H15.7037' stroke='%23999999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  pointer-events: none;
}

.clear-button {
  position: absolute;
  right: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 6px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.clear-button:disabled {
  cursor: default;
  opacity: 0.3;
}

.select-field {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-field:hover {
  border-color: var(--text-tertiary);
}

.select-field:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
  outline: none;
}

.tags-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-tag-button {
  background: var(--primary);
  border: none;
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  color: #fff;
  font-size: 20px;
  transition: background-color 0.2s ease;
}

.add-tag-button:disabled {
  background: var(--primary-muted);
  cursor: default;
}

.add-tag-button:hover:not(:disabled) {
  background: var(--primary-dark);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 0.875rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-remove:hover {
  color: var(--text-danger);
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.primary-button {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.primary-button:hover {
  background: var(--primary-dark);
}

.secondary-button {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: 12px 24px;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.secondary-button:hover {
  background: var(--bg-secondary);
}

/* Анимации */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.tag-list-enter-active,
.tag-list-leave-active {
  transition: all 0.3s ease;
}

.tag-list-enter-from,
.tag-list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
