<template>
  <div class="expenses-page">
    <!-- Quick Add Section -->
    <div class="quick-add-section">
      <div class="section-header">
        <h2>➕ Add New Expense</h2>
        <p>Record your spending to keep track of your finances</p>
      </div>
      
      <form @submit.prevent="addNewExpense" class="expense-form">
        <div class="form-row">
          <div class="form-group">
            <label>Expense Title *</label>
            <input 
              v-model="newExpense.title" 
              type="text" 
              placeholder="Enter expense description"
              required 
            />
          </div>
          
          <div class="form-group">
            <label>Amount *</label>
            <div class="amount-input-group">
              <span class="currency-symbol">{{ getCurrencySymbol() }}</span>
              <input 
                v-model="newExpense.amount" 
                type="number" 
                step="0.01" 
                placeholder="0.00"
                required 
              />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Category *</label>
            <select v-model="newExpense.category" required>
              <option value="">Select a category</option>
              <option v-for="category in categories" :key="category._id" :value="category._id">
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Date *</label>
            <input 
              v-model="newExpense.date" 
              type="date" 
              required 
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label>Description</label>
            <textarea 
              v-model="newExpense.description" 
              placeholder="Additional notes (optional)"
              rows="2"
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="add-btn" :disabled="loading">
            <span v-if="loading">⏳ Adding...</span>
            <span v-else>➕ Add Expense</span>
          </button>
          <button type="button" @click="clearForm" class="clear-btn">
            🗑️ Clear
          </button>
        </div>
      </form>
    </div>

    <!-- Expenses List -->
    <div class="expenses-list-section">
      <div class="section-header">
        <h2>📋 Your Expenses</h2>
        <p>Manage and track all your recorded expenses</p>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <label>Search:</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search expenses..."
            class="search-input"
          />
        </div>
        
        <div class="filter-group">
          <label>Category:</label>
          <select v-model="selectedCategory">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category._id" :value="category._id">
              {{ category.icon }} {{ category.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Expenses Table -->
      <div class="expenses-table-container">
        <div v-if="filteredExpenses.length === 0" class="no-expenses">
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <h3>No Expenses Found</h3>
            <p>Start by adding your first expense above!</p>
          </div>
        </div>
        
        <table v-else class="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in paginatedExpenses" :key="expense.id">
              <td>{{ formatDate(expense.date) }}</td>
              <td class="expense-title">{{ expense.title }}</td>
              <td>
                <span class="category-tag">
                  {{ getCategoryDisplay(expense) }}
                </span>
              </td>
              <td class="expense-amount">{{ formatCurrency(expense.amount) }}</td>
              <td class="expense-description">{{ expense.description || '-' }}</td>
              <td class="expense-actions">
                <button @click="editExpense(expense)" class="edit-btn">✏️</button>
                <button @click="handleDeleteExpense(expense._id)" class="delete-btn">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ← Previous
        </button>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }} 
          ({{ filteredExpenses.length }} expenses)
        </span>
        
        <button 
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useGlobalStore } from '../composables/useGlobalStore.js'
import { useCurrency } from '../composables/useCurrency.js'
import { useToast } from '../composables/useToast.js'

// Use global store
const { 
  categories, 
  expenses, 
  isLoading,
  loadCategories,
  loadExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  initialize 
} = useGlobalStore()

const { formatCurrency, getCurrencySymbol, loadSettings } = useCurrency()
const { success, error: showError, warning } = useToast()

const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// Form data
const newExpense = reactive({
  title: '',
  amount: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  description: ''
})

// Computed properties
const filteredExpenses = computed(() => {
  let filtered = expenses.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(expense => 
      expense.title.toLowerCase().includes(query) ||
      expense.description?.toLowerCase().includes(query)
    )
  }

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter(expense => 
      expense.category_id?.toString() === selectedCategory.value ||
      expense.category?._id?.toString() === selectedCategory.value
    )
  }

  // Sort by date (newest first)
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const totalPages = computed(() => {
  return Math.ceil(filteredExpenses.value.length / itemsPerPage)
})

