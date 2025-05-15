<template>
  <div class="pagination">
    <button
      class="pagination-button"
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
      aria-label="Предыдущая страница"
    >
      <i class="material-icons">chevron_left</i>
    </button>

    <button
      v-for="page in pages"
      :key="page"
      class="pagination-button"
      :class="{ active: page === currentPage }"
      @click="changePage(page)"
    >
      {{ page }}
    </button>

    <button
      class="pagination-button"
      :disabled="currentPage === totalPages"
      @click="changePage(currentPage + 1)"
      aria-label="Следующая страница"
    >
      <i class="material-icons">chevron_right</i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update:currentPage'])

const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))

const pages = computed(() => {
  const range = []
  const maxVisible = 5
  let start = 1
  let end = totalPages.value

  if (totalPages.value > maxVisible) {
    start = Math.max(1, props.currentPage - 2)
    end = Math.min(totalPages.value, props.currentPage + 2)

    if (props.currentPage <= 3) {
      end = maxVisible
    } else if (props.currentPage >= totalPages.value - 2) {
      start = totalPages.value - maxVisible + 1
    }
  }

  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  return range
})

function changePage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 24px;
}

.pagination-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--text-tertiary);
}

.pagination-button.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Анимации */
.pagination-button {
  transition: all 0.3s ease;
}

.pagination-button:hover {
  transform: translateY(-2px);
}
</style>
