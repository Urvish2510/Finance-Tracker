<template>
  <div class="finance-tracker">
    <h2>💰 Personal Finance Tracker</h2>

    <!-- Summary Dashboard -->
    <div v-if="summary" class="summary-dashboard">
      <h3>📊 Financial Overview</h3>
      <div class="summary-cards">
        <div class="summary-card total">
          <h4>Total Expenses</h4>
          <p class="amount">₹{{ summary.totalExpenses.toFixed(2) }}</p>
        </div>
        <div class="summary-card count">
          <h4>Total Transactions</h4>
          <p class="count-number">{{ summary.expenseCount }}</p>
        </div>
        <div class="summary-card categories">
          <h4>Categories</h4>
          <p class="count-number">{{ Object.keys(summary.categoryBreakdown).length }}</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div v-if="summary && Object.keys(summary.categoryBreakdown).length > 0" class="charts-section">
      <h3>📈 Expense Analytics</h3>
      <div class="charts-container">
        <div class="chart-wrapper">
          <h4>Expenses by Category</h4>
          <ExpensePieChart :data="summary.categoryBreakdown" />
        </div>
        <div class="chart-wrapper">
          <h4>Monthly Trend</h4>
          <MonthlyChart :data="summary.monthlyTotals" />
        </div>
      </div>
    </div>

    <!-- Quick Add Expense -->
    <div class="quick-add-section">
      <h3>➕ Quick Add Expense</h3>
      <form @submit.prevent="addQuickExpense" class="quick-add-form">
        <div class="form-row">
          <div class="form-group">
            <label>Title:</label>
            <input v-model="quickExpense.title" type="text" placeholder="Enter expense title" required />
          </div>
          <div class="form-group">
            <label>Amount:</label>
            <input v-model="quickExpense.amount" type="number" step="0.01" placeholder="0.00" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Category:</label>
            <select v-model="quickExpense.category_id" required>
              <option value="">Select category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Date:</label>
            <input v-model="quickExpense.date" type="date" required />
          </div>
        </div>
        <div class="form-group">
          <label>Description:</label>
          <input v-model="quickExpense.description" type="text" placeholder="Optional description" />
        </div>
        <button type="submit" :disabled="expensesLoading">
          {{ expensesLoading ? 'Adding...' : 'Add Expense' }}
        </button>
      </form>
    </div>

    <!-- Categories Management -->
    <div class="categories-section">
      <h3>🏷️ Expense Categories</h3>
      
      <!-- Add Category Form -->
      <div class="add-form">
        <h4>Add New Category</h4>
        <form @submit.prevent="addNewCategory">
          <div class="form-row">
            <div class="form-group">
              <label>Name:</label>
              <input v-model="newCategory.name" type="text" required />
            </div>
            <div class="form-group">
              <label>Icon:</label>
              <input v-model="newCategory.icon" type="text" placeholder="🛍️" maxlength="2" />
            </div>
            <div class="form-group">
              <label>Color:</label>
              <input v-model="newCategory.color" type="color" />
            </div>
          </div>
          <button type="submit" :disabled="categoriesLoading">
            {{ categoriesLoading ? 'Adding...' : 'Add Category' }}
          </button>
        </form>
      </div>

      <!-- Categories List -->
      <div class="categories-list">
        <button @click="loadCategories" :disabled="categoriesLoading">
          {{ categoriesLoading ? 'Loading...' : 'Refresh Categories' }}
        </button>
        
        <div v-if="categoriesError" class="error">Error: {{ categoriesError }}</div>
        
        <div class="category-cards">
          <div v-for="category in categories" :key="category.id" class="category-card">
            <div class="category-header" :style="{ backgroundColor: category.color }">
              <span class="category-icon">{{ category.icon }}</span>
              <h5>{{ category.name }}</h5>
            </div>
            <div class="category-actions">
              <button @click="removeCategory(category.id)" class="delete-btn">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Expenses List -->
    <div class="expenses-section">
      <h3>💳 Recent Expenses</h3>
      
      <button @click="loadExpenses" :disabled="expensesLoading">
        {{ expensesLoading ? 'Loading...' : 'Refresh Expenses' }}
      </button>
      
      <div v-if="expensesError" class="error">Error: {{ expensesError }}</div>
      
      <div v-if="expenses.length === 0 && !expensesLoading" class="no-data">
        No expenses found. Add some expenses to get started.
      </div>
      
      <div v-else class="expense-cards">
        <div v-for="expense in expenses.slice(0, 10)" :key="expense.id" class="expense-card">
          <div class="expense-header">
            <div class="expense-category">
              <span class="category-icon">{{ getCategoryIcon(expense.category_id) }}</span>
              <span class="category-name">{{ getCategoryName(expense.category_id) }}</span>
            </div>
            <div class="expense-amount">₹{{ expense.amount.toFixed(2) }}</div>
          </div>
          <h5>{{ expense.title }}</h5>
          <p v-if="expense.description" class="expense-description">{{ expense.description }}</p>
          <div class="expense-footer">
            <small>{{ formatDate(expense.date) }}</small>
            <button @click="removeExpense(expense.id)" class="delete-btn">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useDatabase, useCategories, useExpenses } from '../composables/useDatabase.js'
