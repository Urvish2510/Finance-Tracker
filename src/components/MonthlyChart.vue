<template>
  <div class="monthly-chart-container">
    <canvas ref="chartRef" width="400" height="300"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

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
  
  // Sort months chronologically
  const sortedEntries = Object.entries(props.data).sort(([a], [b]) => a.localeCompare(b))
  const labels = sortedEntries.map(([month]) => {
    const date = new Date(month + '-01')
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  })
  const values = sortedEntries.map(([, amount]) => amount)

  chartInstance = new ChartJS(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monthly Expenses',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toFixed(0)
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Total: $' + context.parsed.y.toFixed(2)
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
.monthly-chart-container {
  position: relative;
  height: 250px;
  width: 100%;
}
</style>
