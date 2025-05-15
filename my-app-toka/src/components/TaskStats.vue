<template>
  <div class="stats-container">
    <transition-group name="stats" tag="div" class="stats-grid">
      <div
        v-for="stat in statsList"
        :key="stat.id"
        class="stat-card"
        :class="stat.id"
      >
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <div class="stat-icon">
          <i class="material-icons">{{ stat.icon }}</i>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
})

const statsList = computed(() => [
  {
    id: 'total',
    value: props.stats.total,
    label: 'Всего задач',
    icon: 'list_alt',
  },
  {
    id: 'active',
    value: props.stats.active,
    label: 'Активных',
    icon: 'pending_actions',
  },
  {
    id: 'completed',
    value: props.stats.completed,
    label: 'Завершено',
    icon: 'check_circle',
  },
  {
    id: 'overdue',
    value: props.stats.overdue,
    label: 'Просрочено',
    icon: 'warning',
  },
])
</script>

<style scoped>
.stats-container {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  position: relative;
  padding: 16px;
  border-radius: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.total {
  border-left: 4px solid var(--primary);
}

.stat-card.active {
  border-left: 4px solid var(--info);
}

.stat-card.completed {
  border-left: 4px solid var(--success);
}

.stat-card.overdue {
  border-left: 4px solid var(--error);
}

.stat-content {
  z-index: 1;
  position: relative;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.stat-icon {
  position: absolute;
  right: 16px;
  top: 16px;
  opacity: 0.2;
  font-size: 48px;
  color: var(--text-primary);
}

/* Анимации */
.stats-move,
.stats-enter-active,
.stats-leave-active {
  transition: all 0.5s ease;
}

.stats-enter-from,
.stats-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.stats-leave-active {
  position: absolute;
}
</style>