import { useToast } from '../composables/useToast.js'
import ExpensePieChart from './ExpensePieChart.vue'
import MonthlyChart from './MonthlyChart.vue'

// Database connection
const { dbState } = useDatabase()
const { success, error: showError, warning } = useToast()

// Categories functionality
const { 
  categories, 
  loading: categoriesLoading, 
  error: categoriesError, 
  fetchCategories, 
  addCategory, 
  deleteCategory 
} = useCategories()

// Expenses functionality
const { 
  expenses, 
  loading: expensesLoading, 
  error: expensesError, 
  fetchExpenses, 
  addExpense, 
  deleteExpense,
  getExpenseSummary
} = useExpenses()

// Reactive data
const summary = ref(null)
const newCategory = reactive({
  name: '',
  icon: '📦',
  color: '#3498db'
})

const quickExpense = reactive({
  title: '',
  amount: '',
  category_id: '',
  date: new Date().toISOString().split('T')[0],
  description: ''
})

// Methods
const loadCategories = async () => {
  await fetchCategories()
}

const loadExpenses = async () => {
  await fetchExpenses()
}

const loadSummary = async () => {
  try {
    summary.value = await getExpenseSummary()
  } catch (error) {
    console.error('Failed to load summary:', error)
  }
}

const addNewCategory = async () => {
  try {
    await addCategory({ ...newCategory })
    newCategory.name = ''
    newCategory.icon = '📦'
    newCategory.color = '#3498db'
    success('Category added successfully!')
    await loadSummary() // Reload summary
  } catch (error) {
    showError('Failed to add category: ' + error.message)
  }
}

const addQuickExpense = async () => {
  try {
    await addExpense({ ...quickExpense })
    quickExpense.title = ''
    quickExpense.amount = ''
    quickExpense.category_id = ''
    quickExpense.date = new Date().toISOString().split('T')[0]
    quickExpense.description = ''
    success('Expense added successfully!')
    await loadSummary() // Reload summary
  } catch (error) {
    showError('Failed to add expense: ' + error.message)
  }
}

const removeCategory = async (id) => {
  if (confirm('Are you sure you want to delete this category? This will fail if there are expenses using this category.')) {
    try {
      await deleteCategory(id)
      success('Category deleted successfully!')
      await loadSummary() // Reload summary
    } catch (error) {
      showError('Failed to delete category: ' + error.message)
    }
  }
}

const removeExpense = async (id) => {
  if (confirm('Are you sure you want to delete this expense?')) {
    try {
      await deleteExpense(id)
      success('Expense deleted successfully!')
      await loadSummary() // Reload summary
    } catch (error) {
      showError('Failed to delete expense: ' + error.message)
    }
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : 'Unknown'
}

const getCategoryIcon = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.icon : '❓'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Load initial data
onMounted(async () => {
  // Wait a bit for database to connect
  setTimeout(async () => {
    if (dbState.connected) {
      await loadCategories()
      await loadExpenses()
      await loadSummary()
    }
  }, 1000)
})
</script>

<style scoped>
.finance-tracker {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.db-status {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 30px;
  border-left: 4px solid #ddd;
}

/* .db-status.connected {
  border-left-color: #4CAF50;
  background: #f0fff0;
} */

.db-status.error {
  border-left-color: #f44336;
  background: #fff0f0;
}

.success {
  color: #4CAF50;
  font-weight: bold;
}

.error {
  color: #f44336;
  font-weight: bold;
}

.warning {
  color: #ff9800;
  font-weight: bold;
}

.summary-dashboard {
  margin-bottom: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.summary-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.amount {
  font-size: 2em;
  font-weight: bold;
  margin: 10px 0;
}

.count-number {
  font-size: 1.8em;
  font-weight: bold;
  margin: 10px 0;
}

.charts-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 20px;
}

.chart-wrapper {
  text-align: center;
}

.quick-add-section, .categories-section, .expenses-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.quick-add-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.add-form {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button {
  background: #2196F3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #1976D2;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.delete-btn {
  background: #f44336;
  font-size: 12px;
  padding: 5px 10px;
}

.delete-btn:hover {
  background: #d32f2f;
}

.category-cards, .expense-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.category-card, .expense-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.category-header {
  padding: 15px;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-icon {
  font-size: 1.2em;
}

.category-actions {
  padding: 10px;
}

.expense-card {
  padding: 15px;
}

.expense-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.expense-category {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9em;
  color: #666;
}

.expense-amount {
  font-weight: bold;
  color: #e74c3c;
  font-size: 1.1em;
}

.expense-description {
  color: #666;
  font-size: 0.9em;
  margin: 10px 0;
}

.expense-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
  margin: 20px 0;
}

@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .quick-add-form .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
