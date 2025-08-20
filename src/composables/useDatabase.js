import { ref, computed } from 'vue'
import { CategoryService, ExpenseService, checkApiHealth } from '../services/apiService.js'

// Global state management
const categories = ref([])
const expenses = ref([])
const loading = ref(false)
const error = ref(null)
const apiAvailable = ref(false)
const connectionError = ref(null)
const connectionLoading = ref(true) // Add loading state for initial connection

// Service instances
const categoryService = new CategoryService()
const expenseService = new ExpenseService()

// Check API availability on startup
const initializeAPI = async () => {
  connectionLoading.value = true
  try {
    apiAvailable.value = await checkApiHealth()
    connectionError.value = null
    if (!apiAvailable.value) {
      const errorMessage = 'API server is not responding. Please check if the backend server is running.'
      connectionError.value = errorMessage
      console.error('❌ API not available - backend server may not be running')
    } else {
      console.log('✅ API connection established')
    }
  } catch (error) {
    console.error('❌ API health check failed:', error.message)
    apiAvailable.value = false
    connectionError.value = `Failed to connect to API: ${error.message}`
  } finally {
    connectionLoading.value = false
  }
}

// Initialize API check
initializeAPI()

// Categories composable
export function useCategories() {
  const categoriesLoading = ref(false)
  const categoriesError = ref(null)

  const fetchCategories = async () => {
    // Auto-retry connection if not available
    if (!apiAvailable.value && !connectionLoading.value) {
      console.log('🔄 API not available, attempting to reconnect...')
      await initializeAPI()
    }

    if (!apiAvailable.value) {
      const errorMessage = connectionError.value || 'API server is not available'
      categoriesError.value = errorMessage
      throw new Error(errorMessage)
    }

    categoriesLoading.value = true
    categoriesError.value = null
    
    try {
      const data = await categoryService.getAllCategories()
      categories.value = data
      return categories.value
    } catch (err) {
      console.error('Failed to fetch categories:', err.message)
      categoriesError.value = err.message
      throw err
    } finally {
      categoriesLoading.value = false
    }
  }

  const addCategory = async (categoryData) => {
    if (!apiAvailable.value) {
      const errorMessage = connectionError.value || 'API server is not available'
      throw new Error(errorMessage)
    }

    try {
      const newCategory = await categoryService.createCategory(categoryData)
      categories.value.push(newCategory)
      return newCategory
    } catch (err) {
      console.error('Failed to add category:', err)
      throw err
    }
  }

  const updateCategory = async (id, categoryData) => {
    if (!apiAvailable.value) {
      const errorMessage = connectionError.value || 'API server is not available'
      throw new Error(errorMessage)
    }

    try {
      const updatedCategory = await categoryService.updateCategory(id, categoryData)
      const index = categories.value.findIndex(cat => cat._id === id)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }
      return updatedCategory
    } catch (err) {
      console.error('Failed to update category:', err)
      throw err
    }
  }

  const deleteCategory = async (id) => {
    if (!apiAvailable.value) {
      const errorMessage = connectionError.value || 'API server is not available'
      throw new Error(errorMessage)
    }

    try {
      await categoryService.deleteCategory(id)
      categories.value = categories.value.filter(cat => cat._id !== id)
      return true
    } catch (err) {
      console.error('Failed to delete category:', err)
      throw err
    }
  }

  return {
    categories: computed(() => categories.value),
    loading: computed(() => categoriesLoading.value),
    error: computed(() => categoriesError.value),
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
  }
}

