<template>
  <div class="filters-container">
    <div class="search-group">
      <div class="search-input-wrapper">
        <i class="material-icons search-icon">search</i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск задач..."
          class="search-input"
          aria-label="Поиск задач"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="clear-search"
          aria-label="Очистить поиск"
        >
          <i class="material-icons">close</i>
        </button>
      </div>

      <select
        v-model="filterStatus"
        class="filter-select"
        aria-label="Фильтр по статусу"
      >
        <option value="all">Все задачи</option>
        <option value="active">Активные</option>
        <option value="completed">Завершенные</option>
        <option value="overdue">Просроченные</option>
      </select>
    </div>

    <div class="actions-group">
      <button class="primary-button" @click="$emit('new-task')">
        <i class="material-icons">add</i>
        Новая задача
      </button>

      <div class="sort-group">
        <select
          v-model="sortField"
          class="sort-select"
          aria-label="Поле сортировки"
        >
          <option value="dueDate">По дате</option>
          <option value="title">По названию</option>
          <option value="priority">По приоритету</option>
          <option value="createdAt">По дате создания</option>
        </select>
        <button
          class="sort-direction"
          @click="toggleSortDirection"
          aria-label="Направление сортировки"
        >
          <i class="material-icons">{{
            sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'
          }}</i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  searchQuery: String,
  filterStatus: String,
  sortField: String,
  sortDirection: String,
})

const emit = defineEmits([
  'update:searchQuery',
  'update:filterStatus',
  'update:sortField',
  'update:sortDirection',
  'new-task',
])

const searchQuery = ref(props.searchQuery)
const filterStatus = ref(props.filterStatus)
const sortField = ref(props.sortField)
const sortDirection = ref(props.sortDirection)

watch(searchQuery, (val) => emit('update:searchQuery', val))
watch(filterStatus, (val) => emit('update:filterStatus', val))
watch(sortField, (val) => emit('update:sortField', val))
watch(sortDirection, (val) => emit('update:sortDirection', val))

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}
</script>

<style scoped>
.filters-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.actions-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (min-width: 768px) {
  .filters-container {
    flex-direction: row;
    justify-content: space-between;
  }

  .search-group {
    flex-direction: row;
    flex-grow: 1;
    max-width: 600px;
  }

  .actions-group {
    flex-direction: row;
    align-items: center;
  }
}

.search-input-wrapper {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.clear-search {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-tertiary);
  padding: 4px;
  border-radius: 50%;
}

.filter-select,
.sort-select {
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  appearance: none;
}

.filter-select {
  min-width: 180px;
}

.sort-group {
  display: flex;
  gap: 4px;
}

.sort-direction {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-primary);
}

.primary-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.primary-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Анимации */
.filters-container > * {
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .search-group {
    transition: all 0.3s ease;
  }
}
</style>
