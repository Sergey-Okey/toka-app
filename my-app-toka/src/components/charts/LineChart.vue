<template>
  <canvas ref="chartRef"></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  data: Object,
  options: Object,
})

const chartRef = ref(null)
let chartInstance = null

onMounted(() => {
  renderChart()
})

watch(
  () => props.data,
  () => {
    if (chartInstance) {
      chartInstance.data = props.data
      chartInstance.update()
    }
  },
  { deep: true }
)

const renderChart = () => {
  if (chartInstance) chartInstance.destroy()

  if (chartRef.value) {
    chartInstance = new Chart(chartRef.value, {
      type: 'line',
      data: props.data,
      options: props.options,
    })
  }
}
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 250px !important;
}
</style>
