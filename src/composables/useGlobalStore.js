// Global State Management for Finance Tracker
// Centralized store using Vue 3 Composition API with persistence and caching

import { ref, reactive, computed, watch, readonly } from 'vue'
import { useToast } from './useToast.js'
import { CategoryService, ExpenseService, DepositService, SettingsService, checkApiHealth } from '../services/apiService.js'

// Global state
const state = reactive({
  // API Connection
  apiStatus: {
    isConnected: false,
    isLoading: true,
    error: null,
    lastChecked: null,
    retryCount: 0
  },
  
  // Categories
  categories: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
    isDirty: false
  },
  
  // Expenses
  expenses: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
    isDirty: false
  },
  
  // Deposits
  deposits: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
    isDirty: false
  },
  
  // Settings
  settings: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
    isDirty: false
  },
  
  // App State
  app: {
    initialized: false,
    theme: 'light',
    currency: 'INR',
    locale: 'en-IN'
  }
})

// Service instances
const services = {
  categories: new CategoryService(),
  expenses: new ExpenseService(),
  deposits: new DepositService(),
  settings: new SettingsService()
}

// Cache configuration
const CACHE_DURATION = {
  categories: 10 * 60 * 1000,   // 10 minutes
  expenses: 5 * 60 * 1000,      // 5 minutes
  deposits: 10 * 60 * 1000,     // 10 minutes
  settings: 30 * 60 * 1000,     // 30 minutes
  apiHealth: 2 * 60 * 1000      // 2 minutes
}

// Local storage keys
const STORAGE_KEYS = {
  categories: 'finance_tracker_categories',
  expenses: 'finance_tracker_expenses',
  deposits: 'finance_tracker_deposits',
  settings: 'finance_tracker_settings',
  apiStatus: 'finance_tracker_api_status',
  appState: 'finance_tracker_app_state'
}

// Utility functions
const isDataFresh = (lastFetched, duration) => {
  if (!lastFetched) return false
  return Date.now() - new Date(lastFetched).getTime() < duration
}

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

const loadFromStorage = (key) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
    return null
  }
}

// API Connection Management
const checkConnection = async (force = false) => {
  if (!force && isDataFresh(state.apiStatus.lastChecked, CACHE_DURATION.apiHealth)) {
    return state.apiStatus.isConnected
  }
  
  state.apiStatus.isLoading = true
  state.apiStatus.error = null
  
  try {
    const isHealthy = await checkApiHealth()
    state.apiStatus.isConnected = isHealthy
    state.apiStatus.lastChecked = new Date().toISOString()
    state.apiStatus.retryCount = 0
    
    if (isHealthy) {
      console.log('✅ Global State: API connection verified')
    } else {
      console.warn('⚠️ Global State: API connection failed')
      state.apiStatus.error = 'API server is not responding'
    }
    
    return isHealthy
  } catch (error) {
    console.error('❌ Global State: API health check error:', error)
    state.apiStatus.isConnected = false
    state.apiStatus.error = error.message
    state.apiStatus.retryCount++
    return false
  } finally {
    state.apiStatus.isLoading = false
    saveToStorage(STORAGE_KEYS.apiStatus, state.apiStatus)
  }
}

