import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Settings from '../../src/views/Settings.vue'
import { mockCategories, mockExpenses, mockDeposits, mockLocalStorageData } from '../mocks/mockData.js'
import { mockGlobalStore, mockUseToast } from '../mocks/mockUtils.js'

// Mock the composables
vi.mock('../../src/composables/useGlobalStore.js', () => ({
  useGlobalStore: () => mockGlobalStore()
}))

vi.mock('../../src/composables/useToast.js', () => ({
  useToast: () => mockUseToast()
}))

describe('Settings Component', () => {
  let wrapper
  let mockStore

  beforeEach(() => {
    mockStore = mockGlobalStore()
    mockStore.categories.value = mockCategories
    mockStore.expenses.value = mockExpenses
    mockStore.deposits.value = mockDeposits
    mockStore.isConnected.value = true
    
    // Mock localStorage
    localStorage.getItem.mockImplementation((key) => {
      return mockLocalStorageData[key] || null
    })
    
    wrapper = mount(Settings)
  })

  it('should render settings page title', () => {
    expect(wrapper.find('.settings-header h2').text()).toContain('Settings')
  })

  it('should display appearance settings', () => {
    const appearanceSection = wrapper.find('.settings-section')
    expect(appearanceSection.text()).toContain('Appearance')
    
    expect(wrapper.find('select[v-model="localSettings.theme"]').exists()).toBe(true)
    expect(wrapper.find('select[v-model="localSettings.dateFormat"]').exists()).toBe(true)
  })

  it('should save settings to localStorage', async () => {
    const themeSelect = wrapper.find('select')
    await themeSelect.setValue('dark')
    await themeSelect.trigger('change')
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'finance-tracker-settings',
      expect.stringContaining('dark')
    )
  })

  it('should load settings from localStorage on mount', () => {
    expect(localStorage.getItem).toHaveBeenCalledWith('finance-tracker-settings')
  })

  it('should apply theme on settings change', async () => {
    const mockSetAttribute = vi.fn()
    document.documentElement.setAttribute = mockSetAttribute
    
    await wrapper.vm.saveSettings()
    
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', wrapper.vm.localSettings.theme)
  })

  it('should display app information', () => {
    const appInfo = wrapper.find('.app-info')
    expect(appInfo.exists()).toBe(true)
    
    expect(appInfo.text()).toContain('Version')
    expect(appInfo.text()).toContain('Database')
    expect(appInfo.text()).toContain('Current Currency')
    expect(appInfo.text()).toContain('Total Expenses')
    expect(appInfo.text()).toContain('Total Deposits')
    expect(appInfo.text()).toContain('Total Categories')
  })

  it('should display correct statistics', () => {
    expect(wrapper.vm.stats.totalExpenses).toBe(mockExpenses.length)
    expect(wrapper.vm.stats.totalCategories).toBe(mockCategories.length)
    expect(wrapper.vm.stats.totalDeposits).toBe(mockDeposits.length)
  })

  it('should show connected status when API is available', () => {
    expect(wrapper.vm.apiAvailable).toBe(true)
    expect(wrapper.find('.connected').exists()).toBe(true)
  })

  it('should show disconnected status when API is not available', async () => {
    mockStore.isConnected.value = false
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.apiAvailable).toBe(false)
    expect(wrapper.find('.disconnected').exists()).toBe(true)
  })

  it('should export data as CSV', async () => {
    // Mock URL.createObjectURL and document.createElement
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    const mockRevokeObjectURL = vi.fn()
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
    
    const mockClick = vi.fn()
    const mockAppendChild = vi.fn()
    const mockRemoveChild = vi.fn()
    const mockCreateElement = vi.fn().mockReturnValue({
      href: '',
      download: '',
      click: mockClick
    })
    
    document.createElement = mockCreateElement
    document.body.appendChild = mockAppendChild
    document.body.removeChild = mockRemoveChild
    
    await wrapper.vm.exportData('csv')
    
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(mockClick).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()
  })

  it('should export data as JSON', async () => {
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    const mockRevokeObjectURL = vi.fn()
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
    
    const mockClick = vi.fn()
    const mockCreateElement = vi.fn().mockReturnValue({
      href: '',
      download: '',
      click: mockClick
    })
    
    document.createElement = mockCreateElement
    
    await wrapper.vm.exportData('json')
    
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(mockClick).toHaveBeenCalled()
  })

  it('should show reset confirmation dialog', async () => {
    const resetButton = wrapper.find('.action-btn.danger')
    await resetButton.trigger('click')
    
    expect(wrapper.vm.showResetDialog).toBe(true)
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
  })

  it('should hide reset dialog when cancelled', async () => {
    wrapper.vm.showResetDialog = true
    await wrapper.vm.$nextTick()
    
    const cancelButton = wrapper.find('.btn.secondary')
    await cancelButton.trigger('click')
    
    expect(wrapper.vm.showResetDialog).toBe(false)
  })

  it('should clear all data when confirmed', async () => {
    wrapper.vm.showResetDialog = true
    await wrapper.vm.$nextTick()
    
    const confirmButton = wrapper.find('.btn.danger')
    await confirmButton.trigger('click')
    
    expect(mockStore.clearAllData).toHaveBeenCalled()
  })

  it('should not clear data when API is not available', async () => {
    mockStore.isConnected.value = false
    
    await wrapper.vm.resetAllData()
    
    expect(mockStore.clearAllData).not.toHaveBeenCalled()
    
    const { error } = mockUseToast()
    expect(error).toHaveBeenCalledWith('Cannot clear data: API server is not available')
  })

  it('should disable reset button when API not available', async () => {
    mockStore.isConnected.value = false
    await wrapper.vm.$nextTick()
    
    const resetButton = wrapper.find('.action-btn.danger')
    expect(resetButton.attributes('disabled')).toBeDefined()
    expect(resetButton.classes()).toContain('disabled')
  })

  it('should show loading overlay during operations', async () => {
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.loading-overlay').exists()).toBe(true)
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('should handle export errors gracefully', async () => {
    // Mock error during export
    const originalCreateObjectURL = global.URL.createObjectURL
    global.URL.createObjectURL = vi.fn().mockImplementation(() => {
      throw new Error('Export failed')
    })
    
    await wrapper.vm.exportData('csv')
    
    const { error } = mockUseToast()
    expect(error).toHaveBeenCalledWith('Export failed')
    
    // Restore original method
    global.URL.createObjectURL = originalCreateObjectURL
  })

  it('should call initialize and load data on mount', () => {
    expect(mockStore.initialize).toHaveBeenCalled()
    expect(mockStore.loadExpenses).toHaveBeenCalled()
    expect(mockStore.loadCategories).toHaveBeenCalled()
    expect(mockStore.loadDeposits).toHaveBeenCalled()
  })

  it('should handle theme application correctly', () => {
    const mockSetAttribute = vi.fn()
    document.documentElement.setAttribute = mockSetAttribute
    
    wrapper.vm.localSettings.theme = 'dark'
    wrapper.vm.applyTheme()
    
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark')
  })
})
