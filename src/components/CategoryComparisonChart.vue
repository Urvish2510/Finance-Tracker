<template>
  <div class="category-chart-wrapper">
    <div class="chart-header">
      <h3 class="chart-title">🏷️ Category Comparison</h3>
      <div class="chart-controls">
        <select v-model="selectedPeriod" class="period-select">
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
        <select v-model="sortBy" class="sort-select">
          <option value="amount">💰 By Amount</option>
          <option value="count">📊 By Count</option>
          <option value="average">📈 By Average</option>
        </select>
      </div>
    </div>
    
    <div class="category-chart-container" ref="chartContainer">
      <canvas ref="chartCanvas" width="600" height="400"></canvas>
      <div v-if="loading" class="chart-loading">
        <div class="loading-spinner"></div>
        <p>Loading category data...</p>
      </div>
      <div v-else-if="!hasData" class="chart-empty">
        <div class="empty-icon">🏷️</div>
        <p>No category data available</p>
        <p class="help-text">Add expenses with categories to see comparison</p>
      </div>
    </div>

    <div v-if="hasData" class="category-stats">
      <div class="stats-header">
        <h4>Category Statistics</h4>
        <span class="stats-period">{{ periodText }}</span>
      </div>
      <div class="stats-grid">
        <div v-for="category in topCategories" :key="category.name" class="stat-item">
          <div class="stat-icon" :style="{ backgroundColor: category.color }">
            {{ category.icon }}
          </div>
          <div class="stat-content">
            <div class="stat-name">{{ category.name }}</div>
            <div class="stat-values">
              <span class="stat-amount">{{ formatCurrency(category.total) }}</span>
              <span class="stat-count">{{ category.count }} transactions</span>
              <span class="stat-avg">Avg: {{ formatCurrency(category.average) }}</span>
            </div>
          </div>
          <div class="stat-bar">
            <div 
              class="stat-bar-fill" 
              :style="{ 
                width: `${category.percentage}%`, 
                backgroundColor: category.color 
              }"
            ></div>
          </div>
        </div>
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

// Composables
const { expenses, categories, loadExpenses, loadCategories } = useGlobalStore()
const { formatCurrency } = useCurrency()
const { tokens, version } = useTheme()

// Template refs
const chartCanvas = ref(null)
const chartContainer = ref(null)

// Reactive state
const selectedPeriod = ref('month')
const sortBy = ref('amount')
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
const periodText = computed(() => {
  switch (selectedPeriod.value) {
    case 'week': return 'This Week'
    case 'month': return 'This Month'
    case 'quarter': return 'This Quarter'
    case 'year': return 'This Year'
    case 'all': return 'All Time'
    default: return 'Selected Period'
  }
})

const filteredExpenses = computed(() => {
  if (!expenses.value.length) return []

  const now = new Date()
  let startDate

   // Use rolling windows for consistency
   switch (selectedPeriod.value) {
     case 'week': // last 7 days
       startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
       break
     case 'month': // last 30 days
       startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
       break
     case 'quarter': // last 90 days
       startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
       break
     case 'year': // last 365 days
       startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
       break
     default:
       startDate = new Date(0) // All time
   }

  return expenses.value.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate >= startDate && expenseDate <= now
  })
})

const categoryData = computed(() => {
  if (!filteredExpenses.value.length) return []

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

  const categoriesArray = Object.values(categoryTotals).map((category, index) => ({
    ...category,
    average: category.total / category.count,
    color: colorPalette[index % colorPalette.length]
  }))

  // Sort based on selected criteria
  categoriesArray.sort((a, b) => {
    switch (sortBy.value) {
      case 'count':
        return b.count - a.count
      case 'average':
        return b.average - a.average
      case 'amount':
      default:
        return b.total - a.total
    }
  })

   if (import.meta?.env?.DEV) {
     console.debug('[CategoryComparisonChart] categories:', categoriesArray.length, 'period:', selectedPeriod.value, 'sortBy:', sortBy.value)
   }
  // Calculate percentages
  const maxValue = Math.max(...categoriesArray.map(cat => {
    switch (sortBy.value) {
      case 'count': return cat.count
      case 'average': return cat.average
      case 'amount':
      default: return cat.total
    }
  }))

  return categoriesArray.map(category => ({
    ...category,
    percentage: maxValue > 0 ? ((category[sortBy.value === 'amount' ? 'total' : sortBy.value] / maxValue) * 100) : 0
  }))
})

