<template>
  <div class="monthly-chart-container">
    <canvas ref="chartRef" width="400" height="300"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
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
  expenses: {
    type: Array,
    required: true
  },
  timePeriod: {
    type: String,
    default: 'all',
    validator: value => ['week', 'month', 'quarter', 'year', 'all'].includes(value)
  }
})

// Template refs
const chartRef = ref(null)
let chartInstance = null

// Computed property to filter and process expenses based on time period
const chartData = computed(() => {
  const data = {}
  
  if (props.expenses.length > 0) {
    // Filter expenses based on selected period
    const now = new Date()
    let startDate
    
    switch (props.timePeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        startDate = new Date(now.getFullYear() - 12, now.getMonth(), now.getDate()) // Last 12 months for 'all'
    }
    
    // Group expenses by month within the selected period
    const filteredExpenses = props.expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= startDate && expenseDate <= now
    })
    
    filteredExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date)
      let periodKey
      
      // Adjust grouping based on time period for better visualization
      if (props.timePeriod === 'week') {
        // Group by day for week view
        periodKey = expenseDate.toISOString().split('T')[0] // YYYY-MM-DD
      } else {
        // Group by month for other views
        periodKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`
      }
      
      if (!data[periodKey]) {
        data[periodKey] = 0
      }
      data[periodKey] += expense.amount
    })
  }
  
  return data
})

// Create chart
const createChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  if (!chartRef.value) return

  const ctx = chartRef.value.getContext('2d')
  
  // Sort entries chronologically
  const sortedEntries = Object.entries(chartData.value).sort(([a], [b]) => a.localeCompare(b))
  
  if (sortedEntries.length === 0) {
    // If no data, create an empty chart
    chartInstance = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: ['No Data'],
        datasets: [{
          label: 'No Expenses',
          data: [0],
          backgroundColor: 'rgba(200, 200, 200, 0.3)',
          borderColor: 'rgba(200, 200, 200, 0.8)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            display: false
          },
          x: {
            display: false
          }
        }
      }
    })
    return
  }

  // Format labels based on time period
  const labels = sortedEntries.map(([period]) => {
    if (props.timePeriod === 'week') {
      // For week view, show day labels
      const date = new Date(period)
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    } else {
      // For other views, show month labels
      const date = new Date(period + '-01')
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    }
  })
  const values = sortedEntries.map(([, amount]) => amount)

  chartInstance = new ChartJS(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: props.timePeriod === 'week' ? 'Daily Expenses' : 'Monthly Expenses',
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
watch(chartData, () => {
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
  padding: var(--space-4);
  background: var(--color-surface-primary);
  border-radius: var(--card-radius);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--card-shadow);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .monthly-chart-container {
    height: 200px;
    padding: var(--space-3);
  }
}

@media (max-width: 480px) {
  .monthly-chart-container {
    height: 180px;
    padding: var(--space-2);
  }
}
</style>
