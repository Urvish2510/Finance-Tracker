import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Dashboard from '../../src/views/Dashboard.vue'
import { mockCategories, mockExpenses, mockDeposits } from '../mocks/mockData.js'
import { mockGlobalStore, mockUseCurrency } from '../mocks/mockUtils.js'

// Mock the composables
vi.mock('../../src/composables/useGlobalStore.js', () => ({
  useGlobalStore: () => mockGlobalStore()
}))

vi.mock('../../src/composables/useCurrency.js', () => ({
  useCurrency: () => mockUseCurrency()
}))

// Mock router
const mockRouter = {
  push: vi.fn()
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

describe('Dashboard Component', () => {
  let wrapper
  let mockStore

  beforeEach(() => {
    mockStore = mockGlobalStore()
    mockStore.categories.value = mockCategories
    mockStore.expenses.value = mockExpenses
    mockStore.deposits.value = mockDeposits
    
    wrapper = mount(Dashboard, {
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    })
  })

  it('should render dashboard welcome section', () => {
    expect(wrapper.find('.welcome-section').exists()).toBe(true)
    expect(wrapper.find('h2').text()).toContain('Welcome Back!')
  })

  it('should display current date', () => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    
    expect(wrapper.find('.current-date').text()).toBe(currentDate)
  })

  it('should display summary cards', () => {
    const summaryCards = wrapper.findAll('.summary-card')
    expect(summaryCards).toHaveLength(4) // Total Income, Total Expenses, Net Balance, Average Expense
    
    expect(summaryCards[0].text()).toContain('Total Income')
    expect(summaryCards[1].text()).toContain('Total Expenses')
    expect(summaryCards[2].text()).toContain('Net Balance')
    expect(summaryCards[3].text()).toContain('Average Expense')
  })

  it('should calculate total income correctly', () => {
    const totalIncome = mockDeposits.reduce((sum, deposit) => sum + deposit.amount, 0)
    expect(wrapper.vm.dashboardSummary.totalDeposits).toBe(totalIncome)
  })

  it('should calculate total expenses correctly', () => {
    const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    expect(wrapper.vm.dashboardSummary.totalExpenses).toBe(totalExpenses)
  })

  it('should calculate net balance correctly', () => {
    const totalIncome = mockDeposits.reduce((sum, deposit) => sum + deposit.amount, 0)
    const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const expectedNetBalance = totalIncome - totalExpenses
    
    expect(wrapper.vm.netBalance).toBe(expectedNetBalance)
  })

  it('should display positive balance class for positive net balance', () => {
    // Assuming deposits > expenses in mock data
    expect(wrapper.vm.netBalanceClass).toBe('positive')
  })

  it('should display recent expenses', () => {
    const recentExpenses = wrapper.vm.recentExpenses
    expect(recentExpenses).toHaveLength(Math.min(3, mockExpenses.length))
    
    // Should be sorted by date (newest first)
    if (recentExpenses.length > 1) {
      expect(new Date(recentExpenses[0].date) >= new Date(recentExpenses[1].date)).toBe(true)
    }
  })

  it('should display quick actions', () => {
    const quickActions = wrapper.find('.quick-actions')
    expect(quickActions.exists()).toBe(true)
    
    const actionCards = quickActions.findAll('.action-card')
    expect(actionCards).toHaveLength(3) // Add Expense, Add Income, Settings
  })

  it('should display charts section', () => {
    const chartsSection = wrapper.find('.charts-section')
    expect(chartsSection.exists()).toBe(true)
    
    const chartCards = chartsSection.findAll('.chart-card')
    expect(chartCards).toHaveLength(2) // Expense Distribution, Monthly Trends
  })

  it('should show loading state initially', async () => {
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.loading-section').exists()).toBe(true)
  })

  it('should call initialize and load data on mount', () => {
    expect(mockStore.initialize).toHaveBeenCalled()
    expect(mockStore.loadCategories).toHaveBeenCalled()
    expect(mockStore.loadExpenses).toHaveBeenCalled()
    expect(mockStore.loadDeposits).toHaveBeenCalled()
  })

  it('should format relative dates correctly', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    expect(wrapper.vm.formatRelativeDate(today.toISOString())).toBe('Today')
    expect(wrapper.vm.formatRelativeDate(yesterday.toISOString())).toBe('Yesterday')
  })

  it('should handle empty state when no expenses', async () => {
    mockStore.expenses.value = []
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })
})
