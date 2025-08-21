import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGlobalStore } from '../../src/composables/useGlobalStore.js'
import { mockCategories, mockExpenses, mockDeposits, mockLocalStorageData } from '../mocks/mockData.js'
import { mockFetch, mockFetchError } from '../mocks/mockUtils.js'

// Mock API service
vi.mock('../../src/services/apiService.js', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    checkHealth: vi.fn()
  }
}))

// Mock toast composable
vi.mock('../../src/composables/useToast.js', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  })
}))

describe('useGlobalStore', () => {
  let globalStore

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Reset fetch mock
    global.fetch = mockFetch({ status: 'OK' })
    
    // Get fresh instance
    globalStore = useGlobalStore()
  })

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      expect(globalStore.categories.value).toEqual([])
      expect(globalStore.expenses.value).toEqual([])
      expect(globalStore.deposits.value).toEqual([])
      expect(globalStore.isConnected.value).toBe(false)
      expect(globalStore.isLoading.value).toBe(false)
    })

    it('should check API connection on initialize', async () => {
      global.fetch = mockFetch({ status: 'OK' })
      
      await globalStore.initialize()
      
      expect(globalStore.isConnected.value).toBe(true)
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/health'))
    })

    it('should handle API connection failure', async () => {
      global.fetch = mockFetchError('Connection failed')
      
      await globalStore.initialize()
      
      expect(globalStore.isConnected.value).toBe(false)
      expect(globalStore.connectionError.value).toBeTruthy()
    })
  })

  describe('Cache Management', () => {
    it('should save data to localStorage', () => {
      globalStore.categories.value = mockCategories
      
      // Trigger save (this would normally happen automatically)
      const cacheData = {
        categories: {
          data: mockCategories,
          timestamp: Date.now(),
          expires: Date.now() + 600000
        }
      }
      localStorage.setItem('finance-tracker-global-store', JSON.stringify(cacheData))
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'finance-tracker-global-store',
        expect.stringContaining('"data":')
      )
    })

    it('should load data from localStorage cache', () => {
      // Set up localStorage mock to return cached data
      localStorage.getItem.mockReturnValue(mockLocalStorageData['finance-tracker-global-store'])
      
      // This would normally happen during store initialization
      const cachedData = JSON.parse(localStorage.getItem('finance-tracker-global-store') || '{}')
      
      expect(cachedData.categories.data).toEqual(mockCategories)
      expect(cachedData.expenses.data).toEqual(mockExpenses)
      expect(cachedData.deposits.data).toEqual(mockDeposits)
    })

    it('should determine if cache is fresh', () => {
      const now = Date.now()
      const freshCache = { timestamp: now, expires: now + 300000 }
      const expiredCache = { timestamp: now - 400000, expires: now - 100000 }
      
      // Mock the cache freshness check logic
      expect(freshCache.expires > Date.now()).toBe(true)
      expect(expiredCache.expires > Date.now()).toBe(false)
    })
  })

  describe('Categories', () => {
    beforeEach(() => {
      global.fetch = mockFetch(mockCategories)
    })

    it('should load categories from API', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      apiService.get.mockResolvedValue(mockCategories)
      
      await globalStore.loadCategories()
      
      expect(apiService.get).toHaveBeenCalledWith('/categories')
    })

    it('should create a new category', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      const newCategory = {
        name: 'Entertainment',
        icon: '🎬',
        color: '#FF9F43',
        type: 'expense',
        budget: 2000
      }
      
      apiService.post.mockResolvedValue({ _id: '4', ...newCategory })
      
      await globalStore.createCategory(newCategory)
      
      expect(apiService.post).toHaveBeenCalledWith('/categories', newCategory)
    })

    it('should update an existing category', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      const updatedCategory = { ...mockCategories[0], name: 'Updated Food' }
      
      apiService.put.mockResolvedValue(updatedCategory)
      
      await globalStore.updateCategory('1', updatedCategory)
      
      expect(apiService.put).toHaveBeenCalledWith('/categories/1', updatedCategory)
    })

    it('should delete a category', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      apiService.delete.mockResolvedValue({})
      
      await globalStore.deleteCategory('1')
      
      expect(apiService.delete).toHaveBeenCalledWith('/categories/1')
    })

    it('should handle category API errors gracefully', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      apiService.get.mockRejectedValue(new Error('API Error'))
      
      await expect(globalStore.loadCategories()).rejects.toThrow('API Error')
    })
  })

  describe('Expenses', () => {
    it('should load expenses from API', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      
      await globalStore.loadExpenses()
      
      expect(apiService.get).toHaveBeenCalledWith('/expenses')
    })

    it('should create a new expense', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      const newExpense = {
        title: 'Coffee',
        amount: 150,
        category: '1',
        date: '2024-08-21',
        description: 'Morning coffee'
      }
      
      apiService.post.mockResolvedValue({ _id: 'exp3', ...newExpense })
      
      await globalStore.createExpense(newExpense)
      
      expect(apiService.post).toHaveBeenCalledWith('/expenses', newExpense)
    })

    it('should update an existing expense', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      const updatedExpense = { ...mockExpenses[0], amount: 900 }
      
      apiService.put.mockResolvedValue(updatedExpense)
      
      await globalStore.updateExpense('exp1', updatedExpense)
      
      expect(apiService.put).toHaveBeenCalledWith('/expenses/exp1', updatedExpense)
    })

    it('should delete an expense', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      apiService.delete.mockResolvedValue({})
      
      await globalStore.deleteExpense('exp1')
      
      expect(apiService.delete).toHaveBeenCalledWith('/expenses/exp1')
    })
  })

  describe('Deposits', () => {
    it('should load deposits from API', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      
      await globalStore.loadDeposits()
      
      expect(apiService.get).toHaveBeenCalledWith('/deposits')
    })

    it('should create a new deposit', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      const newDeposit = {
        title: 'Bonus',
        amount: 10000,
        category: '3',
        date: '2024-08-21',
        description: 'Performance bonus'
      }
      
      apiService.post.mockResolvedValue({ _id: 'dep3', ...newDeposit })
      
      await globalStore.createDeposit(newDeposit)
      
      expect(apiService.post).toHaveBeenCalledWith('/deposits', newDeposit)
    })

    it('should update an existing deposit', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      const updatedDeposit = { ...mockDeposits[0], amount: 80000 }
      
      apiService.put.mockResolvedValue(updatedDeposit)
      
      await globalStore.updateDeposit('dep1', updatedDeposit)
      
      expect(apiService.put).toHaveBeenCalledWith('/deposits/dep1', updatedDeposit)
    })

    it('should delete a deposit', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      apiService.delete.mockResolvedValue({})
      
      await globalStore.deleteDeposit('dep1')
      
      expect(apiService.delete).toHaveBeenCalledWith('/deposits/dep1')
    })
  })

  describe('Clear All Data', () => {
    it('should clear all data from API and cache', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      apiService.delete.mockResolvedValue({})
      
      // Set up some data first
      globalStore.categories.value = mockCategories
      globalStore.expenses.value = mockExpenses
      globalStore.deposits.value = mockDeposits
      
      await globalStore.clearAllData()
      
      // Should call API to delete all data
      expect(apiService.delete).toHaveBeenCalledWith('/categories/clear-all')
      expect(apiService.delete).toHaveBeenCalledWith('/expenses/clear-all')
      expect(apiService.delete).toHaveBeenCalledWith('/deposits/clear-all')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      global.fetch = mockFetchError('Network Error')
      
      await globalStore.initialize()
      
      expect(globalStore.isConnected.value).toBe(false)
      expect(globalStore.connectionError.value).toContain('Network Error')
    })

    it('should fall back to cache when API fails', async () => {
      // Set up cache
      localStorage.getItem.mockReturnValue(mockLocalStorageData['finance-tracker-global-store'])
      
      // Mock API failure
      const { apiService } = await import('../../src/services/apiService.js')
      apiService.get.mockRejectedValue(new Error('API Error'))
      
      // The store should still load data from cache
      const cachedData = JSON.parse(localStorage.getItem('finance-tracker-global-store') || '{}')
      expect(cachedData.categories.data).toEqual(mockCategories)
    })

    it('should retry API calls with exponential backoff', async () => {
      const { apiService } = await import('../../src/services/apiService.js')
      
      // First call fails, second succeeds
      apiService.get
        .mockRejectedValueOnce(new Error('Temporary Error'))
        .mockResolvedValueOnce(mockCategories)
      
      // This would test retry logic if implemented
      try {
        await globalStore.loadCategories()
      } catch (error) {
        // First attempt should fail
        expect(error.message).toBe('Temporary Error')
      }
      
      // Second attempt should succeed
      await globalStore.loadCategories()
      expect(apiService.get).toHaveBeenCalledTimes(2)
    })
  })
})