// Expenses composable
export function useExpenses() {
  const expensesLoading = ref(false)
  const expensesError = ref(null)

  const fetchExpenses = async () => {
    // Auto-retry connection if not available
    if (!apiAvailable.value && !connectionLoading.value) {
      console.log('🔄 API not available, attempting to reconnect...')
      await initializeAPI()
    }

    if (!apiAvailable.value) {
      const errorMessage = connectionError.value || 'API server is not available'
      expensesError.value = errorMessage
      throw new Error(errorMessage)
    }

    expensesLoading.value = true
    expensesError.value = null
    
    try {
      const data = await expenseService.getAllExpenses()
      expenses.value = data
      return expenses.value
    } catch (err) {
      console.error('Failed to fetch expenses:', err.message)
      expensesError.value = err.message
      throw err
    } finally {
      expensesLoading.value = false
    }
  }

  const addExpense = async (expenseData) => {
    if (!apiAvailable.value) {
      const errorMessage = connectionError.value || 'API server is not available'
      throw new Error(errorMessage)
    }

    try {
      const newExpense = await expenseService.createExpense(expenseData)
      expenses.value.unshift(newExpense)
      return newExpense
    } catch (err) {
      console.error('Failed to add expense:', err)
      throw err
    }
  }

  const updateExpense = async (id, expenseData) => {
    if (!apiAvailable.value) {
      const errorMessage = connectionError.value || 'API server is not available'
      throw new Error(errorMessage)
    }

    try {
      const updatedExpense = await expenseService.updateExpense(id, expenseData)
      const index = expenses.value.findIndex(exp => exp._id === id)
      if (index !== -1) {
        expenses.value[index] = updatedExpense
      }
      return updatedExpense
    } catch (err) {
      console.error('Failed to update expense:', err)
      throw err
    }
  }

  const deleteExpense = async (id) => {
    if (!apiAvailable.value) {
      const errorMessage = connectionError.value || 'API server is not available'
      throw new Error(errorMessage)
    }

    try {
      await expenseService.deleteExpense(id)
      expenses.value = expenses.value.filter(exp => exp._id !== id)
      return true
    } catch (err) {
      console.error('Failed to delete expense:', err)
      throw err
    }
  }

  const getExpenseSummary = async () => {
    if (!apiAvailable.value) {
      const errorMessage = connectionError.value || 'API server is not available'
      throw new Error(errorMessage)
    }

    try {
      return await expenseService.getExpenseSummary()
    } catch (err) {
      console.error('Failed to get expense summary:', err)
      throw err
    }
  }

  const getExpensesByCategory = async (categoryId) => {
    if (!apiAvailable.value) {
      const errorMessage = connectionError.value || 'API server is not available'
      throw new Error(errorMessage)
    }

    try {
      return await expenseService.getExpensesByCategory(categoryId)
    } catch (err) {
      console.error('Failed to get expenses by category:', err)
      throw err
    }
  }

  const getExpensesByDateRange = async (startDate, endDate) => {
    if (!apiAvailable.value) {
      const errorMessage = connectionError.value || 'API server is not available'
      throw new Error(errorMessage)
    }

    try {
      return await expenseService.getExpensesByDateRange(startDate, endDate)
    } catch (err) {
      console.error('Failed to get expenses by date range:', err)
      throw err
    }
  }

  return {
    expenses: computed(() => expenses.value),
    loading: computed(() => expensesLoading.value),
    error: computed(() => expensesError.value),
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseSummary,
    getExpensesByCategory,
    getExpensesByDateRange
  }
}

// Main database composable - combines all functionality
export function useDatabase() {
  const initDatabase = async () => {
    try {
      // Initialize API availability
      await initializeAPI()
      console.log(`🚀 Database initialized - API ${apiAvailable.value ? 'connected' : 'disconnected'}`)
      
      if (!apiAvailable.value) {
        console.error('❌ Cannot initialize database - API server is not available')
        console.error('💡 Please ensure the backend server is running on http://localhost:5000')
        console.error('💡 Run "npm run server" to start the backend server')
      }
    } catch (error) {
      console.error('Failed to initialize database:', error)
    }
  }

  const getStatus = () => ({
    apiAvailable: apiAvailable.value,
    connectionError: connectionError.value,
    categoriesCount: categories.value.length,
    expensesCount: expenses.value.length
  })

  const retryConnection = async () => {
    console.log('🔄 Retrying API connection...')
    await initializeAPI()
    return apiAvailable.value
  }

  return {
    initDatabase,
    getStatus,
    retryConnection,
    // Re-export other composables
    useCategories,
    useExpenses,
    // Direct access to reactive state
    categories: computed(() => categories.value),
    expenses: computed(() => expenses.value),
    apiAvailable: computed(() => apiAvailable.value),
    connectionError: computed(() => connectionError.value),
    connectionLoading: computed(() => connectionLoading.value)
  }
}