// Categories Management
const categoriesStore = {
  async fetchAll(force = false) {
    if (!force && !state.categories.isDirty && 
        isDataFresh(state.categories.lastFetched, CACHE_DURATION.categories)) {
      console.log('📋 Using cached categories data')
      return state.categories.data
    }
    
    if (!(await checkConnection())) {
      throw new Error('API server is not available')
    }
    
    state.categories.loading = true
    state.categories.error = null
    
    try {
      console.log('📋 Fetching categories from API...')
      const data = await services.categories.getAllCategories()
      
      state.categories.data = data
      state.categories.lastFetched = new Date().toISOString()
      state.categories.isDirty = false
      
      saveToStorage(STORAGE_KEYS.categories, {
        data,
        lastFetched: state.categories.lastFetched
      })
      
      console.log(`✅ Categories loaded: ${data.length} items`)
      return data
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error)
      state.categories.error = error.message
      throw error
    } finally {
      state.categories.loading = false
    }
  },
  
  async create(categoryData) {
    if (!(await checkConnection())) {
      throw new Error('API server is not available')
    }
    
    try {
      const newCategory = await services.categories.createCategory(categoryData)
      state.categories.data.push(newCategory)
      state.categories.isDirty = false
      
      saveToStorage(STORAGE_KEYS.categories, {
        data: state.categories.data,
        lastFetched: state.categories.lastFetched
      })
      
      console.log('✅ Category created:', newCategory.name)
      return newCategory
    } catch (error) {
      console.error('❌ Failed to create category:', error)
      throw error
    }
  },
  
  async update(id, categoryData) {
    if (!(await checkConnection())) {
      throw new Error('API server is not available')
    }
    
    try {
      const updatedCategory = await services.categories.updateCategory(id, categoryData)
      const index = state.categories.data.findIndex(cat => cat._id === id)
      
      if (index !== -1) {
        state.categories.data[index] = updatedCategory
      }
      
      saveToStorage(STORAGE_KEYS.categories, {
        data: state.categories.data,
        lastFetched: state.categories.lastFetched
      })
      
      console.log('✅ Category updated:', updatedCategory.name)
      return updatedCategory
    } catch (error) {
      console.error('❌ Failed to update category:', error)
      throw error
    }
  },
  
  async delete(id) {
    if (!(await checkConnection())) {
      throw new Error('API server is not available')
    }
    
    try {
      await services.categories.deleteCategory(id)
      state.categories.data = state.categories.data.filter(cat => cat._id !== id)
      
      // Mark expenses as dirty since category relationships might have changed
      state.expenses.isDirty = true
      
      saveToStorage(STORAGE_KEYS.categories, {
        data: state.categories.data,
        lastFetched: state.categories.lastFetched
      })
      
      console.log('✅ Category deleted')
      return true
    } catch (error) {
      console.error('❌ Failed to delete category:', error)
      throw error
    }
  }
}

// Expenses Management
const expensesStore = {
  async fetchAll(force = false) {
    if (!force && !state.expenses.isDirty && 
        isDataFresh(state.expenses.lastFetched, CACHE_DURATION.expenses)) {
      console.log('💳 Using cached expenses data')
      return state.expenses.data
    }
    
    if (!(await checkConnection())) {
      throw new Error('API server is not available')
    }
    
    state.expenses.loading = true
    state.expenses.error = null
    
    try {
      console.log('💳 Fetching expenses from API...')
      const data = await services.expenses.getAllExpenses()
      
      state.expenses.data = data
      state.expenses.lastFetched = new Date().toISOString()
      state.expenses.isDirty = false
      
      saveToStorage(STORAGE_KEYS.expenses, {
        data,
        lastFetched: state.expenses.lastFetched
      })
      
      console.log(`✅ Expenses loaded: ${data.length} items`)
      return data
    } catch (error) {
      console.error('❌ Failed to fetch expenses:', error)
      state.expenses.error = error.message
      throw error
    } finally {
      state.expenses.loading = false
    }
  },
  
  async create(expenseData) {
    if (!(await checkConnection())) {
      throw new Error('API server is not available')
    }
    
    try {
      const newExpense = await services.expenses.createExpense(expenseData)
      state.expenses.data.unshift(newExpense)
      
      saveToStorage(STORAGE_KEYS.expenses, {
        data: state.expenses.data,
        lastFetched: state.expenses.lastFetched
      })
      
      console.log('✅ Expense created:', newExpense.title)
      return newExpense
    } catch (error) {
      console.error('❌ Failed to create expense:', error)
      throw error
    }
  },
  
  async update(id, expenseData) {
    if (!(await checkConnection())) {
      throw new Error('API server is not available')
    }
    
    try {
      const updatedExpense = await services.expenses.updateExpense(id, expenseData)
      const index = state.expenses.data.findIndex(exp => exp._id === id)
      
      if (index !== -1) {
        state.expenses.data[index] = updatedExpense
      }
      
      saveToStorage(STORAGE_KEYS.expenses, {
        data: state.expenses.data,
        lastFetched: state.expenses.lastFetched
      })
      
      console.log('✅ Expense updated:', updatedExpense.title)
      return updatedExpense
    } catch (error) {
      console.error('❌ Failed to update expense:', error)
      throw error
    }
  },
  
  async delete(id) {
    if (!(await checkConnection())) {
      throw new Error('API server is not available')
    }
    
    try {
      await services.expenses.deleteExpense(id)
      state.expenses.data = state.expenses.data.filter(exp => exp._id !== id)
      
      saveToStorage(STORAGE_KEYS.expenses, {
        data: state.expenses.data,
        lastFetched: state.expenses.lastFetched
      })
      
      console.log('✅ Expense deleted')
      return true
    } catch (error) {
      console.error('❌ Failed to delete expense:', error)
      throw error
    }
  }
}

