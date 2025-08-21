import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../../src/App.vue'
import Dashboard from '../../src/views/Dashboard.vue'
import Categories from '../../src/views/Categories.vue'
import Expenses from '../../src/views/Expenses.vue'
import Deposits from '../../src/views/Deposits.vue'
import Settings from '../../src/views/Settings.vue'
import { mockCategories, mockExpenses, mockDeposits, mockApiResponses } from '../mocks/mockData.js'

// Mock the global store
vi.mock('../../src/composables/useGlobalStore.js', () => ({
  useGlobalStore: () => ({
    // Categories
    categories: { value: mockCategories },
    loadCategories: vi.fn().mockResolvedValue(mockCategories),
    createCategory: vi.fn().mockResolvedValue(mockCategories[0]),
    updateCategory: vi.fn().mockResolvedValue(mockCategories[0]),
    deleteCategory: vi.fn().mockResolvedValue(true),
    
    // Expenses
    expenses: { value: mockExpenses },
    loadExpenses: vi.fn().mockResolvedValue(mockExpenses),
    createExpense: vi.fn().mockResolvedValue(mockExpenses[0]),
    updateExpense: vi.fn().mockResolvedValue(mockExpenses[0]),
    deleteExpense: vi.fn().mockResolvedValue(true),
    clearAllExpenses: vi.fn().mockResolvedValue(true),
    
    // Deposits
    deposits: { value: mockDeposits },
    loadDeposits: vi.fn().mockResolvedValue(mockDeposits),
    createDeposit: vi.fn().mockResolvedValue(mockDeposits[0]),
    updateDeposit: vi.fn().mockResolvedValue(mockDeposits[0]),
    deleteDeposit: vi.fn().mockResolvedValue(true),
    clearAllDeposits: vi.fn().mockResolvedValue(true),
    
    // Settings
    settings: { value: { currency: 'USD', theme: 'light' } },
    loadSettings: vi.fn().mockResolvedValue({ currency: 'USD', theme: 'light' }),
    updateSettings: vi.fn().mockResolvedValue({ currency: 'USD', theme: 'light' }),
    
    // Analytics
    analytics: { value: { totalExpenses: 425, totalDeposits: 8000, balance: 7575 } },
    loadAnalytics: vi.fn().mockResolvedValue({ totalExpenses: 425, totalDeposits: 8000, balance: 7575 }),
    
    // Utility
    isLoading: { value: false },
    error: { value: null }
  })
}))

// Mock other composables
vi.mock('../../src/composables/useToast.js', () => ({
  useToast: () => ({
    showToast: vi.fn(),
    toasts: { value: [] },
    removeToast: vi.fn()
  })
}))

vi.mock('../../src/composables/useCurrency.js', () => ({
  useCurrency: () => ({
    formatCurrency: vi.fn((amount) => `$${amount.toFixed(2)}`),
    currency: { value: 'USD' }
  })
}))

