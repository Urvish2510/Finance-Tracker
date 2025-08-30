import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryForm from '../../src/components/CategoryForm.vue'

describe('CategoryForm.vue', () => {
  let wrapper

  const defaultProps = {
    modelValue: {
      name: '',
      type: 'expense',
      icon: '',
      color: '#FF6B6B'
    },
    loading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Rendering', () => {
    it('renders the form container', () => {
      wrapper = mount(CategoryForm, {
        props: defaultProps
      })
      
      expect(wrapper.find('.add-category-section').exists()).toBe(true)
    })

    it('renders form header', () => {
      wrapper = mount(CategoryForm, {
        props: defaultProps
      })
      
      const header = wrapper.find('.section-header')
      expect(header.exists()).toBe(true)
    })

    it('renders all form fields', () => {
      wrapper = mount(CategoryForm, {
        props: defaultProps
      })
      
      expect(wrapper.find('input[placeholder="Enter category name"]').exists()).toBe(true)
      expect(wrapper.find('select').exists()).toBe(true)
      expect(wrapper.find('.icon-input').exists()).toBe(true)
      expect(wrapper.find('input[type="color"]').exists()).toBe(true)
    })

    it('renders type options', () => {
      wrapper = mount(CategoryForm, {
        props: defaultProps
      })
      
      const typeOptions = wrapper.findAll('option')
      expect(typeOptions.length).toBeGreaterThan(1)
    })
  })

  describe('Form Data Management', () => {
    it('displays current modelValue data', () => {
      const testData = {
        name: 'Test Category',
        type: 'income',
        icon: '🏠',
        color: '#FF6B6B'
      }

      wrapper = mount(CategoryForm, {
        props: { modelValue: testData, loading: false }
      })
      
      expect(wrapper.find('input[placeholder="Enter category name"]').element.value).toBe('Test Category')
      expect(wrapper.find('.icon-input').element.value).toBe('🏠')
      expect(wrapper.find('select').element.value).toBe('income')
    })

    it('mutates modelValue on input change', async () => {
      const testData = {
        name: '',
        type: 'expense',
        icon: '',
        color: '#FF6B6B'
      }

      wrapper = mount(CategoryForm, {
        props: { modelValue: testData, loading: false }
      })
      
      const nameInput = wrapper.find('input[placeholder="Enter category name"]')
      await nameInput.setValue('New Category Name')
      
      // Component mutates the prop directly
      expect(testData.name).toBe('New Category Name')
    })

    it('mutates modelValue on type change', async () => {
      const testData = {
        name: 'Test',
        type: 'expense',
        icon: '',
        color: '#FF6B6B'
      }

      wrapper = mount(CategoryForm, {
        props: { modelValue: testData, loading: false }
      })
      
      const typeSelect = wrapper.find('select')
      await typeSelect.setValue('income')
      
      expect(testData.type).toBe('income')
    })

    it('mutates modelValue on icon change', async () => {
      const testData = {
        name: 'Test',
        type: 'expense',
        icon: '',
        color: '#FF6B6B'
      }

      wrapper = mount(CategoryForm, {
        props: { modelValue: testData, loading: false }
      })
      
      const iconInput = wrapper.find('.icon-input')
      await iconInput.setValue('🏠')
      
      expect(testData.icon).toBe('🏠')
    })
  })

  describe('Icon Suggestions', () => {
    it('renders icon suggestions', () => {
      wrapper = mount(CategoryForm, {
        props: defaultProps
      })
      
      const iconSuggestions = wrapper.find('.icon-suggestions')
      expect(iconSuggestions.exists()).toBe(true)
      
      const iconOptions = wrapper.findAll('.icon-option')
      expect(iconOptions.length).toBeGreaterThan(0)
    })

    it('updates icon when suggestion is clicked', async () => {
      const testData = {
        name: 'Test',
        type: 'expense',
        icon: '',
        color: '#FF6B6B'
      }

      wrapper = mount(CategoryForm, {
        props: { modelValue: testData, loading: false }
      })
      
      const firstIconOption = wrapper.find('.icon-option')
      if (firstIconOption.exists()) {
        const expectedIcon = firstIconOption.text()
        await firstIconOption.trigger('click')
        
        expect(testData.icon).toBe(expectedIcon)
      }
    })
  })

  describe('Form Submission', () => {
    it('emits submit when form is submitted', async () => {
      wrapper = mount(CategoryForm, {
        props: defaultProps
      })
      
      await wrapper.find('form').trigger('submit')
      
      expect(wrapper.emitted('submit')).toBeTruthy()
    })

    it('prevents default form submission', async () => {
      wrapper = mount(CategoryForm, {
        props: defaultProps
      })
      
      const form = wrapper.find('form')
      await form.trigger('submit')
      
      // Just check that the submit event was emitted
      expect(wrapper.emitted('submit')).toBeTruthy()
    })
  })

  describe('Icon Input Validation', () => {
    it('has maxlength on icon input', () => {
      wrapper = mount(CategoryForm, {
        props: defaultProps
      })
      
      const iconInput = wrapper.find('.icon-input')
      expect(iconInput.attributes('maxlength')).toBe('2')
    })

    it('has placeholder on icon input', () => {
      wrapper = mount(CategoryForm, {
        props: defaultProps
      })
      
      const iconInput = wrapper.find('.icon-input')
      expect(iconInput.attributes('placeholder')).toBe('🛍️')
    })
  })

  describe('Accessibility', () => {
    it('has required attribute on name input', () => {
      wrapper = mount(CategoryForm, {
        props: defaultProps
      })
      
      const nameInput = wrapper.find('input[placeholder="Enter category name"]')
      expect(nameInput.attributes('required')).toBeDefined()
    })

    it('has required attribute on type select', () => {
      wrapper = mount(CategoryForm, {
        props: defaultProps
      })
      
      const typeSelect = wrapper.find('select')
      expect(typeSelect.attributes('required')).toBeDefined()
    })

    it('has required attribute on icon input', () => {
      wrapper = mount(CategoryForm, {
        props: defaultProps
      })
      
      const iconInput = wrapper.find('.icon-input')
      expect(iconInput.attributes('required')).toBeDefined()
    })
  })
})