// Deposits Management  
const depositsStore = {
  async fetchAll(force = false) {
    if (!force && !state.deposits.isDirty && 
        isDataFresh(state.deposits.lastFetched, CACHE_DURATION.deposits)) {
      console.log('💰 Using cached deposits data')
      return state.deposits.data
    }
    
    if (!(await checkConnection())) {
      throw new Error('API server is not available')
    }
    
    state.deposits.loading = true
    state.deposits.error = null
    
    try {
      console.log('💰 Fetching deposits from API...')
      const data = await services.deposits.getAllDeposits()
      
      state.deposits.data = data
      state.deposits.lastFetched = new Date().toISOString()
      state.deposits.isDirty = false
      
      saveToStorage(STORAGE_KEYS.deposits, {
        data,
        lastFetched: state.deposits.lastFetched
      })
      
      console.log(`✅ Deposits loaded: ${data.length} items`)
      return data
    } catch (error) {
      console.error('❌ Failed to fetch deposits:', error)
      state.deposits.error = error.message
      throw error
    } finally {
      state.deposits.loading = false
    }
  },
  
  async create(depositData) {
    if (!(await checkConnection())) {
      throw new Error('API server is not available')
    }
    
    try {
      const newDeposit = await services.deposits.createDeposit(depositData)
      state.deposits.data.unshift(newDeposit)
      
      saveToStorage(STORAGE_KEYS.deposits, {
        data: state.deposits.data,
        lastFetched: state.deposits.lastFetched
      })
      
      console.log('✅ Deposit created:', newDeposit.title)
      return newDeposit
    } catch (error) {
      console.error('❌ Failed to create deposit:', error)
      throw error
    }
  }
}

// Initialize store
const initializeStore = async () => {
  if (state.app.initialized) return
  
  console.log('🚀 Initializing Global Store...')
  
  // Load cached data from localStorage
  const cachedCategories = loadFromStorage(STORAGE_KEYS.categories)
  const cachedExpenses = loadFromStorage(STORAGE_KEYS.expenses)
  const cachedDeposits = loadFromStorage(STORAGE_KEYS.deposits)
  const cachedApiStatus = loadFromStorage(STORAGE_KEYS.apiStatus)
  const cachedAppState = loadFromStorage(STORAGE_KEYS.appState)
  
  if (cachedCategories) {
    state.categories.data = cachedCategories.data || []
    state.categories.lastFetched = cachedCategories.lastFetched
  }
  
  if (cachedExpenses) {
    state.expenses.data = cachedExpenses.data || []
    state.expenses.lastFetched = cachedExpenses.lastFetched
  }
  
  if (cachedDeposits) {
    state.deposits.data = cachedDeposits.data || []
    state.deposits.lastFetched = cachedDeposits.lastFetched
  }
  
  if (cachedApiStatus) {
    Object.assign(state.apiStatus, cachedApiStatus)
  }
  
  if (cachedAppState) {
    Object.assign(state.app, cachedAppState)
  }
  
  // Check API connection
  await checkConnection()
  
  state.app.initialized = true
  console.log('✅ Global Store initialized')
}

// Auto-save app state changes
watch(() => state.app, (newState) => {
  saveToStorage(STORAGE_KEYS.appState, newState)
}, { deep: true })

