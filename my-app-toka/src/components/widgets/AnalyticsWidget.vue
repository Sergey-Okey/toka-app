<template>
  <div class="analytics-widget widget-card">
    <div class="widget-header">
      <h2 class="widget-title">Аналитика</h2>
      <button class="refresh-btn" @click="$emit('refresh')" :disabled="loading">
        <i class="material-icons-outlined">refresh</i>
      </button>
    </div>

    <div class="analytics-content">
      <template v-if="loading">
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Анализируем вашу продуктивность...</p>
        </div>
      </template>
      <template v-else>
        <div class="insight-section">
          <h3 class="section-title">Инсайт</h3>
          <p class="insight-text">{{ insight || 'Нет данных для анализа' }}</p>
        </div>

        <div class="tip-section">
          <h3 class="section-title">Совет</h3>
          <p class="tip-text">
            {{
              tip ||
              'Попробуйте выполнить несколько задач для получения рекомендаций'
            }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  insight: {
    type: String,
    default: '',
  },
  tip: {
    type: String,
    default: '',
  },
})

defineEmits(['refresh'])
</script>

<style scoped lang="scss">
.analytics-widget {
  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .refresh-btn {
    background: var(--bg-secondary);
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s var(--ease-out);
    color: var(--text-secondary);

    &:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      transform: rotate(90deg);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .analytics-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px 0;
    color: var(--text-secondary);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .section-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .insight-text,
  .tip-text {
    margin: 0;
    line-height: 1.5;
    color: var(--text-primary);
  }

  .tip-section {
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
