<template>
  <svg class="progress-circle" viewBox="0 0 100 100">
    <circle class="progress-circle-bg" cx="50" cy="50" r="45" />
    <circle
      class="progress-circle-fill"
      :style="circleStyle"
      cx="50"
      cy="50"
      r="45"
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100,
  },
  color: {
    type: String,
    default: '#31a974',
  },
  bgColor: {
    type: String,
    default: 'rgba(221, 221, 221, 0.1)',
  },
  strokeWidth: {
    type: Number,
    default: 5,
  },
})

const circleStyle = computed(() => {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (props.percentage / 100) * circumference

  return {
    stroke: props.color,
    strokeWidth: props.strokeWidth,
    strokeDasharray: circumference,
    strokeDashoffset: offset,
    strokeLinecap: 'round',
  }
})
</script>

<style scoped>
.progress-circle {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-circle-bg {
  fill: none;
  stroke: v-bind('props.bgColor');
  stroke-width: v-bind('props.strokeWidth');
}

.progress-circle-fill {
  fill: none;
  transition: stroke-dashoffset 0.5s ease;
}
</style>