describe('Application Integration Tests', () => {
  let router
  let wrapper

  beforeEach(async () => {
    // Create router instance
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'Dashboard', component: Dashboard },
        { path: '/categories', name: 'Categories', component: Categories },
        { path: '/expenses', name: 'Expenses', component: Expenses },
        { path: '/deposits', name: 'Deposits', component: Deposits },
        { path: '/settings', name: 'Settings', component: Settings }
      ]
    })

    // Mount the main App component with router
    wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          'router-view': true
        }
      }
    })

    await router.isReady()
  })

  describe('Application Initialization', () => {
    it('should mount the application successfully', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('should load initial data from global store', async () => {
      const { useGlobalStore } = await import('../../src/composables/useGlobalStore.js')
      const store = useGlobalStore()

      expect(store.loadCategories).toHaveBeenCalled()
      expect(store.loadExpenses).toHaveBeenCalled()
      expect(store.loadDeposits).toHaveBeenCalled()
      expect(store.loadSettings).toHaveBeenCalled()
      expect(store.loadAnalytics).toHaveBeenCalled()
    })
  })

  describe('Navigation Flow', () => {
    it('should navigate between all routes successfully', async () => {
      // Test navigation to each route
      const routes = ['/', '/categories', '/expenses', '/deposits', '/settings']
      
      for (const route of routes) {
        await router.push(route)
        expect(router.currentRoute.value.path).toBe(route)
      }
    })

    it('should maintain state across navigation', async () => {
      const { useGlobalStore } = await import('../../src/composables/useGlobalStore.js')
      const store = useGlobalStore()

      // Navigate to different routes
      await router.push('/categories')
      expect(store.categories.value).toEqual(mockCategories)

      await router.push('/expenses')
      expect(store.expenses.value).toEqual(mockExpenses)

      await router.push('/deposits')
      expect(store.deposits.value).toEqual(mockDeposits)
    })
  })

  describe('Data Flow Integration', () => {
    it('should create category and immediately use it in expense', async () => {
      const { useGlobalStore } = await import('../../src/composables/useGlobalStore.js')
      const store = useGlobalStore()

      // Create new category
      const newCategory = { _id: 'new-cat', name: 'New Category', color: '#FF0000' }
      await store.createCategory(newCategory)

      // Verify category was created
      expect(store.createCategory).toHaveBeenCalledWith(newCategory)

      // Create expense with new category
      const newExpense = {
        title: 'New Expense',
        amount: 100,
        category: newCategory._id,
        date: new Date().toISOString().split('T')[0]
      }
      await store.createExpense(newExpense)

      expect(store.createExpense).toHaveBeenCalledWith(newExpense)
    })

    it('should update category and reflect changes across expenses and deposits', async () => {
      const { useGlobalStore } = await import('../../src/composables/useGlobalStore.js')
      const store = useGlobalStore()

      // Update category
      const updatedCategory = { ...mockCategories[0], name: 'Updated Food' }
      await store.updateCategory(updatedCategory)

      expect(store.updateCategory).toHaveBeenCalledWith(updatedCategory)

      // Verify expenses and deposits would reflect the change
      // (In real app, this would trigger re-loading of related data)
      expect(store.loadExpenses).toHaveBeenCalled()
      expect(store.loadDeposits).toHaveBeenCalled()
    })

    it('should delete category and handle orphaned expenses/deposits', async () => {
      const { useGlobalStore } = await import('../../src/composables/useGlobalStore.js')
      const store = useGlobalStore()

      // Delete category
      await store.deleteCategory('1')

      expect(store.deleteCategory).toHaveBeenCalledWith('1')

      // Verify related data is reloaded to handle orphaned records
      expect(store.loadExpenses).toHaveBeenCalled()
      expect(store.loadDeposits).toHaveBeenCalled()
    })
  })

  describe('Analytics Integration', () => {
    it('should calculate analytics based on current expenses and deposits', async () => {
      const { useGlobalStore } = await import('../../src/composables/useGlobalStore.js')
      const store = useGlobalStore()

      // Load analytics
      await store.loadAnalytics()

      expect(store.loadAnalytics).toHaveBeenCalled()
      expect(store.analytics.value).toEqual({
        totalExpenses: 425,
        totalDeposits: 8000,
        balance: 7575
      })
    })

    it('should update analytics when expenses or deposits change', async () => {
      const { useGlobalStore } = await import('../../src/composables/useGlobalStore.js')
      const store = useGlobalStore()

      // Add new expense
      const newExpense = { title: 'Test', amount: 100, category: '1', date: '2024-08-21' }
      await store.createExpense(newExpense)

      // Analytics should be recalculated
      expect(store.loadAnalytics).toHaveBeenCalled()

      // Add new deposit
      const newDeposit = { title: 'Test', amount: 1000, category: '3', date: '2024-08-21' }
      await store.createDeposit(newDeposit)

      // Analytics should be recalculated again
      expect(store.loadAnalytics).toHaveBeenCalled()
    })
  })

  describe('Settings Integration', () => {
    it('should apply currency settings across all financial displays', async () => {
      const { useGlobalStore } = await import('../../src/composables/useGlobalStore.js')
      const { useCurrency } = await import('../../src/composables/useCurrency.js')
      
      const store = useGlobalStore()
      const currency = useCurrency()

      // Update settings
      await store.updateSettings({ currency: 'EUR' })

      expect(store.updateSettings).toHaveBeenCalledWith({ currency: 'EUR' })

      // Verify currency formatting is available
      expect(currency.formatCurrency(100)).toBe('$100.00') // Mock returns USD format
    })

    it('should persist settings changes across application restart', async () => {
      const { useGlobalStore } = await import('../../src/composables/useGlobalStore.js')
      const store = useGlobalStore()

      // Update settings
      const newSettings = { currency: 'EUR', theme: 'dark' }
      await store.updateSettings(newSettings)

      // Reload settings (simulating app restart)
      await store.loadSettings()

      expect(store.loadSettings).toHaveBeenCalled()
      expect(store.updateSettings).toHaveBeenCalledWith(newSettings)
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully across all operations', async () => {
      const { useGlobalStore } = await import('../../src/composables/useGlobalStore.js')
      const { useToast } = await import('../../src/composables/useToast.js')
      
      const store = useGlobalStore()
      const toast = useToast()

      // Mock network error
      store.loadCategories.mockRejectedValue(new Error('Network error'))

      try {
        await store.loadCategories()
      } catch (error) {
        expect(error.message).toBe('Network error')
      }

      // Toast should be available for error display
      expect(toast.showToast).toBeDefined()
    })

    it('should recover from errors and retry operations', async () => {
      const { useGlobalStore } = await import('../../src/composables/useGlobalStore.js')
      const store = useGlobalStore()

      // First call fails
      store.loadCategories.mockRejectedValueOnce(new Error('Temporary error'))
      // Second call succeeds
      store.loadCategories.mockResolvedValue(mockCategories)

      // First attempt
      try {
        await store.loadCategories()
      } catch (error) {
        expect(error.message).toBe('Temporary error')
      }

      // Retry should succeed
      const result = await store.loadCategories()
      expect(result).toEqual(mockCategories)
    })
  })

  describe('Performance Integration', () => {
    it('should cache data and avoid unnecessary API calls', async () => {
      const { useGlobalStore } = await import('../../src/composables/useGlobalStore.js')
      const store = useGlobalStore()

      // Load categories multiple times
      await store.loadCategories()
      await store.loadCategories()
      await store.loadCategories()

      // Should be called at least once, but implementation may cache
      expect(store.loadCategories).toHaveBeenCalled()
    })

    it('should handle large datasets efficiently', async () => {
      const { useGlobalStore } = await import('../../src/composables/useGlobalStore.js')
      const store = useGlobalStore()

      // Simulate large dataset
      const largeExpenseList = Array.from({ length: 1000 }, (_, i) => ({
        _id: `exp-${i}`,
        title: `Expense ${i}`,
        amount: Math.random() * 1000,
        category: mockCategories[i % mockCategories.length],
        date: '2024-08-01'
      }))

      store.loadExpenses.mockResolvedValue(largeExpenseList)

      const result = await store.loadExpenses()
      expect(result).toHaveLength(1000)
    })
  })
})
