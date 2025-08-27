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
            <select v-model="newExpense.category" required @change="handleCategoryChange">
              <option value="">Select a category</option>
              <option value="__create_new__" class="create-new-option">➕ Create New Category</option>
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
        <div class="form-actions">
          <button @click="demoClick" class="add-btn" :disabled="loading">
            <span v-if="loading">⏳ Adding...</span>
            <span v-else>Demo Click</span>
          </button>
          <button type="button" @click="clearForm" class="clear-btn">
            🗑️ Clear
          </button>
        </div>
      </form>
    </div>

    <!-- Category Creation Modal -->
    <div v-if="showCategoryModal" class="category-modal-overlay">
      <div class="category-modal-container">
        <div class="category-modal-header">
          <h3>Create New Category</h3>
          <button class="close-btn" @click="closeCategoryModal">×</button>
        </div>
        <CategoryForm 
          v-model="newCategoryData" 
          :loading="creatingCategory"
          @submit="createNewCategory"
        />
      </div>
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
import CategoryForm from '../components/CategoryForm.vue'

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
  createCategory,
  initialize 
} = useGlobalStore()

const { formatCurrency, getCurrencySymbol, loadSettings } = useCurrency()
const { success, error: showError, warning } = useToast()

const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const showCategoryModal = ref(false)
const creatingCategory = ref(false)

// Form data
const newExpense = reactive({
  title: '',
  amount: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  description: ''
})

