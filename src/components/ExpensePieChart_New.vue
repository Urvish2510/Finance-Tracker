<template>
  <div class="pie-chart-wrapper">
    <div class="chart-header">
      <h3 class="chart-title">💳 Spending by Category</h3>
    </div>
    
    <div class="pie-chart-container" ref="chartContainer">
      <div v-if="loading" class="chart-loading">
        <div class="loading-spinner"></div>
        <p>Loading chart data...</p>
      </div>
      <div v-else-if="!hasData" class="chart-empty">
        <div class="empty-icon">📊</div>
        <p>No expense data available</p>
        <p class="help-text">Add some expenses to see the breakdown</p>
      </div>
      <div v-else class="chart-canvas-wrapper">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>

    <div v-if="hasData" class="chart-legend">
      <div v-for="(item, index) in legendData" :key="item.name" class="legend-item">
        <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
        <span class="legend-label">{{ item.name }}</span>
        <span class="legend-value">{{ formatCurrency(item.total) }} ({{ item.percentage }}%)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useGlobalStore } from '../composables/useGlobalStore.js'
import { useCurrency } from '../composables/useCurrency.js'
import { useTheme } from '../composables/useTheme.js'
import Chart from 'chart.js/auto'

// Props
const props = defineProps({
  dateRange: {
    type: Object,
    required: true,
    default: () => ({
      startDate: new Date(0).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    })
  }
})

// Composables
const { expenses, categories, loadExpenses, loadCategories } = useGlobalStore()
const { formatCurrency } = useCurrency()
const { tokens, version } = useTheme()

// Template refs
const chartCanvas = ref(null)
const chartContainer = ref(null)

// Reactive state
const loading = ref(false)
let chartInstance = null
let creating = false

// Color palette
const colorPalette = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#d35400',
  '#27ae60', '#8e44ad', '#2980b9', '#c0392b', '#16a085'
]

// Computed properties
const filteredExpenses = computed(() => {
  if (!expenses.value.length || !props.dateRange) return []

  const startDate = new Date(props.dateRange.startDate)
  const endDate = new Date(props.dateRange.endDate)
  
  // Set end date to end of day for proper filtering
  endDate.setHours(23, 59, 59, 999)

  return expenses.value.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate >= startDate && expenseDate <= endDate
  })
})

const chartData = computed(() => {
  if (!filteredExpenses.value.length) return null

  const categoryTotals = {}
  
  filteredExpenses.value.forEach(expense => {
    let categoryName = 'Uncategorized'
    let categoryIcon = '📊'
    
    if (expense.category) {
      if (typeof expense.category === 'string') {
        categoryName = expense.category
      } else if (typeof expense.category === 'object' && expense.category.name) {
        categoryName = expense.category.name
        categoryIcon = expense.category.icon || '📊'
      } else {
        const categoryId = expense.category._id || expense.category.id || expense.category
        const category = categories.value.find(cat => cat._id === categoryId || cat.id === categoryId)
        if (category) {
          categoryName = category.name
          categoryIcon = category.icon || '📊'
        }
      }
    }
    
    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = {
        total: 0,
        count: 0,
        name: categoryName,
        icon: categoryIcon
      }
    }
    categoryTotals[categoryName].total += expense.amount
    categoryTotals[categoryName].count += 1
  })

  const sortedCategories = Object.values(categoryTotals).sort((a, b) => b.total - a.total)
  // Debug log (dev only)
  if (import.meta?.env?.DEV) {
    console.debug('[ExpensePieChart] categories:', sortedCategories.length, 'dateRange:', props.dateRange)
  }
  const totalAmount = sortedCategories.reduce((sum, cat) => sum + cat.total, 0)

  return sortedCategories.map((category, index) => ({
    ...category,
    color: colorPalette[index % colorPalette.length],
    percentage: ((category.total / totalAmount) * 100).toFixed(1)
  }))
})

const hasData = computed(() => chartData.value && chartData.value.length > 0)

const legendData = computed(() => chartData.value || [])

// Chart creation and management
const createChart = async () => {
  if (creating) return
  if (!chartCanvas.value || !hasData.value) return
  creating = true
  try {
    // Destroy any existing chart attached to this canvas (safety)
    const existing = Chart.getChart(chartCanvas.value)
    if (existing) existing.destroy()
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }

    // No need for nextTick here; canvas already in DOM
    const ctx = chartCanvas.value.getContext('2d')
    const data = chartData.value

  const t = tokens.value
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(item => item.name),
      datasets: [{
        data: data.map(item => item.total),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 2,
        hoverOffset: 8,
        cutout: '60%'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
      backgroundColor: t.tooltipBg,
      titleColor: t.tooltipTitle,
      bodyColor: t.tooltipBody,
      borderColor: t.tooltipBorder,
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: ${formatCurrency(value)} (${percentage}%)`
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 800
      }
    }
    })
  } finally {
    creating = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([loadExpenses(), loadCategories()])
  } catch (error) {
    console.error('Error loading chart data:', error)
  } finally {
    loading.value = false
  }
}

// Watchers
watch([chartData, () => chartCanvas.value], () => {
  if (chartCanvas.value && hasData.value) {
    createChart()
  }
}, { deep: true })

watch(() => props.dateRange, () => {
  if (hasData.value) {
    createChart()
  }
}, { deep: true })

// Lifecycle hooks
onMounted(async () => {
  await loadData()
  await nextTick()
  if (hasData.value) {
    createChart()
  }
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

// Theme updates
watch(version, () => {
  if (chartInstance) {
    const t = tokens.value
    const tt = chartInstance.options.plugins.tooltip
    tt.backgroundColor = t.tooltipBg
    tt.titleColor = t.tooltipTitle
    tt.bodyColor = t.tooltipBody
    tt.borderColor = t.tooltipBorder
    chartInstance.update('none')
  }
})
</script>

<style scoped>
.pie-chart-wrapper {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-surface-secondary);
}

.chart-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.period-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--input-radius);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.period-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-alpha);
}

.pie-chart-container {
  position: relative;
  height: 350px;
  padding: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-canvas-wrapper canvas {
  max-width: 300px !important;
  max-height: 300px !important;
}

.chart-loading,
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-primary);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.help-text {
  font-size: var(--font-size-sm);
  opacity: 0.7;
  margin: 0;
}

.chart-legend {
  padding: var(--space-4);
  border-top: 1px solid var(--color-border-primary);
  background: var(--color-surface-secondary);
  max-height: 200px;
  overflow-y: auto;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
}

.legend-item:not(:last-child) {
  border-bottom: 1px solid var(--color-border-primary);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  flex-grow: 1;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.legend-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

/* Responsive design */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: var(--space-3);
  }

  .pie-chart-container {
    height: 280px;
    padding: var(--space-3);
  }

  .chart-legend {
    max-height: 150px;
  }
}

@media (max-width: 480px) {
  .pie-chart-container {
    height: 250px;
    padding: var(--space-2);
  }

  .chart-title {
    font-size: var(--font-size-base);
  }
}
</style>
