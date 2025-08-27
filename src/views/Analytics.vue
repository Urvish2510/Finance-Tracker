<template>
  <div class="analytics">
    <!-- Loading State -->
    <div v-if="loading" class="loading-section">
      <div class="loading-card">
        <div class="loading-spinner">⏳</div>
        <h3>Loading Analytics...</h3>
        <p>Processing your financial data...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">📊 Financial Analytics</h1>
          <p class="page-subtitle">Comprehensive insights and trends from your financial data</p>
          <p class="debug-info" style="font-size: 12px; color: #666; margin: 5px 0;">
            Debug: Loading={{ loading }}, Expenses={{ expenses.length }}, Categories={{ categories.length }}
          </p>
        </div>
        <div class="header-controls">
          <button 
            class="btn btn-secondary" 
            @click="refreshData" 
            :disabled="loading"
          >
            <span v-if="loading">🔄</span>
            <span v-else>↻</span>
            Refresh Data
          </button>
        </div>
      </div>

    <!-- Key Metrics Summary -->
    <div class="summary-section">
      <h2 class="section-title">📈 Key Metrics</h2>
      <div class="summary-grid">
        <div class="summary-card total-spent">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <h3>Total Spent</h3>
            <div class="card-value expense">{{ formatCurrency(analytics.currentPeriod?.totalSpent || 0) }}</div>
            <div class="card-change" :class="getChangeClass(analytics.changes?.spending?.direction)">
              {{ getSpendingTrendText() }}
            </div>
          </div>
        </div>

        <div class="summary-card daily-average">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <h3>Daily Average</h3>
            <div class="card-value">{{ formatCurrency(analytics.currentPeriod?.avgPerDay || 0) }}</div>
            <div class="card-change neutral">
              Based on {{ analytics.daysInPeriod || 0 }} days
            </div>
          </div>
        </div>

        <div class="summary-card top-category">
          <div class="card-icon">🏆</div>
          <div class="card-content">
            <h3>Top Category</h3>
            <div class="card-value">{{ getTopCategoryName() }}</div>
            <div class="card-change neutral">
              {{ getTopCategoryAmount() }}
            </div>
          </div>
        </div>

        <div class="summary-card total-transactions">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <h3>Transactions</h3>
            <div class="card-value">{{ analytics.currentPeriod?.transactionCount || 0 }}</div>
            <div class="card-change" :class="getChangeClass(analytics.changes?.transactions?.direction)">
              {{ getTransactionTrendText() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <h2 class="section-title">📊 Visual Analytics</h2>
      <div class="charts-grid">
        <!-- New Self-Contained Charts -->
        <div class="chart-item">
          <ExpensePieChartNew />
        </div>
        
        <div class="chart-item">
          <SpendingTrendChart />
        </div>
        
        <div class="chart-item full-width">
          <CategoryComparisonChart />
        </div>
      </div>
    </div>

    <!-- Enhanced Category Breakdown Section -->
    <div class="category-breakdown-section">
      <div class="section-header">
        <div>
          <h2 class="section-title">🏷️ Category Breakdown</h2>
          <p class="section-subtitle">Detailed analysis by category with smart insights</p>
        </div>
        <div class="section-controls">
          <select v-model="selectedPeriod" class="period-select">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <button @click="exportData" class="btn btn-secondary">
            📄 Export Data
          </button>
        </div>
      </div>
      
      <!-- Category Stats Overview -->
      <div v-if="analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0" class="category-stats-overview">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ analytics.categoryBreakdown.length }}</div>
            <div class="stat-label">Active Categories</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <div class="stat-value">{{ analytics.categoryBreakdown[0]?.name || 'N/A' }}</div>
            <div class="stat-label">Top Category</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-value">{{ formatCurrency((analytics.categoryBreakdown.reduce((sum, cat) => sum + cat.total, 0))) }}</div>
            <div class="stat-label">Total Spending</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-value">{{ formatCurrency((analytics.categoryBreakdown.reduce((sum, cat) => sum + cat.total, 0)) / analytics.categoryBreakdown.length) }}</div>
            <div class="stat-label">Avg per Category</div>
          </div>
        </div>
      </div>

      <!-- Enhanced Category Cards Grid -->
      <div v-if="analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0" class="category-cards-grid">
        <div 
          v-for="(category, index) in analytics.categoryBreakdown" 
          :key="category.id || category.name"
          class="category-card"
          :class="{ 'top-category': index === 0 }"
        >
          <div class="category-header">
            <div class="category-info">
              <span class="category-icon">{{ category.icon || '📊' }}</span>
              <div class="category-details">
                <h3 class="category-name">{{ category.name }}</h3>
                <div class="category-rank">Rank #{{ index + 1 }}</div>
              </div>
            </div>
            <div class="category-percentage">
              <span class="percentage-value">{{ category.percentage.toFixed(1) }}%</span>
            </div>
          </div>

          <div class="category-metrics">
            <div class="metric">
              <div class="metric-label">Total Spent</div>
              <div class="metric-value amount-negative">{{ formatCurrency(category.total) }}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Transactions</div>
              <div class="metric-value">{{ category.count }}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Average</div>
              <div class="metric-value">{{ formatCurrency(category.average) }}</div>
            </div>
          </div>

          <div class="category-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ 
                  width: category.percentage + '%',
                  backgroundColor: getCategoryColor(category.name, index)
                }"
              ></div>
            </div>
            <div class="progress-details">
              <span>{{ category.percentage.toFixed(1) }}% of total spending</span>
            </div>
          </div>

          <div class="category-trend">
            <span class="trend-indicator" :class="getTrendClass(category.trend?.direction)">
              {{ category.trend?.icon || '→' }} {{ category.trend?.text || 'Stable' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="no-category-data">
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>No Category Data Available</h3>
          <p>Start tracking your expenses by creating categories and adding transactions.</p>
          <div class="empty-actions">
            <router-link to="/categories" class="btn btn-primary">
              Create Categories
            </router-link>
            <router-link to="/expenses" class="btn btn-secondary">
              Add Expenses
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights Section -->
    <div class="insights-section">
      <div class="section-header">
        <h2 class="section-title">💡 Smart Insights</h2>
        <p class="section-subtitle">AI-powered financial recommendations</p>
      </div>
      
      <div class="insights-grid">
        <div v-for="insight in analytics.insights || []" :key="insight.id" class="insight-card card" :class="insight.type">
          <div class="insight-icon">{{ insight.icon }}</div>
          <div class="insight-content">
            <h4>{{ insight.title }}</h4>
            <p>{{ insight.description }}</p>
          </div>
          <div class="insight-action" v-if="insight.action">
            <router-link :to="insight.action.link" class="btn btn-sm btn-ghost">
              {{ insight.action.text }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    </div> <!-- End Main Content -->
  </div> <!-- End Analytics -->
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useGlobalStore } from '../composables/useGlobalStore.js'
import { useCurrency } from '../composables/useCurrency.js'
import ExpensePieChartNew from '../components/ExpensePieChart_New.vue'
import SpendingTrendChart from '../components/SpendingTrendChart.vue'
import CategoryComparisonChart from '../components/CategoryComparisonChart.vue'

// Composables
const { expenses, categories, loadExpenses, loadCategories } = useGlobalStore()
const { formatCurrency } = useCurrency()

// Reactive data
const loading = ref(false)
const analytics = ref({})
const selectedPeriod = ref('month')

// Computed properties for summary section
const categoryBreakdown = computed(() => analytics.value.categoryBreakdown || [])

// Helper function to get consistent colors for categories
const getCategoryColor = (categoryName, index) => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]
  return colors[index % colors.length]
}

