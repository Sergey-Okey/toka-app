<template>
  <div class="doughnut-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
})

const chartCanvas = ref(null)
let chartInstance = null

const initChart = () => {
  if (chartCanvas.value) {
    if (chartInstance) {
      chartInstance.destroy()
    }

    chartInstance = new Chart(chartCanvas.value, {
      type: 'doughnut',
      data: props.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'var(--text-primary)',
              font: {
                family: "'Roboto', sans-serif",
              },
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: 'var(--bg-secondary)',
            titleColor: 'var(--text-primary)',
            bodyColor: 'var(--text-primary)',
            borderColor: 'var(--border)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
          },
        },
        cutout: '70%',
        radius: '90%',
        ...props.options,
      },
    })
  }
}

onMounted(initChart)
watch(() => props.data, initChart, { deep: true })
</script>

<style lang="scss" scoped>
.doughnut-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
