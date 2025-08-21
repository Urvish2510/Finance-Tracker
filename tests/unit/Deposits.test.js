import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Deposits from '../../src/views/Deposits.vue'
import { mockCategories, mockDeposits } from '../mocks/mockData.js'
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

describe('Deposits Component', () => {
  let wrapper
  let mockStore

  beforeEach(() => {
    mockStore = mockGlobalStore()
    mockStore.categories.value = mockCategories
    mockStore.deposits.value = mockDeposits
    
    wrapper = mount(Deposits)
  })

  it('should render deposits page title', () => {
    expect(wrapper.find('.page-title').text()).toContain('Income & Deposits')
  })

  it('should display summary cards', () => {
    const summaryCards = wrapper.findAll('.summary-card')
    expect(summaryCards).toHaveLength(3) // Total Income, This Month, Average
    
    expect(summaryCards[0].text()).toContain('Total Income')
    expect(summaryCards[1].text()).toContain('This Month')
    expect(summaryCards[2].text()).toContain('Average')
  })

  it('should calculate total income correctly', () => {
    const totalIncome = mockDeposits.reduce((sum, deposit) => sum + deposit.amount, 0)
    expect(wrapper.vm.totalIncome).toBe(totalIncome)
  })

  it('should calculate monthly income correctly', () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyIncome = mockDeposits
      .filter(deposit => {
        const depositDate = new Date(deposit.date)
        return depositDate.getMonth() === currentMonth && depositDate.getFullYear() === currentYear
      })
      .reduce((sum, deposit) => sum + deposit.amount, 0)
    
    expect(wrapper.vm.monthlyIncome).toBe(monthlyIncome)
  })

  it('should calculate average income correctly', () => {
    const totalIncome = mockDeposits.reduce((sum, deposit) => sum + deposit.amount, 0)
    const averageIncome = totalIncome / mockDeposits.length
    
    expect(wrapper.vm.averageIncome).toBe(averageIncome)
  })

  it('should show add deposit form when add button is clicked', async () => {
    const addButton = wrapper.find('.add-btn')
    await addButton.trigger('click')
    
    expect(wrapper.vm.showForm).toBe(true)
    expect(wrapper.find('.form-overlay').exists()).toBe(true)
  })

  it('should hide form when close button is clicked', async () => {
    wrapper.vm.showForm = true
    await wrapper.vm.$nextTick()
    
    const closeButton = wrapper.find('.close-btn')
    await closeButton.trigger('click')
    
    expect(wrapper.vm.showForm).toBe(false)
  })

  it('should handle form submission for new deposit', async () => {
    wrapper.vm.showForm = true
    await wrapper.vm.$nextTick()
    
    // Fill in form data
    wrapper.vm.form.title = 'Test Deposit'
    wrapper.vm.form.amount = '5000'
    wrapper.vm.form.categoryId = mockCategories[2]._id // income category
    wrapper.vm.form.date = '2024-08-21'
    wrapper.vm.form.description = 'Test description'
    
    const form = wrapper.find('.deposit-form')
    await form.trigger('submit.prevent')
    
    expect(mockStore.createDeposit).toHaveBeenCalledWith({
      title: 'Test Deposit',
      amount: 5000,
      category: mockCategories[2]._id,
      date: '2024-08-21',
      description: 'Test description'
    })
  })

  it('should handle form submission for edit deposit', async () => {
    // Set editing mode
    wrapper.vm.editingDeposit = mockDeposits[0]
    wrapper.vm.showForm = true
    await wrapper.vm.$nextTick()
    
    wrapper.vm.form.title = 'Updated Deposit'
    wrapper.vm.form.amount = '80000'
    
    const form = wrapper.find('.deposit-form')
    await form.trigger('submit.prevent')
    
    expect(mockStore.updateDeposit).toHaveBeenCalledWith(
      mockDeposits[0]._id,
      expect.objectContaining({
        title: 'Updated Deposit',
        amount: 80000
      })
    )
  })

  it('should display deposits list', () => {
    const depositsList = wrapper.find('.deposits-list')
    expect(depositsList.exists()).toBe(true)
    
    const depositItems = depositsList.findAll('.deposit-item')
    expect(depositItems).toHaveLength(mockDeposits.length)
  })

  it('should handle deposit deletion', async () => {
    window.confirm = vi.fn().mockReturnValue(true)
    
    const deleteButton = wrapper.find('.delete-btn')
    await deleteButton.trigger('click')
    
    expect(mockStore.deleteDeposit).toHaveBeenCalled()
  })

  it('should not delete deposit when confirmation is cancelled', async () => {
    window.confirm = vi.fn().mockReturnValue(false)
    
    const deleteButton = wrapper.find('.delete-btn')
    await deleteButton.trigger('click')
    
    expect(mockStore.deleteDeposit).not.toHaveBeenCalled()
  })

  it('should filter deposits by category', async () => {
    wrapper.vm.filterCategory = mockCategories[2]._id
    await wrapper.vm.$nextTick()
    
    const filteredDeposits = wrapper.vm.filteredDeposits
    expect(filteredDeposits.every(deposit => 
      deposit.category?._id === mockCategories[2]._id ||
      deposit.category_id === mockCategories[2]._id
    )).toBe(true)
  })

  it('should show all deposits when no filter is selected', () => {
    wrapper.vm.filterCategory = ''
    
    const filteredDeposits = wrapper.vm.filteredDeposits
    expect(filteredDeposits).toEqual(mockDeposits)
  })

  it('should display income categories in dropdown', () => {
    const incomeCategories = wrapper.vm.incomeCategories
    expect(incomeCategories.every(cat => cat.type === 'income')).toBe(true)
  })

  it('should format date correctly', () => {
    const testDate = '2024-08-21'
    const formattedDate = wrapper.vm.formatDate(testDate)
    
    expect(formattedDate).toBe(new Date(testDate).toLocaleDateString())
  })

  it('should get category icon correctly', () => {
    const category = mockCategories[2]
    const icon = wrapper.vm.getCategoryIcon(category)
    
    expect(icon).toBe(category.icon)
  })

  it('should get category name correctly', () => {
    const category = mockCategories[2]
    const name = wrapper.vm.getCategoryName(category)
    
    expect(name).toBe(category.name)
  })

  it('should handle edit deposit', async () => {
    const editButton = wrapper.find('.edit-btn')
    await editButton.trigger('click')
    
    expect(wrapper.vm.editingDeposit).toBeTruthy()
    expect(wrapper.vm.showForm).toBe(true)
    expect(wrapper.vm.form.title).toBe(mockDeposits[0].title)
  })

  it('should reset form when showing add form', () => {
    wrapper.vm.showAddForm()
    
    expect(wrapper.vm.form.title).toBe('')
    expect(wrapper.vm.form.amount).toBe('')
    expect(wrapper.vm.form.categoryId).toBe('')
    expect(wrapper.vm.form.description).toBe('')
    expect(wrapper.vm.showForm).toBe(true)
  })

  it('should show no data message when no deposits', async () => {
    mockStore.deposits.value = []
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.no-data').exists()).toBe(true)
  })

  it('should show loading state', async () => {
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.loading').exists()).toBe(true)
  })
})