const getTopCategory = () => {
  return analytics.value.topCategory || null
}

const getTopCategoryName = () => {
  const topCategory = analytics.value.topCategory
  if (!topCategory) return 'N/A'
  
  // Handle various data formats
  if (typeof topCategory.name === 'string') {
    return topCategory.name
  }
  
  // Fallback for any other format
  return 'N/A'
}

const getTopCategoryAmount = () => {
  const topCategory = analytics.value.topCategory
  if (!topCategory || !topCategory.total) return 'No data'
  
  return `${formatCurrency(topCategory.total)} spent`
}

// Simple refresh function for the page
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([loadExpenses(), loadCategories()])
    calculateAnalytics()
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    loading.value = false
  }
}

// Helper methods for CSS classes
const getChangeClass = (direction) => {
  switch(direction) {
    case 'increase': return 'trend-up'
    case 'decrease': return 'trend-down'
    default: return 'trend-neutral'
  }
}

const getTrendClass = (direction) => {
  switch(direction) {
    case 'positive': return 'trend-positive'
    case 'negative': return 'trend-negative'
    default: return 'trend-neutral'
  }
}

const getSpendingTrendText = () => {
  const change = analytics.value.changes?.spending
  if (!change) return 'No data available'
  
  if (change.direction === 'increase') {
    return `+${Math.abs(change.percentage).toFixed(1)}% vs previous period`
  } else if (change.direction === 'decrease') {
    return `-${Math.abs(change.percentage).toFixed(1)}% vs previous period`
  } else {
    return 'Stable vs previous period'
  }
}

