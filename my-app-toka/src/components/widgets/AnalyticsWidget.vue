<template>
  <div class="analytics-widget widget">
    <div class="widget-header">
      <h3>
        <i class="material-icons-outlined">insights</i>
        Аналитика продуктивности
      </h3>
    </div>
    <div class="ai-content">
      <div v-if="loading" class="ai-loading">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <span>Анализируем данные...</span>
      </div>
      <div v-else class="ai-messages">
        <div v-if="insight" class="ai-message">
          <div class="message-icon">
            <i class="material-icons-outlined">analytics</i>
          </div>
          <div class="message-content">
            <div class="message-text">{{ insight }}</div>
          </div>
        </div>
        <div v-if="tip" class="ai-tip">
          <div class="tip-icon">
            <i class="material-icons-outlined">lightbulb</i>
          </div>
          <div class="tip-content">
            <span class="tip-title">Совет по улучшению</span>
            <span class="tip-text">{{ tip }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  insight: String,
  tip: String,
})
</script>

<style lang="scss" scoped>
.analytics-widget {
  height: 100%;
  display: flex;
  flex-direction: column;

  .widget-header {
    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;

      .material-icons-outlined {
        font-size: 1.25rem;
        color: var(--primary);
      }
    }
  }

  .ai-content {
    flex: 1;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4px 0;
  }

  .ai-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 100%;
    color: var(--text-secondary);

    .loading-spinner {
      width: 40px;
      height: 40px;
      position: relative;

      .spinner {
        width: 100%;
        height: 100%;
        border: 4px solid var(--primary-bg);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }
  }

  .ai-messages {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
  }

  .ai-message {
    display: flex;
    gap: 12px;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: 16px;
    border-left: 4px solid var(--primary);
    animation: fadeIn 0.5s var(--ease-out);

    .message-icon {
      flex-shrink: 0;
      .material-icons-outlined {
        color: var(--primary);
        font-size: 1.5rem;
      }
    }

    .message-content {
      .message-text {
        font-size: 0.875rem;
        line-height: 1.5;
        color: var(--text-primary);
      }
    }
  }

  .ai-tip {
    display: flex;
    gap: 12px;
    background-color: var(--warning-bg);
    border-radius: var(--radius-md);
    padding: 16px;
    animation: fadeIn 0.5s var(--ease-out) 0.2s both;

    .tip-icon {
      flex-shrink: 0;
      .material-icons-outlined {
        color: var(--warning);
        font-size: 1.5rem;
      }
    }

    .tip-content {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .tip-title {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--warning);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .tip-text {
        font-size: 0.875rem;
        line-height: 1.5;
        color: var(--text-primary);
      }
    }
  }
}

/* Адаптивные стили */
@media (max-width: 1024px) {
  .analytics-widget {
    .ai-content {
      min-height: 160px;
    }

    .ai-message,
    .ai-tip {
      padding: 12px;
    }
  }
}

@media (max-width: 768px) {
  .analytics-widget {
    .ai-content {
      min-height: 140px;
    }

    .ai-message {
      .message-icon .material-icons-outlined,
      .tip-icon .material-icons-outlined {
        font-size: 1.25rem;
      }
    }
  }
}

@media (max-width: 480px) {
  .analytics-widget {
    .widget-header h3 {
      font-size: 1rem;
    }

    .ai-content {
      min-height: 120px;
    }

    .ai-message,
    .ai-tip {
      flex-direction: column;
      gap: 8px;
    }

    .message-icon,
    .tip-icon {
      display: flex;
      justify-content: center;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