// Export store interface
export const useGlobalStore = () => {
  const { success, error: showError } = useToast()
  
  return {
    // State
    state: readonly(state),
    
    // Initialization
    initialize: initializeStore,
    
    // API Status
    isConnected: computed(() => state.apiStatus.isConnected),
    isLoading: computed(() => state.apiStatus.isLoading),
    connectionError: computed(() => state.apiStatus.error),
    
    // Categories
    categories: computed(() => state.categories.data),
    categoriesLoading: computed(() => state.categories.loading),
    categoriesError: computed(() => state.categories.error),
    
    // Expenses  
    expenses: computed(() => state.expenses.data),
    expensesLoading: computed(() => state.expenses.loading),
    expensesError: computed(() => state.expenses.error),
    
    // Deposits
    deposits: computed(() => state.deposits.data),
    depositsLoading: computed(() => state.deposits.loading),
    depositsError: computed(() => state.deposits.error),
    
    // Actions
    async loadCategories(force = false) {
      try {
        return await categoriesStore.fetchAll(force)
      } catch (error) {
        showError(`Failed to load categories: ${error.message}`)
        throw error
      }
    },
    
    async loadExpenses(force = false) {
      try {
        return await expensesStore.fetchAll(force)
      } catch (error) {
        showError(`Failed to load expenses: ${error.message}`)
        throw error
      }
    },
    
    async loadDeposits(force = false) {
      try {
        return await depositsStore.fetchAll(force)
      } catch (error) {
        showError(`Failed to load deposits: ${error.message}`)
        throw error
      }
    },
    
    async createCategory(categoryData) {
      try {
        const result = await categoriesStore.create(categoryData)
        success('Category created successfully!')
        return result
      } catch (error) {
        showError(`Failed to create category: ${error.message}`)
        throw error
      }
    },
    
    async updateCategory(id, categoryData) {
      try {
        const result = await categoriesStore.update(id, categoryData)
        success('Category updated successfully!')
        return result
      } catch (error) {
        showError(`Failed to update category: ${error.message}`)
        throw error
      }
    },
    
    async deleteCategory(id) {
      try {
        const result = await categoriesStore.delete(id)
        success('Category deleted successfully!')
        return result
      } catch (error) {
        showError(`Failed to delete category: ${error.message}`)
        throw error
      }
    },
    
    async createExpense(expenseData) {
      try {
        const result = await expensesStore.create(expenseData)
        success('Expense created successfully!')
        return result
      } catch (error) {
        showError(`Failed to create expense: ${error.message}`)
        throw error
      }
    },
    
    async updateExpense(id, expenseData) {
      try {
        const result = await expensesStore.update(id, expenseData)
        success('Expense updated successfully!')
        return result
      } catch (error) {
        showError(`Failed to update expense: ${error.message}`)
        throw error
      }
    },
    
    async deleteExpense(id) {
      try {
        const result = await expensesStore.delete(id)
        success('Expense deleted successfully!')
        return result
      } catch (error) {
        showError(`Failed to delete expense: ${error.message}`)
        throw error
      }
    },
    
    async createDeposit(depositData) {
      try {
        const result = await depositsStore.create(depositData)
        success('Deposit created successfully!')
        return result
      } catch (error) {
        showError(`Failed to create deposit: ${error.message}`)
        throw error
      }
    },
    
    // Clear all data
    clearAllData: async () => {
      try {
        // Clear in the correct order: expenses first (they reference categories), then deposits, then categories
        const results = {};
        
        // Clear expenses first
        results.expenses = await services.expenses.clearAllExpenses();
        
        // Clear deposits
        results.deposits = await services.deposits.clearAllDeposits();
        
        // Clear categories last
        results.categories = await services.categories.clearAllCategories();
        
        // Clear local state
        state.expenses.data = [];
        state.deposits.data = [];
        state.categories.data = [];
        
        // Clear cache
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
        
        return {
          message: 'All data cleared successfully',
          results
        };
      } catch (error) {
        console.error('❌ Failed to clear all data:', error);
        throw error;
      }
    },
    
    // Utility functions
    refreshConnection: () => checkConnection(true),
    clearCache: () => {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      location.reload()
    },
    
    // Computed helpers
    getCategoryStats: (categoryId) => {
      const categoryExpenses = state.expenses.data.filter(
        expense => expense.category?._id === categoryId
      )
      const count = categoryExpenses.length
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      const average = count > 0 ? total / count : 0
      const recent = categoryExpenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3)
      
      return { count, total, average, recent }
    }
  }
}

// Auto-initialize store
initializeStore()
