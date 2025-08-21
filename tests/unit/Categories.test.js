import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Categories from '../../src/views/Categories.vue'
import { mockCategories } from '../mocks/mockData.js'
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

describe('Categories Component', () => {
  let wrapper
  let mockStore

  beforeEach(() => {
    mockStore = mockGlobalStore()
    mockStore.categories.value = mockCategories
    
    wrapper = mount(Categories, {
      global: {
        stubs: {
          CategoryForm: true,
          CategoryCard: true,
          CategoryEditModal: true,
          ErrorMessage: true,
          EmptyState: true
        }
      }
    })
  })

  it('should render categories page title', () => {
    expect(wrapper.find('h2').text()).toContain('Manage Categories')
  })

  it('should display categories when available', () => {
    expect(wrapper.find('.categories-grid').exists()).toBe(true)
  })

  it('should show empty state when no categories', async () => {
    mockStore.categories.value = []
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('EmptyState-stub').exists()).toBe(true)
  })

  it('should show error message when there is an error', async () => {
    mockStore.connectionError.value = 'API Error'
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('ErrorMessage-stub').exists()).toBe(true)
  })

  it('should call loadCategories on mount', () => {
    expect(mockStore.loadCategories).toHaveBeenCalled()
  })

  it('should handle category creation', async () => {
    const categoryData = {
      name: 'Test Category',
      icon: '🧪',
      color: '#FF0000',
      type: 'expense',
      budget: 1000
    }
    
    await wrapper.vm.handleCreateCategory(categoryData)
    
    expect(mockStore.createCategory).toHaveBeenCalledWith(categoryData)
  })

  it('should handle category update', async () => {
    const updatedCategory = { ...mockCategories[0], name: 'Updated Category' }
    
    await wrapper.vm.handleUpdateCategory('1', updatedCategory)
    
    expect(mockStore.updateCategory).toHaveBeenCalledWith('1', updatedCategory)
  })

  it('should handle category deletion', async () => {
    // Mock window.confirm
    window.confirm = vi.fn().mockReturnValue(true)
    
    await wrapper.vm.handleDeleteCategory('1')
    
    expect(mockStore.deleteCategory).toHaveBeenCalledWith('1')
  })

  it('should not delete category when confirmation is cancelled', async () => {
    window.confirm = vi.fn().mockReturnValue(false)
    
    await wrapper.vm.handleDeleteCategory('1')
    
    expect(mockStore.deleteCategory).not.toHaveBeenCalled()
  })

  it('should calculate total budget correctly', () => {
    expect(wrapper.vm.totalBudget).toBe(8000) // Sum of mock categories budgets
  })

  it('should filter expense categories', () => {
    const expenseCategories = wrapper.vm.expenseCategories
    expect(expenseCategories).toHaveLength(2)
    expect(expenseCategories.every(cat => cat.type === 'expense')).toBe(true)
  })

  it('should filter income categories', () => {
    const incomeCategories = wrapper.vm.incomeCategories
    expect(incomeCategories).toHaveLength(1)
    expect(incomeCategories.every(cat => cat.type === 'income')).toBe(true)
  })
})