const getTransactionTrendText = () => {
  const change = analytics.value.changes?.transactions
  if (!change) return 'No data available'
  
  if (change.direction === 'increase') {
    return `+${change.count} vs previous period`
  } else if (change.direction === 'decrease') {
    return `${change.count} vs previous period`
  } else {
    return 'Same as previous period'
  }
}

const insights = computed(() => analytics.value.insights || [])

const calculateAnalytics = () => {
  if (!expenses.value.length) {
    analytics.value = {
      currentPeriod: {
        totalSpent: 0,
        avgPerDay: 0,
        transactionCount: 0
      },
      topCategory: null,
      categoryBreakdown: [],
      insights: []
    }
    return
  }

  const now = new Date()
  let startDate

  // Calculate date range based on selected period
  switch (selectedPeriod.value) {
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
  const periodExpenses = expenses.value.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate >= startDate && expenseDate <= now
  })

  // Calculate basic metrics
  const totalSpent = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const transactionCount = periodExpenses.length
  const daysInPeriod = Math.max(1, Math.ceil((now - startDate) / (24 * 60 * 60 * 1000)))
  const avgPerDay = totalSpent / daysInPeriod

  // Calculate category breakdown
  const categoryTotals = {}
  periodExpenses.forEach((expense) => {
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

  const categoryBreakdown = Object.values(categoryTotals).map(category => ({
    ...category,
    average: category.total / category.count,
    percentage: totalSpent > 0 ? (category.total / totalSpent) * 100 : 0,
    trend: {
      direction: 'neutral',
      icon: '→',
      text: 'Stable'
    }
  })).sort((a, b) => b.total - a.total)

  // Find top category
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null

  analytics.value = {
    currentPeriod: {
      totalSpent,
      avgPerDay,
      transactionCount
    },
    topCategory,
    categoryBreakdown,
    daysInPeriod,
    changes: {
      spending: { direction: 'neutral', percentage: 0 },
      transactions: { direction: 'neutral', count: 0 }
    },
    insights: []
  }
}

const exportData = () => {
  // Generate CSV data from analytics
  let csv = 'Category,Transactions,Total Amount,Average,Percentage\n'
  
  if (analytics.value.categoryBreakdown) {
    analytics.value.categoryBreakdown.forEach(cat => {
      csv += `${cat.name},${cat.count},${cat.total.toFixed(2)},${cat.average.toFixed(2)},${cat.percentage.toFixed(1)}%\n`
    })
  }
  
  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `expense-analytics-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

// Watch for data changes
watch([expenses, categories], () => {
  calculateAnalytics()
})

// Watch for period changes
watch(selectedPeriod, () => {
  calculateAnalytics()
})

// Initialize
onMounted(async () => {
  console.log('Analytics: Component mounted')
  loading.value = true
  try {
    console.log('Analytics: Loading data...')
    await Promise.all([loadExpenses(), loadCategories()])
    console.log('Analytics: Data loaded, expenses:', expenses.value.length, 'categories:', categories.value.length)
    calculateAnalytics()
    console.log('Analytics: Analytics calculated:', analytics.value)
  } catch (error) {
    console.error('Error loading analytics data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Analytics Page Layout */
.analytics {
  padding: var(--space-6);
  max-width: var(--container-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* Loading State */
.loading-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--space-8);
  box-shadow: var(--card-shadow);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.loading-spinner {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-4);
  animation: spin 2s linear infinite;
}

.loading-card h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.loading-card p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: var(--font-size-base);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Page Header - Similar to Dashboard welcome card */
.page-header {
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-accent-600) 100%);
  color: var(--color-text-inverse);
  padding: var(--space-8);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-2) 0;
}

.page-subtitle {
  font-size: var(--font-size-base);
  margin: 0;
  opacity: 0.9;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.form-group label {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  opacity: 0.9;
}

.form-control {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
}

.form-control option {
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
}

.btn.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--color-text-inverse);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-all);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.btn.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sections */
.summary-section,
.charts-section,
.table-section,
.insights-section {
  margin-bottom: var(--space-2);
}

.section-title {
  margin: var(--space-5) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.section-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: var(--space-1) 0 0 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
  gap: var(--space-4);
}

.section-actions {
  display: flex;
  gap: var(--space-3);
}

/* Summary Grid - Exactly matching Dashboard */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-5);
}

.summary-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--space-6);
  box-shadow: var(--card-shadow);
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  transition: var(--transition-all);
  min-height: 120px;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-icon {
  font-size: var(--font-size-3xl);
  width: var(--size-2xl);
  height: var(--size-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-secondary);
  border-radius: var(--radius-xl);
  flex-shrink: 0;
  align-self: flex-start;
}

.card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-content h3 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
  line-height: var(--line-height-tight);
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.card-value.income {
  color: var(--color-success-600);
}

.card-value.expense {
  color: var(--color-error-600);
}

.card-value.positive {
  color: var(--color-success-600);
}

.card-value.negative {
  color: var(--color-error-600);
}

.card-change {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-change.neutral {
  color: var(--color-text-tertiary);
}

.card-change.positive {
  color: var(--color-success-600);
}

.card-change.negative {
  color: var(--color-error-600);
}

.card-change.trend-up {
  color: var(--color-error-600);
}

.card-change.trend-down {
  color: var(--color-success-600);
}

.card-change.trend-neutral {
  color: var(--color-text-tertiary);
}

/* Charts Section - Matching Dashboard style */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

.chart-item {
  background: transparent; /* Let child components handle their own styling */
}

.chart-item.full-width {
  grid-column: 1 / -1; /* Span full width */
}

.chart-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition: var(--transition-all);
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.chart-header {
  padding: var(--space-5) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--color-border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface-secondary);
}

.chart-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.chart-period {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background: var(--color-surface-tertiary);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  border: 1px solid var(--color-border-secondary);
  text-transform: capitalize;
}

.chart-container {
  padding: 0;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Override chart component styles to integrate with chart cards */
.chart-container :deep(.pie-chart-container),
.chart-container :deep(.monthly-chart-container) {
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  width: 100%;
  height: 320px;
  padding: var(--space-4);
}

.chart-placeholder {
  text-align: center;
  color: var(--color-text-tertiary);
  padding: var(--space-8);
}

.chart-placeholder .placeholder-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-3);
  display: block;
  opacity: 0.5;
}

.chart-placeholder p {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.help-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  opacity: 0.8;
}

/* Enhanced Category Breakdown Section */
.category-breakdown-section {
  margin-bottom: var(--space-8);
}

.section-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.period-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--input-radius);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  height: 40px;
  min-width: 140px;
}

.period-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-alpha);
}

/* Category Stats Overview */
.category-stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.stat-card {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  box-shadow: var(--card-shadow);
  transition: var(--transition-all);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  font-size: var(--font-size-xl);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-50);
  border-radius: var(--radius-full);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

/* Enhanced Category Cards Grid */
.category-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-5);
}

.category-card {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--space-5);
  box-shadow: var(--card-shadow);
  transition: var(--transition-all);
  position: relative;
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.category-card.top-category {
  border: 2px solid var(--color-primary);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.category-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.category-icon {
  font-size: var(--font-size-xl);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-secondary);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.category-details {
  flex: 1;
}

.category-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
}

.category-rank {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
}

.category-percentage {
  text-align: right;
}

.percentage-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.category-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: var(--color-surface-secondary);
  border-radius: var(--radius-md);
}

.metric {
  text-align: center;
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.category-progress {
  margin-bottom: var(--space-3);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-surface-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-2);
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: var(--transition-all);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-details {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
}

.category-trend {
  display: flex;
  justify-content: center;
}

.trend-indicator {
  font-size: var(--font-size-sm);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  text-transform: capitalize;
}

/* Empty State */
.no-category-data {
  margin-top: var(--space-6);
}

.empty-state {
  background: var(--color-surface-primary);
  border: 2px dashed var(--color-border-secondary);
  border-radius: var(--card-radius);
  padding: var(--space-10) var(--space-6);
  text-align: center;
}

.empty-icon {
  font-size: var(--font-size-6xl);
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.empty-state p {
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-6) 0;
  font-size: var(--font-size-base);
}

.empty-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}

.trend.trend-positive {
  background: var(--color-success-50);
  color: var(--color-success-600);
}

.trend.trend-negative {
  background: var(--color-error-50);
  color: var(--color-error-600);
}

.trend.trend-neutral {
  background: var(--color-surface-secondary);
  color: var(--color-text-tertiary);
}

/* No Data State - Dashboard style */
.no-data {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--space-10) var(--space-5);
  text-align: center;
  box-shadow: var(--card-shadow);
  margin-bottom: var(--space-4);
}

.no-data-icon {
  font-size: var(--font-size-6xl);
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.no-data p {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text-secondary);
}

/* Insights Section - Dashboard style */
.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-4);
}

.insight-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: var(--space-6);
  display: flex;
  gap: var(--space-4);
  border-left: 4px solid var(--color-border-secondary);
  transition: var(--transition-all);
}

.insight-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.insight-card.warning {
  border-left-color: var(--color-warning-500);
}

.insight-card.success {
  border-left-color: var(--color-success-500);
}

.insight-card.info {
  border-left-color: var(--color-primary);
}

.insight-icon {
  font-size: var(--font-size-xl);
  flex-shrink: 0;
  width: var(--size-lg);
  height: var(--size-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-secondary);
  border-radius: var(--radius-lg);
}

.insight-content {
  flex: 1;
}

.insight-content h4 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.insight-content p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.insight-action {
  flex-shrink: 0;
  align-self: flex-start;
}

.btn.btn-sm.btn-ghost {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-xs);
  background: transparent;
  border: 1px solid var(--color-border-primary);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: var(--transition-all);
  font-weight: var(--font-weight-medium);
}

.btn.btn-sm.btn-ghost:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  transform: translateY(-1px);
}

/* Responsive Design - Dashboard style */
@media (max-width: 768px) {
  .analytics {
    padding: var(--space-4);
    gap: var(--space-6);
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
    text-align: center;
  }

  .header-controls {
    justify-content: center;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-row {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .data-table {
    font-size: var(--font-size-sm);
  }

  .data-table th,
  .data-table td {
    padding: var(--space-3);
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }

  .section-controls {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .period-select {
    min-width: 120px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .form-group {
    flex-direction: column;
    align-items: stretch;
  }

  .summary-card {
    flex-direction: column;
    text-align: center;
    min-height: auto;
    padding: var(--space-5);
  }

  .card-icon {
    align-self: center;
    margin-bottom: var(--space-2);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .btn.btn-secondary {
    width: 100%;
    justify-content: center;
  }
}

/* Remove duplicate styles - using proper design system styles above */
</style>
