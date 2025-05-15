<template>
  <div class="empty-container">
    <div class="empty-content">
      <div class="empty-icon">
        <i class="material-icons">checklist</i>
      </div>
      <h3 class="empty-title">Нет задач</h3>
      <p class="empty-description">
        {{ description }}
      </p>
      <button class="primary-button" @click="$emit('create-task')">
        <i class="material-icons">add</i>
        Создать задачу
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  selectedDate: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['create-task'])

const description = computed(() =>
  props.selectedDate
    ? `Нет задач на выбранную дату`
    : 'Добавьте новую задачу, нажав на кнопку ниже'
)
</script>

<style scoped>
.empty-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 50%;
  font-size: 40px;
}

.empty-title {
  margin: 0 0 8px;
  font-size: 20px;
  color: var(--text-primary);
}

.empty-description {
  margin: 0 0 24px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.primary-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.primary-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Анимации */
.empty-content {
  animation: fade-in 0.5s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
