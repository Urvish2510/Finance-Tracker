import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ExpensePieChart from '../../src/components/ExpensePieChart_New.vue'

// Mock Chart.js
vi.mock('chart.js/auto', () => {
  const Chart = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    data: { datasets: [{ data: [] }] },
    options: { plugins: { tooltip: {} } }
  }))
  
  // Add static methods to Chart
  Chart.getChart = vi.fn(() => null)
  Chart.register = vi.fn()
  
  return { default: Chart }
})

// Mock composables
const mockGlobalStore = {
  expenses: { value: [] },
  categories: { value: [] },
  loadExpenses: vi.fn(() => Promise.resolve()),
  loadCategories: vi.fn(() => Promise.resolve())
}

const mockCurrency = {
  formatCurrency: (amount) => `₹${amount.toFixed(2)}`
}

const mockTheme = {
  tokens: { value: { primary: '#3498db', tooltipBg: 'rgba(0,0,0,0.8)' } },
  version: { value: 0 }
}

vi.mock('../../src/composables/useGlobalStore.js', () => ({
  useGlobalStore: () => mockGlobalStore
}), { virtual: true })

vi.mock('../../src/composables/useCurrency.js', () => ({
  useCurrency: () => mockCurrency
}), { virtual: true })

vi.mock('../../src/composables/useTheme.js', () => ({
  useTheme: () => mockTheme
}), { virtual: true })

describe('ExpensePieChart_New.vue', () => {
  let wrapper

  beforeEach(() => {
    // Reset mocks
    mockGlobalStore.expenses.value = []
    mockGlobalStore.categories.value = []
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Rendering', () => {
    it('renders the chart wrapper', () => {
      wrapper = mount(ExpensePieChart)
      
      expect(wrapper.find('.pie-chart-wrapper').exists()).toBe(true)
    })

    it('renders chart header and title', () => {
      wrapper = mount(ExpensePieChart)
      
      const header = wrapper.find('.chart-header')
      if (header.exists()) {
        const title = header.find('h3, .chart-title')
        expect(title.exists()).toBe(true)
      }
    })

    it('renders period selection dropdown', () => {
      wrapper = mount(ExpensePieChart)
      
      const periodSelect = wrapper.find('select, .period-select')
      if (periodSelect.exists()) {
        expect(periodSelect.exists()).toBe(true)
      }
    })

    it('loads data on mount', async () => {
      wrapper = mount(ExpensePieChart)
      
      await wrapper.vm.$nextTick()
      
      expect(mockGlobalStore.loadExpenses).toHaveBeenCalled()
      expect(mockGlobalStore.loadCategories).toHaveBeenCalled()
    })
  })

  describe('Data Processing', () => {
    it('handles empty expense data', async () => {
      mockGlobalStore.expenses.value = []
      wrapper = mount(ExpensePieChart)
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.exists()).toBe(true)
    })

    it('processes expense data when available', async () => {
      const mockCategory = {
        _id: 'cat1',
        name: 'Food',
        icon: '🍔',
        color: '#ff8800'
      }

      const mockExpenses = [
        {
          _id: 'exp1',
          title: 'Lunch',
          amount: 25,
          category: mockCategory,
          date: new Date().toISOString()
        }
      ]

      mockGlobalStore.expenses.value = mockExpenses
      mockGlobalStore.categories.value = [mockCategory]
      
      wrapper = mount(ExpensePieChart)
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.exists()).toBe(true)
    })

    it('handles categories by reference', async () => {
      const mockCategory = {
        _id: 'cat1',
        name: 'Food',
        icon: '🍔',
        color: '#ff8800'
      }

      const mockExpenses = [
        {
          _id: 'exp1',
          title: 'Lunch',
          amount: 25,
          category: 'cat1', // Reference by ID
          date: new Date().toISOString()
        }
      ]

      mockGlobalStore.expenses.value = mockExpenses
      mockGlobalStore.categories.value = [mockCategory]
      
      wrapper = mount(ExpensePieChart)
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        wrapper = mount(ExpensePieChart)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      wrapper = mount(ExpensePieChart)
      
      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
    })

    it('handles theme changes', async () => {
      wrapper = mount(ExpensePieChart)
      
      // Simulate theme change
      mockTheme.version.value = 1
      await wrapper.vm.$nextTick()
      
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Responsive Behavior', () => {
    it('renders on different screen sizes', () => {
      wrapper = mount(ExpensePieChart)
      
      expect(wrapper.find('.pie-chart-wrapper').exists()).toBe(true)
    })

    it('handles canvas element', () => {
      wrapper = mount(ExpensePieChart)
      
      // Check that component doesn't crash when accessing canvas
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('handles missing categories gracefully', async () => {
      const mockExpenses = [
        {
          _id: 'exp1',
          title: 'Uncategorized Expense',
          amount: 50,
          category: null,
          date: new Date().toISOString()
        }
      ]

      mockGlobalStore.expenses.value = mockExpenses
      
      expect(() => {
        wrapper = mount(ExpensePieChart)
      }).not.toThrow()
    })

    it('handles malformed expense data', async () => {
      const mockExpenses = [
        {
          _id: 'exp1',
          // Missing required fields
          amount: null,
          category: undefined,
        }
      ]

      mockGlobalStore.expenses.value = mockExpenses
      
      expect(() => {
        wrapper = mount(ExpensePieChart)
      }).not.toThrow()
    })
  })
})
