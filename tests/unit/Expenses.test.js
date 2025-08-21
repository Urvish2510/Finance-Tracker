import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Expenses from '../../src/views/Expenses.vue'
import { mockCategories, mockExpenses } from '../mocks/mockData.js'
import { mockGlobalStore, mockUseCurrency, mockUseToast } from '../mocks/mockUtils.js'

// Mock the composables
vi.mock('../../src/composables/useGlobalStore.js', () => ({
  useGlobalStore: () => mockGlobalStore()
}))

vi.mock('../../src/composables/useCurrency.js', () => ({
  useCurrency: () => mockUseCurrency()
}))

vi.mock('../../src/composables/useToast.js', () => ({
  useToast: () => mockUseToast()
}))

describe('Expenses Component', () => {
  let wrapper
  let mockStore

  beforeEach(() => {
    mockStore = mockGlobalStore()
    mockStore.categories.value = mockCategories
    mockStore.expenses.value = mockExpenses
    
    wrapper = mount(Expenses)
  })

  it('should render expenses page title', () => {
    expect(wrapper.find('h2').text()).toContain('Add New Expense')
  })

  it('should display expense form', () => {
    const form = wrapper.find('.expense-form')
    expect(form.exists()).toBe(true)
    
    expect(wrapper.find('input[placeholder="Enter expense description"]').exists()).toBe(true)
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('input[type="date"]').exists()).toBe(true)
  })

  it('should display expenses table', () => {
    const table = wrapper.find('.expenses-table')
    expect(table.exists()).toBe(true)
    
    const headers = table.findAll('th')
    expect(headers).toHaveLength(6) // Date, Title, Category, Amount, Description, Actions
    
    const rows = table.findAll('tbody tr')
    expect(rows).toHaveLength(mockExpenses.length)
  })

  it('should handle form submission', async () => {
    const form = wrapper.find('.expense-form')
    
    // Fill in form data
    await wrapper.find('input[placeholder="Enter expense description"]').setValue('Test Expense')
    await wrapper.find('input[type="number"]').setValue('500')
    await wrapper.find('select').setValue(mockCategories[0]._id)
    await wrapper.find('input[type="date"]').setValue('2024-08-21')
    
    // Submit form
    await form.trigger('submit.prevent')
    
    expect(mockStore.createExpense).toHaveBeenCalledWith({
      title: 'Test Expense',
      amount: 500,
      category: mockCategories[0]._id,
      date: '2024-08-21',
      description: ''
    })
  })

  it('should validate required fields', async () => {
    const form = wrapper.find('.expense-form')
    const { warning } = mockUseToast()
    
    // Try to submit empty form
    await form.trigger('submit.prevent')
    
    expect(warning).toHaveBeenCalledWith('Please fill in all required fields')
    expect(mockStore.createExpense).not.toHaveBeenCalled()
  })

  it('should clear form after successful submission', async () => {
    const form = wrapper.find('.expense-form')
    
    // Fill in form
    await wrapper.find('input[placeholder="Enter expense description"]').setValue('Test Expense')
    await wrapper.find('input[type="number"]').setValue('500')
    await wrapper.find('select').setValue(mockCategories[0]._id)
    
    // Submit form
    await form.trigger('submit.prevent')
    
    // Form should be cleared (this tests the clearForm method)
    expect(wrapper.vm.newExpense.title).toBe('')
    expect(wrapper.vm.newExpense.amount).toBe('')
    expect(wrapper.vm.newExpense.category).toBe('')
  })

  it('should handle expense deletion', async () => {
    window.confirm = vi.fn().mockReturnValue(true)
    
    const deleteButton = wrapper.find('.delete-btn')
    await deleteButton.trigger('click')
    
    expect(mockStore.deleteExpense).toHaveBeenCalled()
  })

  it('should not delete expense when confirmation is cancelled', async () => {
    window.confirm = vi.fn().mockReturnValue(false)
    
    const deleteButton = wrapper.find('.delete-btn')
    await deleteButton.trigger('click')
    
    expect(mockStore.deleteExpense).not.toHaveBeenCalled()
  })

  it('should filter expenses by search query', async () => {
    await wrapper.find('.search-input').setValue('lunch')
    
    const filteredExpenses = wrapper.vm.filteredExpenses
    expect(filteredExpenses.every(expense => 
      expense.title.toLowerCase().includes('lunch') ||
      expense.description?.toLowerCase().includes('lunch')
    )).toBe(true)
  })

  it('should filter expenses by category', async () => {
    await wrapper.find('.filter-group select').setValue(mockCategories[0]._id)
    
    const filteredExpenses = wrapper.vm.filteredExpenses
    expect(filteredExpenses.every(expense => 
      expense.category_id?.toString() === mockCategories[0]._id ||
      expense.category?._id?.toString() === mockCategories[0]._id
    )).toBe(true)
  })

  it('should paginate expenses', () => {
    // Assuming we have more than 10 expenses
    wrapper.vm.itemsPerPage = 1 // Set small page size for testing
    wrapper.vm.currentPage = 1
    
    const paginatedExpenses = wrapper.vm.paginatedExpenses
    expect(paginatedExpenses).toHaveLength(1)
  })

  it('should calculate total pages correctly', () => {
    wrapper.vm.itemsPerPage = 1 // Set small page size for testing
    
    const totalPages = wrapper.vm.totalPages
    expect(totalPages).toBe(Math.ceil(mockExpenses.length / 1))
  })

  it('should sort expenses by date (newest first)', () => {
    const filteredExpenses = wrapper.vm.filteredExpenses
    
    for (let i = 0; i < filteredExpenses.length - 1; i++) {
      const currentDate = new Date(filteredExpenses[i].date)
      const nextDate = new Date(filteredExpenses[i + 1].date)
      expect(currentDate >= nextDate).toBe(true)
    }
  })

  it('should format expense date correctly', () => {
    const testDate = '2024-08-21'
    const formattedDate = wrapper.vm.formatDate(testDate)
    
    expect(formattedDate).toBe(new Date(testDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }))
  })

  it('should display category correctly', () => {
    const expense = mockExpenses[0]
    const categoryDisplay = wrapper.vm.getCategoryDisplay(expense)
    
    expect(categoryDisplay).toContain(expense.category.icon)
    expect(categoryDisplay).toContain(expense.category.name)
  })

  it('should handle edit expense', async () => {
    const editButton = wrapper.find('.edit-btn')
    await editButton.trigger('click')
    
    // Should populate form with expense data
    expect(wrapper.vm.newExpense.title).toBe(mockExpenses[0].title)
    expect(wrapper.vm.newExpense.amount).toBe(mockExpenses[0].amount.toString())
  })

  it('should show empty state when no expenses', async () => {
    mockStore.expenses.value = []
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.no-expenses').exists()).toBe(true)
  })
})