const paginatedExpenses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredExpenses.value.slice(start, end)
})

// Methods
const addNewExpense = async () => {
  if (!newExpense.title || !newExpense.amount || !newExpense.category || !newExpense.date) {
    warning('Please fill in all required fields')
    return
  }

  loading.value = true
  try {
    const expenseData = {
      title: newExpense.title,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
      description: newExpense.description
    }
    
    await createExpense(expenseData)
    clearForm()
    success('Expense added successfully!')
  } catch (error) {
    showError(`Failed to add expense: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const clearForm = () => {
  newExpense.title = ''
  newExpense.amount = ''
  newExpense.category = ''
  newExpense.date = new Date().toISOString().split('T')[0]
  newExpense.description = ''
}

const editExpense = (expense) => {
  // For now, just populate the form
  newExpense.title = expense.title
  newExpense.amount = expense.amount.toString()
  newExpense.category = expense.category?._id || expense.category_id || ''
  newExpense.date = expense.date
  newExpense.description = expense.description || ''
  
  // Remove the original (simple edit approach)
  handleDeleteExpense(expense._id)
}

const handleDeleteExpense = async (id) => {
  if (confirm('Are you sure you want to delete this expense?')) {
    try {
      await deleteExpense(id)
      success('Expense deleted successfully!')
    } catch (error) {
      showError(`Failed to delete expense: ${error.message}`)
    }
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getCategoryDisplay = (expense) => {
  if (expense.category) {
    return `${expense.category.icon || '📦'} ${expense.category.name}`
  }
  return 'Uncategorized'
}

// Initialize
onMounted(async () => {
  console.log('📝 Expenses view mounted');
  
  try {
    // Ensure global store is initialized
    await initialize()
    
    // Load currency settings first
    await loadSettings()
    
    // Load data from global store (will use cache if fresh)
    await Promise.all([
      loadCategories(),
      loadExpenses()
    ])
    
    console.log('✅ Expenses view loaded from global store!')
  } catch (error) {
    console.error('❌ Error loading expenses data:', error)
    showError(`Failed to load data: ${error.message}. Please ensure the backend server is running and MongoDB is connected.`)
  }
})
</script>

<style scoped>
.expenses-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.section-header p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
}

.quick-add-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.expense-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.amount-input-group {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.amount-input-group:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.currency-symbol {
  padding: 12px 8px 12px 12px;
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  font-size: 16px;
  border-right: 1px solid #d1d5db;
}

.amount-input-group input {
  flex: 1;
  border: none;
  padding: 12px;
  font-size: 16px;
  border-radius: 0 8px 8px 0;
}

.amount-input-group input:focus {
  outline: none;
  box-shadow: none;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.add-btn,
.clear-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn {
  background: #3b82f6;
  color: white;
}

.add-btn:hover:not(:disabled) {
  background: #2563eb;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  background: #f3f4f6;
  color: #374151;
}

.clear-btn:hover {
  background: #e5e7eb;
}

.expenses-list-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.search-input,
.filter-group select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.expenses-table-container {
  overflow-x: auto;
}

.expenses-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.expenses-table th,
.expenses-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.expenses-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.expense-title {
  font-weight: 600;
  color: #1e293b;
}

.expense-amount {
  font-weight: 700;
  color: #dc2626;
  font-size: 16px;
}

.expense-description {
  color: #64748b;
  font-style: italic;
}

.category-tag {
  background: #f0f9ff;
  color: #0369a1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.expense-actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.edit-btn {
  background: #f0f9ff;
  color: #0369a1;
}

.edit-btn:hover {
  background: #e0f2fe;
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fee2e2;
}

.no-expenses {
  padding: 60px 20px;
  text-align: center;
}

.empty-state {
  max-width: 300px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-state p {
  margin: 0;
  color: #64748b;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #2563eb;
}

.page-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.page-info {
  color: #64748b;
  font-size: 14px;
}

@media (max-width: 768px) {
  .expenses-page {
    padding: 16px;
  }

  .quick-add-section,
  .expenses-list-section {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
    align-items: flex-start;
  }

  .expenses-table {
    font-size: 14px;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
