// API service for communicating with MongoDB backend
import { config, isDev } from '../config/environment.js'

class ApiError extends Error {
  constructor(message, status, context = {}) {
    super(message);
    this.status = status;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

// Enhanced error handling with environment-aware logging
const handleError = (error, context = {}) => {
  config.handleError(error, context)
  
  if (error instanceof ApiError) {
    throw error
  }
  
  if (error.name === 'AbortError') {
    throw new ApiError('Request timeout', 408, context)
  }
  
  throw new ApiError(error.message || 'Network error', error.status || 500, context)
}

const handleResponse = async (response, context = {}) => {
  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
    }
    
    throw new ApiError(
      errorData.error || `Request failed with status ${response.status}`, 
      response.status,
      { ...context, response: { status: response.status, statusText: response.statusText } }
    )
  }
  
  const data = await response.json()
  
  // Log successful responses in development
  if (isDev && config.debugMode) {
    console.log(`✅ API Success: ${context.method || 'GET'} ${context.endpoint}`, data)
  }
  
  return data
}

const apiRequest = async (endpoint, options = {}) => {
  const apiConfig = config.getApiConfig()
  const url = `${apiConfig.baseURL}${endpoint}`
  
  const requestConfig = {
    ...apiConfig,
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options.headers,
    },
  }

  // Add timeout support
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout)

  const context = {
    endpoint,
    method: options.method || 'GET',
    timestamp: new Date().toISOString(),
    environment: config.env
  }

  try {
    if (isDev && config.debugMode) {
      console.log(`🔄 API Request: ${context.method} ${endpoint}`, {
        url,
        options: requestConfig
      })
    }

    const response = await fetch(url, {
      ...requestConfig,
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    return await handleResponse(response, context)
  } catch (error) {
    clearTimeout(timeoutId)
    handleError(error, context)
  }
}

// Category Service
export class CategoryService {
  async getAllCategories() {
    try {
      return await apiRequest('/categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getCategoryById(id) {
    try {
      return await apiRequest(`/categories/${id}`);
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw error;
    }
  }

  async createCategory(categoryData) {
    try {
      return await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id, categoryData) {
    try {
      return await apiRequest(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      return await apiRequest(`/categories/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}

// Expense Service
export class ExpenseService {
  async getAllExpenses() {
    try {
      return await apiRequest('/expenses');
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  async getExpenseById(id) {
    try {
      return await apiRequest(`/expenses/${id}`);
    } catch (error) {
      console.error('Error fetching expense by ID:', error);
      throw error;
    }
  }

  async getExpensesByCategory(categoryId) {
    try {
      return await apiRequest(`/expenses/category/${categoryId}`);
    } catch (error) {
      console.error('Error fetching expenses by category:', error);
      throw error;
    }
  }

  async getExpensesByDateRange(startDate, endDate) {
    try {
      return await apiRequest(`/expenses/date-range?startDate=${startDate}&endDate=${endDate}`);
    } catch (error) {
      console.error('Error fetching expenses by date range:', error);
      throw error;
    }
  }

  async createExpense(expenseData) {
    try {
      return await apiRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData),
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  async updateExpense(id, expenseData) {
    try {
      return await apiRequest(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  async deleteExpense(id) {
    try {
      return await apiRequest(`/expenses/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  async getExpenseSummary() {
    try {
      return await apiRequest('/expenses/summary');
    } catch (error) {
      console.error('Error getting expense summary:', error);
      throw error;
    }
  }
}

// Deposit Service
export class DepositService {
  async getAllDeposits() {
    try {
      return await apiRequest('/deposits');
    } catch (error) {
      console.error('Error fetching deposits:', error);
      throw error;
    }
  }

  async getDepositById(id) {
    try {
      return await apiRequest(`/deposits/${id}`);
    } catch (error) {
      console.error('Error fetching deposit by ID:', error);
      throw error;
    }
  }

  async createDeposit(depositData) {
    try {
      return await apiRequest('/deposits', {
        method: 'POST',
        body: JSON.stringify(depositData),
      });
    } catch (error) {
      console.error('Error creating deposit:', error);
      throw error;
    }
  }

  async updateDeposit(id, depositData) {
    try {
      return await apiRequest(`/deposits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(depositData),
      });
    } catch (error) {
      console.error('Error updating deposit:', error);
      throw error;
    }
  }

  async deleteDeposit(id) {
    try {
      return await apiRequest(`/deposits/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting deposit:', error);
      throw error;
    }
  }

  async getDepositSummary() {
    try {
      return await apiRequest('/deposits/summary');
    } catch (error) {
      console.error('Error getting deposit summary:', error);
      throw error;
    }
  }
}

// Settings Service
export class SettingsService {
  async getSettings() {
    try {
      return await apiRequest('/settings');
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  async updateSettings(settingsData) {
    try {
      return await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsData),
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  async getCurrencyInfo() {
    try {
      return await apiRequest('/settings/currency');
    } catch (error) {
      console.error('Error fetching currency info:', error);
      throw error;
    }
  }
}

// Health check with environment-aware configuration
export const checkApiHealth = async () => {
  try {
    const apiConfig = config.getApiConfig()
    const healthUrl = apiConfig.baseURL.replace('/api', '/health')
    
    if (isDev) {
      console.log('🔍 Checking API health at:', healthUrl)
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // Quick health check timeout
    
    const response = await fetch(healthUrl, {
      signal: controller.signal,
      headers: {
        'X-Health-Check': 'true',
        'X-App-Environment': config.env
      }
    })
    
    clearTimeout(timeoutId)
    const isHealthy = response.ok
    
    if (isDev) {
      console.log(isHealthy ? '✅ API is healthy' : '❌ API health check failed')
    }
    
    return isHealthy
  } catch (error) {
    if (isDev) {
      console.warn('⚠️ API health check failed:', error.message)
    }
    return false
  }
}

// Service instances
const categoryService = new CategoryService();
const expenseService = new ExpenseService();
const depositService = new DepositService();
const settingsService = new SettingsService();

// Unified API service for easier usage
export const apiService = {
  // Generic request method
  async get(endpoint) {
    return await apiRequest(endpoint);
  },
  
  async post(endpoint, data) {
    return await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async put(endpoint, data) {
    return await apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async delete(endpoint) {
    return await apiRequest(endpoint, {
      method: 'DELETE',
    });
  },

  // Service shortcuts
  categories: categoryService,
  expenses: expenseService,
  deposits: depositService,
  settings: settingsService,
};

export { ApiError };
