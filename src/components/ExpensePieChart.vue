<template>
  <div class="pie-chart-container">
    <canvas ref="chartRef" width="400" height="400"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
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
  expenses: {
    type: Array,
    required: true
  },
  categories: {
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

// Color palette for categories
const getCategoryColor = (categoryName, index) => {
  const colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#d35400',
    '#27ae60', '#8e44ad', '#2980b9', '#c0392b', '#16a085'
  ]
  return colors[index % colors.length]
}

// Computed property to filter and process expenses based on time period
const chartData = computed(() => {
  if (!props.expenses.length) return {}

  const now = new Date()
  let startDate

  // Calculate date range based on selected period
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
      startDate = new Date(0) // All time
  }

  // Filter expenses for the selected period
  const periodExpenses = props.expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate >= startDate && expenseDate <= now
  })

  // Calculate category breakdown
  const categoryTotals = {}
  periodExpenses.forEach((expense, index) => {
    // Handle both string and object category formats
    let categoryName = 'Uncategorized'
    let categoryIcon = '📊'
    
    if (expense.category) {
      if (typeof expense.category === 'string') {
        categoryName = expense.category
      } else if (typeof expense.category === 'object' && expense.category.name) {
        categoryName = expense.category.name
        categoryIcon = expense.category.icon || '📊'
      } else {
        // If it's an object but no name property, try to find the category by ID
        const categoryId = expense.category._id || expense.category.id || expense.category
        const category = props.categories.find(cat => cat._id === categoryId || cat.id === categoryId)
        if (category) {
          categoryName = category.name
          categoryIcon = category.icon || '📊'
        }
      }
    }
    
    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = {
        total: 0,
        color: getCategoryColor(categoryName, Object.keys(categoryTotals).length)
      }
    }
    categoryTotals[categoryName].total += expense.amount
  })

  return categoryTotals
})

// Create chart
const createChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  if (!chartRef.value) return

  const ctx = chartRef.value.getContext('2d')
  
  const labels = Object.keys(chartData.value)
  const values = Object.values(chartData.value).map(item => item.total)
  const colors = Object.values(chartData.value).map(item => item.color)

  if (labels.length === 0) {
    // If no data, create an empty chart with a message
    chartInstance = new ChartJS(ctx, {
      type: 'pie',
      data: {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e0e0e0'],
          borderColor: ['#cccccc'],
          borderWidth: 2
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
        }
      }
    })
    return
  }

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
watch(chartData, () => {
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
  padding: var(--space-4);
  background: var(--color-surface-primary);
  border-radius: var(--card-radius);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--card-shadow);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pie-chart-container {
    height: 250px;
    padding: var(--space-3);
  }
}

@media (max-width: 480px) {
  .pie-chart-container {
    height: 200px;
    padding: var(--space-2);
  }
}
</style>
