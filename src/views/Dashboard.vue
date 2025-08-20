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
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-card">
          <h2>👋 Welcome Back!</h2>
          <p>Here's your financial overview for today</p>
          <div class="current-date">{{ currentDate }}</div>
        </div>
      </div>

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
import {
  useExpenses,
  useCategories,
  useDatabase,
} from "../composables/useDatabase.js";
import { useCurrency } from "../composables/useCurrency.js";
import { useToast } from "../composables/useToast.js";
import { apiService } from "../services/apiService.js";

// Use composables
const { expenses, fetchExpenses } = useExpenses();
const { categories, fetchCategories } = useCategories();
const { apiAvailable, connectionError, connectionLoading, retryConnection } = useDatabase();
const { formatCurrency, loadSettings } = useCurrency();
const { success, error: showError, info } = useToast();

// Local state
const loading = ref(true);
const dashboardSummary = ref({});
const deposits = ref([]);

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

// Fetch deposits
const fetchDeposits = async () => {
  try {
    const response = await apiService.get("/deposits");
    // API returns the array directly
    deposits.value = Array.isArray(response) ? response : [];
    console.log('Fetched deposits:', deposits.value.length, 'deposits');
  } catch (err) {
    console.error("Error fetching deposits:", err);
    // Don't throw error as it's not critical for dashboard
  }
};

// Get dashboard summary including deposits
const getDashboardSummaryWithDeposits = async () => {
  try {
    // Calculate basic summary from local data
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

    console.log('Dashboard Summary Debug:', {
      depositsCount: deposits.value.length,
      totalDeposits,
      monthlyDeposits,
      totalExpenses,
      monthlyExpenses
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
      currentMonth: {
        total: monthlyExpenses,
        count: expenses.value.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        }).length,
        average: 0
      },
      previousMonth: {
        total: 0,
        count: 0,
        average: 0
      },
      thisWeek: {
        count: 0
      },
      previousWeek: {
        count: 0
      },
      depositChange: {
        percentage: 0,
      },
    };
  } catch (err) {
    console.error("Error getting dashboard summary:", err);
    const fallbackTotalDeposits = deposits.value.reduce(
      (sum, deposit) => sum + deposit.amount,
      0
    );
    
    console.log('Using fallback summary with deposits:', fallbackTotalDeposits);
    
    return {
      totalExpenses: expenses.value.reduce((sum, expense) => sum + expense.amount, 0),
      totalDeposits: fallbackTotalDeposits,
      transactionCount: expenses.value.length + deposits.value.length,
      categoriesCount: categories.value.length,
      avgExpense: 0,
      monthlyChange: { percentage: 0, direction: 'stable', amount: 0 },
      weeklyTransactionChange: { count: 0, direction: 'stable' },
      avgExpenseChange: { percentage: 0, direction: 'stable', amount: 0 },
      depositChange: { percentage: 0 },
    };
  }
};

// Error handling
const handleRetryConnection = async () => {
  loading.value = true;
  
  try {
    info("Attempting to reconnect to server...");
    const success_result = await retryConnection();
    if (success_result) {
      await loadData();
      success("Successfully connected to server!");
    } else {
      showError("Failed to connect to server. Please check if the backend is running.");
    }
  } catch (err) {
    showError(`Connection failed: ${err.message}`);
  } finally {
    loading.value = false;
  }
};

// Load data
const loadData = async () => {
  try {
    console.log('🔄 Loading dashboard data...');
    
    // Load currency settings first
    await loadSettings();

    // Fetch all data in parallel
    await Promise.all([fetchExpenses(), fetchCategories(), fetchDeposits()]);

    // Get dashboard summary with calculations including deposits
    const summary = await getDashboardSummaryWithDeposits();
    console.log('✅ Final dashboard summary:', summary);

    dashboardSummary.value = summary;
  } catch (err) {
    console.error("❌ Error loading dashboard data:", err);
    // Show a toast but don't block the UI
    showError(`Failed to load some dashboard data: ${err.message}`);
    
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
  
  try {
    // Wait for connection loading to complete if still in progress
    if (connectionLoading.value) {
      console.log('⏳ Waiting for connection to establish...');
      // Watch for connection loading to complete
      const unwatch = watch(connectionLoading, (newLoading) => {
        if (!newLoading) {
          unwatch();
          initializeDashboard();
        }
      });
    } else {
      // Connection check already completed
      await initializeDashboard();
    }
  } catch (err) {
    console.error('❌ Dashboard initialization error:', err);
    // Don't show error UI, just log it and show fallback data
    showError('Dashboard initialization failed, showing fallback data');
  } finally {
    loading.value = false;
  }
});

const initializeDashboard = async () => {
  console.log('🚀 Initializing dashboard...');
  
  if (apiAvailable.value) {
    console.log('✅ API available, loading data...');
    await loadData();
  } else {
    console.log('⚠️ API not available, showing empty state');
    // Don't show error, just initialize with empty data
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

console.log("Dashboard loaded successfully!");
</script>

<style scoped>
.dashboard {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.welcome-section {
  margin-bottom: 8px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
}

.welcome-card p {
  margin: 0 0 16px 0;
  opacity: 0.9;
  font-size: 16px;
}

.current-date {
  font-size: 14px;
  opacity: 0.8;
  font-weight: 500;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 12px;
  flex-shrink: 0;
}

.card-content h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.card-value.income {
  color: #16a34a;
}

.card-value.expense {
  color: #dc2626;
}

.card-value.positive {
  color: #16a34a;
}

.card-value.negative {
  color: #dc2626;
}

.card-change {
  font-size: 12px;
  font-weight: 500;
}

.card-change.positive {
  color: #dc2626;
}

.card-change.negative {
  color: #16a34a;
}

.card-change.neutral {
  color: #64748b;
}

.quick-actions h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  text-decoration: none;
}

.action-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 10px;
  flex-shrink: 0;
}

.action-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.action-content p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.recent-activity h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.activity-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}

.activity-item:hover {
  background: #f8fafc;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 8px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.activity-content p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.activity-amount {
  font-size: 16px;
  font-weight: 700;
  color: #dc2626;
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 8px 0;
  color: #64748b;
}

.empty-subtitle {
  font-size: 14px;
  opacity: 0.8;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: color 0.2s;
}

.view-all-btn:hover {
  color: #2563eb;
  text-decoration: none;
}

.charts-section h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-header {
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.chart-header h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.chart-header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.chart-container {
  padding: 40px 20px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #64748b;
}

.placeholder-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.chart-placeholder p {
  margin: 0 0 12px 0;
  font-size: 14px;
}

.chart-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
}

.chart-link:hover {
  text-decoration: underline;
}

.loading-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 24px;
}

.loading-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.loading-spinner {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-spinner {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-card h3 {
  margin: 0 0 12px 0;
  color: #1e293b;
  font-size: 24px;
}

.loading-card p {
  margin: 0 0 20px 0;
  color: #64748b;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
    gap: 24px;
  }

  .welcome-card {
    padding: 24px;
  }

  .welcome-card h2 {
    font-size: 24px;
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
    font-size: 24px;
  }
}
</style>
