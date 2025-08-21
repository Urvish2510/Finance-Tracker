import { vi } from 'vitest'

// Mock fetch function
export const mockFetch = (response, ok = true, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response))
  })
}

// Mock fetch with error
export const mockFetchError = (error = 'Network Error') => {
  return vi.fn().mockRejectedValue(new Error(error))
}

// Mock Vue Router
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: {
    value: {
      path: '/',
      name: 'Dashboard',
      params: {},
      query: {}
    }
  }
}

// Mock Vue composables
export const mockUseToast = () => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn()
})

export const mockUseCurrency = () => ({
  formatCurrency: vi.fn((amount) => `₹${amount.toLocaleString()}`),
  getCurrencySymbol: vi.fn(() => '₹'),
  loadSettings: vi.fn().mockResolvedValue(undefined)
})

// Mock API Service
export const mockApiService = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  checkHealth: vi.fn()
}

// Mock global store
export const mockGlobalStore = () => ({
  // State
  categories: { value: [] },
  expenses: { value: [] },
  deposits: { value: [] },
  settings: { value: {} },
  isConnected: { value: true },
  isLoading: { value: false },
  connectionError: { value: null },
  
  // Actions
  initialize: vi.fn().mockResolvedValue(undefined),
  loadCategories: vi.fn().mockResolvedValue([]),
  loadExpenses: vi.fn().mockResolvedValue([]),
  loadDeposits: vi.fn().mockResolvedValue([]),
  createCategory: vi.fn().mockResolvedValue({}),
  updateCategory: vi.fn().mockResolvedValue({}),
  deleteCategory: vi.fn().mockResolvedValue(undefined),
  createExpense: vi.fn().mockResolvedValue({}),
  updateExpense: vi.fn().mockResolvedValue({}),
  deleteExpense: vi.fn().mockResolvedValue(undefined),
  createDeposit: vi.fn().mockResolvedValue({}),
  updateDeposit: vi.fn().mockResolvedValue({}),
  deleteDeposit: vi.fn().mockResolvedValue(undefined),
  clearAllData: vi.fn().mockResolvedValue(undefined)
})
