<template>
  <div class="dashboard">
    <!-- Loading State -->
    <div v-if="loading || connectionLoading" class="loading-section">
      <div class="loading-card">
        <div class="loading-spinner">⏳</div>
        <h3>{{ connectionLoading ? 'Connecting to Server...' : 'Loading Dashboard...' }}</h3>
        <p>{{ connectionLoading ? 'Establishing connection to the backend server...' : 'Fetching your financial data...' }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card total-deposits">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <h3>Total Income</h3>
            <div class="card-value income">
              {{ formatCurrency(dashboardSummary.totalDeposits || 0) }}
            </div>
            <div class="card-change positive">{{ depositChangeText }}</div>
          </div>
        </div>

        <div class="summary-card total-expenses">
          <div class="card-icon">�</div>
          <div class="card-content">
            <h3>Total Expenses</h3>
            <div class="card-value expense">
              {{ formatCurrency(dashboardSummary.totalExpenses || 0) }}
            </div>
            <div class="card-change" :class="monthlyChangeClass">
              {{ monthlyChangeText }}
            </div>
          </div>
        </div>

        <div class="summary-card net-balance">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <h3>Net Balance</h3>
            <div class="card-value" :class="netBalanceClass">
              {{ formatCurrency(netBalance) }}
            </div>
            <div class="card-change" :class="netBalanceClass">
              {{ netBalanceText }}
            </div>
          </div>
        </div>

        <div class="summary-card avg-expense">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <h3>Average Expense</h3>
            <div class="card-value">
              {{ formatCurrency(dashboardSummary.avgExpense || 0) }}
            </div>
            <div class="card-change" :class="avgExpenseChangeClass">
              {{ avgExpenseChangeText }}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div class="actions-grid">
          <router-link to="/expenses" class="action-card">
            <div class="action-icon">💳</div>
            <div class="action-content">
              <h4>Add Expense</h4>
              <p>Record a new expense</p>
            </div>
          </router-link>

          <router-link to="/deposits" class="action-card">
            <div class="action-icon">💰</div>
            <div class="action-content">
              <h4>Add Income</h4>
              <p>Record a new deposit</p>
            </div>
          </router-link>

          <router-link to="/settings" class="action-card">
            <div class="action-icon">⚙️</div>
            <div class="action-content">
              <h4>Settings</h4>
              <p>Configure your preferences</p>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h3>🕒 Recent Activity</h3>
        <div v-if="recentExpenses.length > 0" class="activity-list">
          <div
            v-for="expense in recentExpenses"
            :key="expense.id"
            class="activity-item"
          >
            <div class="activity-icon">{{ expense.icon }}</div>
            <div class="activity-content">
              <h4>{{ expense.title }}</h4>
              <p>{{ expense.category }} • {{ expense.date }}</p>
            </div>
            <div class="activity-amount">
              {{ formatCurrency(expense.amount) }}
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">📋</div>
          <p>No recent expenses found</p>
          <p class="empty-subtitle">Start by adding your first expense</p>
        </div>
        <router-link to="/expenses" class="view-all-btn">
          {{
            recentExpenses.length > 0
              ? "View All Expenses →"
              : "Add First Expense →"
          }}
        </router-link>
      </div>

      <!-- Error Demo (Development Only) -->
      <!-- <div class="debug-section" v-if="isDevelopment">
        <ErrorDemo />
      </div> -->

      <!-- Charts Placeholder -->
      <div class="charts-section">
        <div class="chart-row">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Expense Distribution</h3>
              <p>Breakdown by categories</p>
            </div>
            <div class="chart-container">
              <div class="chart-placeholder">
                <div class="placeholder-icon">📊</div>
                <p v-if="expenses.length === 0">
                  Add some expenses to see your spending distribution
                </p>
                <p v-else>Charts coming soon</p>
                <router-link to="/categories" class="chart-link"
                  >Manage Categories →</router-link
                >
              </div>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3>Monthly Trends</h3>
              <p>Spending over time</p>
            </div>
            <div class="chart-container">
              <div class="chart-placeholder">
                <div class="placeholder-icon">📈</div>
                <p v-if="expenses.length === 0">
                  Track expenses over time to see trends
                </p>
                <p v-else>Trend analysis coming soon</p>
                <router-link to="/expenses" class="chart-link"
                  >View Expenses →</router-link
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useGlobalStore } from "../composables/useGlobalStore.js";
import { useCurrency } from "../composables/useCurrency.js";

// Global Store
const {
  categories,
  expenses,
  deposits,
  isConnected,
  isLoading: connectionLoading,
  connectionError,
  loadCategories,
  loadExpenses,
  loadDeposits,
  initialize
} = useGlobalStore()

const { formatCurrency, loadSettings } = useCurrency();

// Local state
const loading = ref(true);
const dashboardSummary = ref({});