// Category creation data
const newCategoryData = reactive({
  name: '',
  type: 'expense',
  icon: '',
  color: '#FF6B6B'
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

const demoClick = async () => {
  success('Demo expense added successfully!')
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

const handleCategoryChange = () => {
  if (newExpense.category === '__create_new__') {
    newExpense.category = '' // Reset selection
    showCategoryModal.value = true
  }
}

const closeCategoryModal = () => {
  showCategoryModal.value = false
  // Reset form data
  newCategoryData.name = ''
  newCategoryData.type = 'expense'
  newCategoryData.icon = ''
  newCategoryData.color = '#FF6B6B'
}

const createNewCategory = async () => {
  if (!newCategoryData.name || !newCategoryData.icon) {
    warning('Please fill in all required fields')
    return
  }

  creatingCategory.value = true
  try {
    const categoryData = {
      name: newCategoryData.name,
      type: newCategoryData.type,
      icon: newCategoryData.icon,
      color: newCategoryData.color
    }
    
    const createdCategory = await createCategory(categoryData)
    success('Category created successfully!')
    
    // Select the newly created category in the expense form
    newExpense.category = createdCategory._id
    
    closeCategoryModal()
  } catch (error) {
    showError(`Failed to create category: ${error.message}`)
  } finally {
    creatingCategory.value = false
  }
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
  padding: var(--space-6);
  max-width: var(--container-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.section-header {
  margin-bottom: var(--space-6);
}

.section-header h2 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.section-header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.quick-add-section {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--space-8);
  box-shadow: var(--card-shadow);
}

.expense-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.form-group input,
.form-group select,
.form-group textarea {
  display: block;
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  transition: var(--transition-colors);
  height: var(--input-height-base);
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.form-group select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right var(--space-2) center;
  background-repeat: no-repeat;
  background-size: 16px 12px;
  padding-right: var(--space-8);
  cursor: pointer;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.amount-input-group {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  transition: var(--transition-colors);
  overflow: hidden;
}

.amount-input-group:focus-within {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.currency-symbol {
  padding: var(--input-padding-y) var(--space-2) var(--input-padding-y) var(--input-padding-x);
  background: var(--color-surface-secondary);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  border-right: 1px solid var(--color-border-primary);
}

.amount-input-group input {
  flex: 1;
  border: none;
  padding: var(--input-padding-y) var(--input-padding-x);
  font-size: var(--font-size-base);
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
}

.amount-input-group input:focus {
  outline: none;
  box-shadow: none;
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--button-padding-x-base) var(--button-padding-x-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-all);
  user-select: none;
  text-decoration: none;
  white-space: nowrap;
  height: var(--button-height-base);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.add-btn:hover:not(:disabled) {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--button-padding-x-base) var(--button-padding-x-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-all);
  user-select: none;
  text-decoration: none;
  white-space: nowrap;
  height: var(--button-height-base);
  background-color: var(--color-surface-secondary);
  color: var(--color-text-primary);
  border-color: var(--color-border-primary);
}

.clear-btn:hover:not(:disabled) {
  background-color: var(--color-surface-tertiary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.expenses-list-section {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--space-8);
  box-shadow: var(--card-shadow);
}

.filters {
  display: flex;
  gap: var(--space-5);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.filter-group label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.search-input,
.filter-group select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  transition: var(--transition-colors);
}

.search-input:focus,
.filter-group select:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.expenses-table-container {
  overflow-x: auto;
}

.expenses-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-surface-elevated);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.expenses-table th,
.expenses-table td {
  padding: var(--space-3) var(--space-4);
  text-align: left;
}

.expenses-table th {
  background: var(--color-surface-secondary);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.expense-title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.expense-amount {
  font-weight: var(--font-weight-bold);
  color: var(--color-error-600);
  font-size: var(--font-size-base);
}

.expense-description {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.category-tag {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-base);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  display: inline-block;
}

.expense-actions {
  display: flex;
  gap: var(--space-2);
}

.edit-btn,
.delete-btn {
  padding: var(--space-2);
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: var(--transition-colors);
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size-lg);
  height: var(--size-lg);
}

.edit-btn {
  background: var(--color-info-100);
  color: var(--color-info-700);
}

.edit-btn:hover {
  background: var(--color-info-200);
}

.delete-btn {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.delete-btn:hover {
  background: var(--color-error-200);
}

.no-expenses {
  padding: var(--space-16) var(--space-5);
  text-align: center;
}

.empty-state {
  max-width: 300px;
  margin: 0 auto;
}

.empty-icon {
  font-size: var(--font-size-6xl);
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.empty-state p {
  margin: 0;
  color: var(--color-text-secondary);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border-primary);
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--button-padding-x-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-all);
  user-select: none;
  text-decoration: none;
  white-space: nowrap;
  height: var(--button-height-sm);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.page-btn:hover:not(:disabled) {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.page-btn:disabled {
  background-color: var(--color-surface-secondary);
  color: var(--color-text-primary);
  border-color: var(--color-border-primary);
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

/* Category Modal Styles */
.category-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-overlay);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
}

.category-modal-container {
  background: var(--color-surface-elevated);
  padding: 0;
  border-radius: var(--card-radius);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl), 0 0 0 1px var(--color-border-focus);
  border: 1px solid var(--color-border-primary);
}

.category-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-surface-primary);
  border-radius: var(--card-radius) var(--card-radius) 0 0;
}

.category-modal-header h3 {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  cursor: pointer;
  color: var(--color-text-secondary);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  transition: var(--transition-colors);
}

.close-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

/* Create New Category Option Styling */
.form-group select option.create-new-option {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  background: var(--color-primary-50);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  border-top: 1px solid var(--color-border-secondary);
  margin-top: var(--space-1);
  width: auto !important;
  max-width: 100% !important;
}

.form-group select option.create-new-option:hover {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

/* Force dropdown options to fit within viewport */
@media (max-width: 768px) {
  .form-group select {
    max-width: calc(100vw - 2rem) !important;
  }
  
  .form-group select option {
    max-width: calc(100vw - 4rem) !important;
    word-break: break-word;
  }
  
  .form-group select option.create-new-option {
    max-width: calc(100vw - 4rem) !important;
    word-break: break-word;
  }
}

@media (max-width: 480px) {
  .form-group select {
    max-width: calc(100vw - 1rem) !important;
  }
  
  .form-group select option {
    max-width: calc(100vw - 2rem) !important;
    font-size: var(--font-size-sm) !important;
  }
  
  .form-group select option.create-new-option {
    max-width: calc(100vw - 2rem) !important;
    font-size: var(--font-size-sm) !important;
  }
}

/* Ensure consistent select option sizing */
.form-group select option {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  min-height: 2.5rem;
  width: auto;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Force dropdown to match select width */
.form-group {
  position: relative;
  overflow: hidden;
}

.form-group select {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

/* Alternative approach: Force option container width */
.form-group select:focus {
  width: 100% !important;
}

/* Specific width control for mobile browsers */
@supports (-webkit-appearance: none) {
  .form-group select {
    width: 100% !important;
    min-width: 0 !important;
  }
  
  .form-group select option {
    width: auto !important;
    max-width: 100% !important;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .expenses-page {
    padding: var(--space-4);
  }

  .quick-add-section,
  .expenses-list-section {
    padding: var(--space-5);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
    align-items: flex-start;
  }

  .expenses-table {
    font-size: var(--font-size-sm);
  }

  .pagination {
    flex-direction: column;
    gap: var(--space-3);
  }

  /* Improve select options on mobile */
  .form-group select {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .form-group select option {
    padding: var(--space-3) var(--space-4);
    font-size: var(--font-size-base);
    min-height: 3rem;
    width: auto;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .form-group select option.create-new-option {
    padding: var(--space-3) var(--space-4);
    font-size: var(--font-size-base);
    width: auto;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .category-modal-container {
    width: 95%;
    margin: var(--space-4);
  }
}

@media (max-width: 480px) {
  .expenses-page {
    padding: var(--space-3);
  }

  .quick-add-section,
  .expenses-list-section {
    padding: var(--space-4);
  }

  .section-header h2 {
    font-size: var(--font-size-xl);
  }

  .form-actions {
    flex-direction: column;
  }

  .expenses-table {
    font-size: var(--font-size-xs);
  }

  .expenses-table th,
  .expenses-table td {
    padding: var(--space-2) var(--space-3);
  }

  /* Better select styling on small screens */
  .form-group select {
    font-size: var(--font-size-base);
    padding: var(--space-3) var(--space-8) var(--space-3) var(--space-4);
    height: 3rem;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .form-group select option {
    padding: var(--space-4);
    font-size: var(--font-size-base);
    line-height: 1.5;
    width: auto;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .form-group select option.create-new-option {
    padding: var(--space-4);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    width: auto;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
