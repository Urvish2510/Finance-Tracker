<template>
  <div class="pie-chart-container">
    <canvas ref="chartRef" width="400" height="400"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

// Props
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

// Template refs
const chartRef = ref(null)
let chartInstance = null

// Create chart
const createChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartRef.value.getContext('2d')
  
  const labels = Object.keys(props.data)
  const values = Object.values(props.data).map(item => item.total)
  const colors = Object.values(props.data).map(item => item.color)

  chartInstance = new ChartJS(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(color => color + '80'), // Add transparency
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: $${value.toFixed(2)} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

// Watch for data changes
watch(() => props.data, () => {
  createChart()
}, { deep: true })

// Create chart on mount
onMounted(() => {
  createChart()
})
</script>

<style scoped>
.pie-chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
