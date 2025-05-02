<template>
  <div class="line-chart-container">
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
      type: 'line',
      data: props.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'var(--text-primary)',
              font: {
                family: "'Roboto', sans-serif",
              },
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
            intersect: false,
            mode: 'index',
          },
        },
        scales: {
          x: {
            grid: {
              color: 'var(--border)',
              drawBorder: false,
            },
            ticks: {
              color: 'var(--text-secondary)',
              font: {
                family: "'Roboto', sans-serif",
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'var(--border)',
              drawBorder: false,
            },
            ticks: {
              color: 'var(--text-secondary)',
              font: {
                family: "'Roboto', sans-serif",
              },
              precision: 0,
            },
          },
        },
        elements: {
          line: {
            fill: 'start',
            tension: 0.4,
          },
        },
        ...props.options,
      },
    })
  }
}

onMounted(initChart)
watch(() => props.data, initChart, { deep: true })
</script>

<style lang="scss" scoped>
.line-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
