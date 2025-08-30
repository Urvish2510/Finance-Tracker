import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../../src/App.vue'

// Mock composables
const mockGlobalStore = {
  expenses: { value: [] },
  categories: { value: [] },
  deposits: { value: [] },
  loadExpenses: () => Promise.resolve([]),
  loadCategories: () => Promise.resolve([]),
  loadDeposits: () => Promise.resolve([])
}

const mockCurrency = {
  formatCurrency: (amount) => `₹${amount.toFixed(2)}`
}

const mockTheme = {
  isDark: { value: false },
  tokens: { value: {} },
  version: { value: 0 },
  toggle: () => {},
  setDark: () => {},
  refresh: () => {}
}

// Mock router
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Dashboard</div>' } },
    { path: '/expenses', component: { template: '<div>Expenses</div>' } },
    { path: '/deposits', component: { template: '<div>Deposits</div>' } },
    { path: '/categories', component: { template: '<div>Categories</div>' } },
    { path: '/analytics', component: { template: '<div>Analytics</div>' } },
    { path: '/settings', component: { template: '<div>Settings</div>' } }
  ]
})

// Mock API service
vi.mock('../../src/services/apiService.js', () => ({
  checkApiHealth: () => Promise.resolve(true)
}))

// Mock composables
vi.mock('../../src/composables/useGlobalStore.js', () => ({
  useGlobalStore: () => mockGlobalStore
}))

vi.mock('../../src/composables/useCurrency.js', () => ({
  useCurrency: () => mockCurrency
}))

vi.mock('../../src/composables/useTheme.js', () => ({
  useTheme: () => mockTheme
}))

describe('App.vue', () => {
  let wrapper

  beforeEach(() => {
    // Reset mocks
    mockTheme.isDark.value = false
    
    wrapper = mount(App, {
      global: {
        plugins: [mockRouter]
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Rendering', () => {
    it('renders the main application layout', () => {
      expect(wrapper.find('.app-layout').exists()).toBe(true)
      expect(wrapper.find('.sidebar').exists()).toBe(true)
      expect(wrapper.find('.main-content').exists()).toBe(true)
    })

    it('displays the application title', () => {
      expect(wrapper.find('.logo-text').text()).toBe('Finance Tracker')
    })

    it('renders navigation menu items', () => {
      const navItems = wrapper.findAll('.nav-item')
      expect(navItems).toHaveLength(6) // Dashboard, Expenses, Deposits, Categories, Analytics, Settings
      
      const navTexts = navItems.map(item => item.find('.nav-text').text())
      expect(navTexts).toContain('Dashboard')
      expect(navTexts).toContain('Expenses')
      expect(navTexts).toContain('Deposits')
      expect(navTexts).toContain('Categories')
      expect(navTexts).toContain('Analytics')
      expect(navTexts).toContain('Settings')
    })
  })

  describe('Sidebar Functionality', () => {
    it('toggles sidebar collapse', async () => {
      const toggleButton = wrapper.find('.sidebar-toggle')
      
      expect(wrapper.find('.sidebar').classes()).not.toContain('collapsed')
      
      await toggleButton.trigger('click')
      
      expect(wrapper.find('.sidebar').classes()).toContain('collapsed')
    })

    it('shows sidebar footer when not collapsed', () => {
      expect(wrapper.find('.sidebar-footer').exists()).toBe(true)
    })

    it('hides sidebar footer when collapsed', async () => {
      const toggleButton = wrapper.find('.sidebar-toggle')
      await toggleButton.trigger('click')
      
      expect(wrapper.find('.sidebar-footer').exists()).toBe(false)
    })
  })

  describe('Mobile Responsiveness', () => {
    it('shows mobile menu button', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      
      wrapper = mount(App, {
        global: {
          plugins: [mockRouter]
        }
      })
      
      expect(wrapper.find('.mobile-menu-btn').exists()).toBe(true)
    })

    it('shows mobile overlay when sidebar is open', async () => {
      // Simulate mobile and open sidebar
      const mobileButton = wrapper.find('.mobile-menu-btn')
      if (mobileButton.exists()) {
        await mobileButton.trigger('click')
        expect(wrapper.find('.mobile-overlay').exists()).toBe(true)
      }
    })
  })
})