// Development mode flag
const isDevelopment = ref(import.meta.env.DEV);

// Computed properties
const currentDate = computed(() => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const recentExpenses = computed(() => {
  return expenses.value.slice(0, 3).map((expense) => ({
    id: expense._id,
    title: expense.title,
    amount: expense.amount,
    category: expense.category?.name || "Uncategorized",
    date: formatRelativeDate(expense.date),
    icon: expense.category?.icon || "📦",
  }));
});

// Net balance calculation
const netBalance = computed(() => {
  const totalIncome = dashboardSummary.value.totalDeposits || 0;
  const totalExpenses = dashboardSummary.value.totalExpenses || 0;
  return totalIncome - totalExpenses;
});

const netBalanceClass = computed(() => {
  return netBalance.value >= 0 ? "positive" : "negative";
});

const netBalanceText = computed(() => {
  const balance = netBalance.value;
  if (balance > 0) return "Positive balance";
  if (balance < 0) return "Budget deficit";
  return "Balanced";
});

const depositChangeText = computed(() => {
  const change = dashboardSummary.value.depositChange;
  if (!change) return "Track your income";

  if (change.percentage > 0)
    return `+${change.percentage.toFixed(1)}% from last month`;
  if (change.percentage < 0)
    return `${change.percentage.toFixed(1)}% from last month`;
  return "No change from last month";
});

// Dynamic change calculations based on dashboard summary
const monthlyChangeText = computed(() => {
  const change = dashboardSummary.value.monthlyChange;
  if (!change) return "No data available";

  if (change.percentage > 0)
    return `+${change.percentage.toFixed(1)}% from last month`;
  if (change.percentage < 0)
    return `${change.percentage.toFixed(1)}% from last month`;
  return "No change from last month";
});

const monthlyChangeClass = computed(() => {
  const change = dashboardSummary.value.monthlyChange;
  if (!change) return "neutral";

  if (change.percentage > 0) return "negative"; // More expenses = negative for budget
  if (change.percentage < 0) return "positive"; // Less expenses = positive for budget
  return "neutral";
});

const weeklyTransactionText = computed(() => {
  const change = dashboardSummary.value.weeklyTransactionChange;
  if (!change) return "No data available";

  if (change.count > 0) return `+${change.count} this week`;
  if (change.count < 0) return `${change.count} this week`;
  return "No change this week";
});

const weeklyTransactionClass = computed(() => {
  const change = dashboardSummary.value.weeklyTransactionChange;
  if (!change) return "neutral";

  if (change.count > 0) return "positive";
  if (change.count < 0) return "negative";
  return "neutral";
});

const avgExpenseChangeText = computed(() => {
  const change = dashboardSummary.value.avgExpenseChange;
  if (!change) return "No data available";

  if (change.percentage > 0)
    return `+${change.percentage.toFixed(1)}% from average`;
  if (change.percentage < 0)
    return `${change.percentage.toFixed(1)}% from average`;
  return "Same as average";
});

const avgExpenseChangeClass = computed(() => {
  const change = dashboardSummary.value.avgExpenseChange;
  if (!change) return "neutral";

  if (change.percentage > 0) return "negative"; // Higher avg expense = negative
  if (change.percentage < 0) return "positive"; // Lower avg expense = positive
  return "neutral";
});

// Helper function
const formatRelativeDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

// Get dashboard summary including deposits
const getDashboardSummary = () => {
  const totalDeposits = deposits.value.reduce(
    (sum, deposit) => sum + deposit.amount,
    0
  );
  
  const totalExpenses = expenses.value.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyDeposits = deposits.value
    .filter((deposit) => {
      const depositDate = new Date(deposit.date);
      return (
        depositDate.getMonth() === currentMonth &&
        depositDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, deposit) => sum + deposit.amount, 0);
    
  const monthlyExpenses = expenses.value
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  console.log('Dashboard Summary:', {
    depositsCount: deposits.value.length,
    totalDeposits,
    monthlyDeposits,
    totalExpenses,
    monthlyExpenses,
    categoriesCount: categories.value.length
  });

  return {
    totalExpenses,
    totalDeposits,
    depositsCount: deposits.value.length,
    monthlyDeposits,
    transactionCount: expenses.value.length + deposits.value.length,
    categoriesCount: categories.value.length,
    avgExpense: expenses.value.length > 0 ? totalExpenses / expenses.value.length : 0,
    monthlyChange: {
      percentage: 0, // Simplified - no comparison
      direction: 'stable',
      amount: 0
    },
    weeklyTransactionChange: {
      count: 0,
      direction: 'stable'
    },
    avgExpenseChange: {
      percentage: 0,
      direction: 'stable',
      amount: 0
    },
    depositChange: {
      percentage: 0,
    },
  };
};

// Load data
const loadData = async () => {
  try {
    console.log('🔄 Loading dashboard data...');
    
    // Load currency settings first
    await loadSettings();

    // Load all data (will use cache if fresh)
    await Promise.all([
      loadCategories(),
      loadExpenses(), 
      loadDeposits()
    ]);

    // Calculate dashboard summary
    dashboardSummary.value = getDashboardSummary();
    console.log('✅ Dashboard data loaded from global store');
  } catch (err) {
    console.error("❌ Error loading dashboard data:", err);
    
    // Set fallback data so the UI still works
    dashboardSummary.value = {
      totalExpenses: 0,
      totalDeposits: 0,
      transactionCount: 0,
      categoriesCount: 0,
      avgExpense: 0,
      monthlyChange: { percentage: 0, direction: 'stable', amount: 0 },
      weeklyTransactionChange: { count: 0, direction: 'stable' },
      avgExpenseChange: { percentage: 0, direction: 'stable', amount: 0 },
      depositChange: { percentage: 0 },
    };
  }
};

// Initialize data
onMounted(async () => {
  console.log('📱 Dashboard mounted');
  loading.value = true;
  
  try {
    // Ensure global store is initialized
    await initialize();
    
    // Load dashboard data
    await loadData();
  } catch (err) {
    console.error('❌ Dashboard initialization error:', err);
  } finally {
    loading.value = false;
  }
});

console.log("Dashboard loaded with global state management!");
</script>

<style scoped>
.dashboard {
  padding: var(--space-6);
  max-width: var(--container-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.current-date {
  font-size: var(--font-size-sm);
  opacity: 0.8;
  font-weight: var(--font-weight-medium);
}

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

.card-change.positive {
  color: var(--color-success-600);
}

.card-change.negative {
  color: var(--color-error-600);
}

.card-change.neutral {
  color: var(--color-text-tertiary);
}

.quick-actions h3 {
  margin: var(--space-5) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.action-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--space-6);
  text-decoration: none;
  color: inherit;
  box-shadow: var(--card-shadow);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  transition: var(--transition-all);
  min-height: 80px;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  text-decoration: none;
}

.action-icon {
  font-size: var(--font-size-2xl);
  width: var(--size-xl);
  height: var(--size-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-secondary);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.action-content h4 {
  margin: 0 0 var(--space-1) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.action-content p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.recent-activity h3 {
  margin: var(--space-5) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.activity-list {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  margin-bottom: var(--space-4);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-primary);
  transition: var(--transition-colors);
}

.activity-item:hover {
  background: var(--color-surface-secondary);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: var(--font-size-xl);
  width: var(--size-lg);
  height: var(--size-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-secondary);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  margin: 0 0 var(--space-1) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.activity-content p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.activity-amount {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-error-600);
}

.empty-state {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--space-10) var(--space-5);
  text-align: center;
  box-shadow: var(--card-shadow);
  margin-bottom: var(--space-4);
}

.empty-icon {
  font-size: var(--font-size-6xl);
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text-secondary);
}

.empty-subtitle {
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  transition: var(--transition-colors);
}

.view-all-btn:hover {
  color: var(--color-primary-700);
  text-decoration: none;
}

.charts-section h3 {
  margin: 0 0 var(--space-5) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

.chart-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.chart-header {
  padding: var(--space-5) var(--space-5) var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-primary);
}

.chart-header h3 {
  margin: 0 0 var(--space-1) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.chart-header p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.chart-container {
  padding: var(--space-10) var(--space-5);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: var(--color-text-secondary);
}

.placeholder-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-3);
}

.chart-placeholder p {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-sm);
}

.chart-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.chart-link:hover {
  text-decoration: underline;
}

.loading-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: var(--space-6);
}

.loading-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--space-10);
  box-shadow: var(--shadow-lg);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.loading-spinner {
  font-size: var(--font-size-6xl);
  margin-bottom: var(--space-4);
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-card h3 {
  margin: 0 0 var(--space-3) 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

.loading-card p {
  margin: 0 0 var(--space-5) 0;
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard {
    padding: var(--space-4);
    gap: var(--space-6);
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .chart-row {
    grid-template-columns: 1fr;
  }

  .card-value {
    font-size: var(--font-size-xl);
  }
  
  .summary-card {
    min-height: 100px;
    padding: var(--space-5);
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: var(--space-3);
  }

  .card-value {
    font-size: var(--font-size-lg);
  }
  
  .summary-card {
    min-height: 90px;
    padding: var(--space-4);
    gap: var(--space-3);
  }
  
  .card-icon {
    font-size: var(--font-size-2xl);
    width: var(--size-xl);
    height: var(--size-xl);
  }

  .chart-container {
    padding: var(--space-8) var(--space-4);
  }
}
</style>
