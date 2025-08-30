<template>
  <div class="trend-chart-wrapper">
    <div class="chart-header">
      <h3 class="chart-title">📈 Spending Trends</h3>
      <div class="chart-controls">
        <select v-model="chartType" class="chart-type-select">
          <option value="bar">📊 Bar Chart</option>
          <option value="line">📈 Line Chart</option>
          <option value="area">🏔️ Area Chart</option>
        </select>
      </div>
    </div>
    
    <div class="trend-chart-container" ref="chartContainer">
      <canvas ref="chartCanvas" width="600" height="300"></canvas>
      <div v-if="loading" class="chart-loading">
        <div class="loading-spinner"></div>
        <p>Loading trend data...</p>
      </div>
      <div v-else-if="!hasData" class="chart-empty">
        <div class="empty-icon">📈</div>
        <p>No spending data available</p>
        <p class="help-text">Add expenses over time to see trends</p>
      </div>
    </div>

    <div v-if="hasData" class="chart-summary">
      <div class="summary-item">
        <span class="summary-label">Total Period:</span>
        <span class="summary-value">{{ formatCurrency(totalAmount) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Average {{ periodLabel }}:</span>
        <span class="summary-value">{{ formatCurrency(averageAmount) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Highest {{ periodLabel }}:</span>
        <span class="summary-value">{{ formatCurrency(maxAmount) }}</span>
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
const { expenses, loadExpenses } = useGlobalStore()
const { formatCurrency } = useCurrency()
const { tokens, version } = useTheme()

// Template refs
const chartCanvas = ref(null)
const chartContainer = ref(null)

// Reactive state
const chartType = ref('bar')
const loading = ref(false)
let chartInstance = null
let creating = false

// Get period label based on date range duration
const periodLabel = computed(() => {
  if (!props.dateRange) return 'Period'
  
  const startDate = new Date(props.dateRange.startDate)
  const endDate = new Date(props.dateRange.endDate)
  const daysDiff = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000))
  
  if (daysDiff <= 7) return 'Day'
  if (daysDiff <= 31) return 'Day'  
  if (daysDiff <= 90) return 'Week'
  return 'Month'
})

const chartData = computed(() => {
  if (!expenses.value.length || !props.dateRange) return null

  const startDate = new Date(props.dateRange.startDate)
  const endDate = new Date(props.dateRange.endDate)
  
  // Set end date to end of day for proper filtering
  endDate.setHours(23, 59, 59, 999)

  // Determine grouping based on date range duration
  const daysDiff = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000))
  let groupBy = 'month'
  
  if (daysDiff <= 7) groupBy = 'day'
  else if (daysDiff <= 31) groupBy = 'day'
  else if (daysDiff <= 90) groupBy = 'week'
  else groupBy = 'month'

  // Filter expenses for the selected period
  const filteredExpenses = expenses.value.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate >= startDate && expenseDate <= endDate
  })

  if (!filteredExpenses.length) return null

  // Group expenses by time period
  const groupedData = {}
  
  filteredExpenses.forEach(expense => {
    const expenseDate = new Date(expense.date)
    let key

    switch (groupBy) {
      case 'day':
        key = expenseDate.toISOString().split('T')[0] // YYYY-MM-DD
        break
      case 'week':
        const weekStart = new Date(expenseDate)
        weekStart.setDate(expenseDate.getDate() - expenseDate.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
      default:
        key = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`
        break
    }

    if (!groupedData[key]) {
      groupedData[key] = 0
    }
    groupedData[key] += expense.amount
  })

  // Convert to sorted array
  const sortedEntries = Object.entries(groupedData).sort(([a], [b]) => a.localeCompare(b))
  
  // Generate labels and data
  const labels = sortedEntries.map(([key]) => {
    const date = groupBy === 'month' ? new Date(key + '-01') : new Date(key)
    
    switch (groupBy) {
      case 'day':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          ...(daysDiff <= 7 ? {} : { year: '2-digit' })
        })
      case 'week':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' (Week)'
      case 'month':
      default:
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    }
  })

  const data = sortedEntries.map(([, amount]) => amount)
  if (import.meta?.env?.DEV) {
    console.debug('[SpendingTrendChart] points:', labels.length, 'dateRange:', props.dateRange, 'groupBy:', groupBy)
  }
  return { labels, data, groupBy }
})

const hasData = computed(() => chartData.value && chartData.value.data.length > 0)

const totalAmount = computed(() => {
  if (!hasData.value) return 0
  return chartData.value.data.reduce((sum, amount) => sum + amount, 0)
})

const averageAmount = computed(() => {
  if (!hasData.value) return 0
  return totalAmount.value / chartData.value.data.length
})

const maxAmount = computed(() => {
  if (!hasData.value) return 0
  return Math.max(...chartData.value.data)
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
    const { labels, data } = chartData.value

  const t = tokens.value
  const baseConfig = {
    data: {
      labels,
      datasets: [{
        label: `Spending per ${periodLabel.value}`,
        data,
    borderColor: t.primary || '#3498db',
    backgroundColor: chartType.value === 'area' ? `${t.primary}1a` : `${t.primary}99`,
        borderWidth: 2,
        tension: 0.4,
        fill: chartType.value === 'area',
        pointRadius: chartType.value === 'line' ? 4 : 0,
        pointHoverRadius: chartType.value === 'line' ? 6 : 0,
    pointBackgroundColor: t.primary || '#3498db',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        ...(chartType.value === 'bar' && {
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 50
        })
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
              return formatCurrency(value)
            },
      color: t.textSecondary
          },
          grid: {
      color: t.grid,
            drawBorder: false
          }
        },
        x: {
          ticks: {
      color: t.textSecondary,
            maxRotation: 45
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
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
            }
          }
        }
      },
      animation: {
        duration: 800,
        easing: 'easeInOutQuart'
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
    }

    chartInstance = new Chart(ctx, {
      type: chartType.value === 'area' ? 'line' : chartType.value,
      ...baseConfig
    })
  } finally {
    creating = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    await loadExpenses()
  } catch (error) {
    console.error('Error loading chart data:', error)
  } finally {
    loading.value = false
  }
}

// Watchers
watch([chartData, chartType, () => chartCanvas.value], () => {
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

// Update chart colors when theme tokens change
watch(version, () => {
  if (chartInstance) {
    const t = tokens.value
    chartInstance.options.scales.x.ticks.color = t.textSecondary
    chartInstance.options.scales.y.ticks.color = t.textSecondary
    chartInstance.options.scales.y.grid.color = t.grid
    chartInstance.data.datasets[0].borderColor = t.primary
    chartInstance.data.datasets[0].pointBackgroundColor = t.primary
    if (chartType.value === 'area') {
      chartInstance.data.datasets[0].backgroundColor = `${t.primary}1a`
    } else if (chartType.value === 'bar') {
      chartInstance.data.datasets[0].backgroundColor = `${t.primary}99`
    }
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
.trend-chart-wrapper {
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
.chart-type-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--input-radius);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.period-select:focus,
.chart-type-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-alpha);
}

.trend-chart-container {
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

.chart-summary {
  display: flex;
  justify-content: space-around;
  padding: var(--space-4);
  border-top: 1px solid var(--color-border-primary);
  background: var(--color-surface-secondary);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.summary-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
}

.summary-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
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
  .chart-type-select {
    flex: 1;
  }

  .trend-chart-container {
    height: 280px;
    padding: var(--space-3);
  }

  .chart-summary {
    flex-direction: column;
    gap: var(--space-3);
  }

  .summary-item {
    flex-direction: row;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .trend-chart-container {
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