const hasData = computed(() => categoryData.value.length > 0)

const topCategories = computed(() => categoryData.value.slice(0, 8)) // Show top 8 categories

const chartData = computed(() => {
  if (!hasData.value) return null

  const data = topCategories.value
  let values, label

  switch (sortBy.value) {
    case 'count':
      values = data.map(cat => cat.count)
      label = 'Number of Transactions'
      break
    case 'average':
      values = data.map(cat => cat.average)
      label = 'Average Transaction Amount'
      break
    case 'amount':
    default:
      values = data.map(cat => cat.total)
      label = 'Total Amount'
      break
  }

  return {
    labels: data.map(cat => cat.name),
    data: values,
    colors: data.map(cat => cat.color),
    label
  }
})

// Chart creation and management
const createChart = async () => {
  if (creating) return
  if (!chartCanvas.value || !hasData.value) return
  creating = true
  try {
    const existing = Chart.getChart(chartCanvas.value)
    if (existing) existing.destroy()
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }

    const ctx = chartCanvas.value.getContext('2d')
    const data = chartData.value

    const t = tokens.value
    chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: data.label,
        data: data.data,
        backgroundColor: data.colors.map(color => color + '80'),
        borderColor: data.colors,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 60
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y', // Horizontal bars
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              if (sortBy.value === 'count') {
                return value.toString()
              }
              return formatCurrency(value)
            },
            color: t.textSecondary
          },
          grid: {
            color: t.grid,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: t.textSecondary,
            font: {
              size: 12
            }
          },
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
          backgroundColor: t.tooltipBg,
          titleColor: t.tooltipTitle,
          bodyColor: t.tooltipBody,
          borderColor: t.tooltipBorder,
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const category = topCategories.value[context.dataIndex]
              let value = context.parsed.x
              
              if (sortBy.value === 'count') {
                return `${category.name}: ${value} transactions`
              } else {
                return `${category.name}: ${formatCurrency(value)}`
              }
            }
          }
        }
      },
      animation: {
        duration: 800,
        easing: 'easeInOutQuart'
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
watch([categoryData, sortBy, () => chartCanvas.value], () => {
  if (chartCanvas.value && hasData.value) {
    createChart()
  }
}, { deep: true })

watch(selectedPeriod, () => {
  if (hasData.value) {
    createChart()
  }
})

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
    chartInstance.options.scales.x.ticks.color = t.textSecondary
    chartInstance.options.scales.x.grid.color = t.grid
    chartInstance.options.scales.y.ticks.color = t.textSecondary
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
.category-chart-wrapper {
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

.chart-controls {
  display: flex;
  gap: var(--space-2);
}

.period-select,
.sort-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--input-radius);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.period-select:focus,
.sort-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-alpha);
}

.category-chart-container {
  position: relative;
  height: 350px;
  padding: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
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

.category-stats {
  border-top: 1px solid var(--color-border-primary);
  background: var(--color-surface-secondary);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-4) var(--space-2);
}

.stats-header h4 {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.stats-period {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stats-grid {
  padding: 0 var(--space-4) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-height: 300px;
  overflow-y: auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--input-radius);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.stat-content {
  flex-grow: 1;
  min-width: 0;
}

.stat-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.stat-values {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-amount {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.stat-count,
.stat-avg {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stat-bar {
  width: 60px;
  height: 8px;
  background: var(--color-border-primary);
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Responsive design */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: var(--space-3);
  }

  .chart-controls {
    width: 100%;
    justify-content: space-between;
  }

  .period-select,
  .sort-select {
    flex: 1;
  }

  .category-chart-container {
    height: 280px;
    padding: var(--space-3);
  }

  .stat-item {
    flex-direction: column;
    text-align: center;
  }

  .stat-bar {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .category-chart-container {
    height: 250px;
    padding: var(--space-2);
  }

  .chart-title {
    font-size: var(--font-size-base);
  }

  .chart-controls {
    flex-direction: column;
  }
}
</style>
