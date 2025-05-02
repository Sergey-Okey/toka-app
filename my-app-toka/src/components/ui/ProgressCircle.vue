<template>
  <div
    class="progress-circle"
    :style="{
      width: computedSize + 'px',
      height: computedSize + 'px',
      '--progress-color': color,
      '--progress-bg-color': bgColor,
      '--progress-stroke-width': strokeWidth + 'px',
    }"
  >
    <svg class="progress-svg" viewBox="0 0 100 100" aria-hidden="true">
      <circle
        class="progress-bg"
        cx="50"
        cy="50"
        :r="computedRadius"
        fill="none"
      />
      <circle
        class="progress-bar"
        cx="50"
        cy="50"
        :r="computedRadius"
        fill="none"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <div class="progress-content" :aria-label="`Прогресс: ${percentage}%`">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100,
  },
  color: {
    type: String,
    default: 'var(--primary)',
  },
  bgColor: {
    type: String,
    default: 'var(--bg-secondary)',
  },
  strokeWidth: {
    type: Number,
    default: 10,
    validator: (value) => value > 0 && value <= 20,
  },
  size: {
    type: [Number, String],
    default: 'auto',
    validator: (value) =>
      (typeof value === 'string' && value === 'auto') ||
      (typeof value === 'number' && value > 0),
  },
})

const computedSize = computed(() => {
  if (props.size === 'auto') {
    // Автоматический размер в зависимости от ширины экрана
    if (window.innerWidth < 480) return 100
    if (window.innerWidth < 768) return 120
    return 140
  }
  return props.size
})

const computedRadius = computed(() => 50 - props.strokeWidth / 2)
const circumference = computed(() => 2 * Math.PI * computedRadius.value)
const dashOffset = computed(() => {
  const progress = Math.min(100, Math.max(0, props.percentage))
  return circumference.value * (1 - progress / 100)
})
</script>

<style lang="scss" scoped>
.progress-circle {
  --progress-color: var(--primary);
  --progress-bg-color: var(--bg-secondary);
  --progress-stroke-width: 10px;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s var(--ease-out);
  aspect-ratio: 1/1;

  .progress-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    transition: all 0.6s var(--ease-bounce);
  }

  .progress-bg {
    stroke: var(--progress-bg-color);
    stroke-width: var(--progress-stroke-width);
    transition: stroke 0.3s var(--ease-out);
  }

  .progress-bar {
    stroke: var(--progress-color);
    stroke-width: var(--progress-stroke-width);
    stroke-linecap: round;
    stroke-dashoffset: v-bind(circumference);
    transition:
      stroke-dashoffset 0.8s var(--ease-bounce),
      stroke 0.3s var(--ease-out);
  }

  .progress-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    width: 80%;
    pointer-events: none;
  }
}

/* Адаптивные стили */
@media (max-width: 1024px) {
  .progress-circle {
    .progress-content {
      width: 85%;
    }
  }
}

@media (max-width: 768px) {
  .progress-circle {
    .progress-content {
      width: 90%;
    }
  }
}
</style>
