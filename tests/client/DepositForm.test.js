import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DepositForm from '../../src/components/DepositForm.vue'

// Mock composables - if any are used in DepositForm
const mockToast = {
  success: vi.fn(),
  error: vi.fn()
}

vi.mock('../../src/composables/useToast.js', () => ({
  useToast: () => mockToast
}), { virtual: true })

describe('DepositForm.vue', () => {
  let wrapper

  const defaultProps = {
    modelValue: {
      title: '',
      amount: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    },
    categories: [
      { _id: '1', name: 'Salary', icon: '💼' },
      { _id: '2', name: 'Business', icon: '💰' }
    ],
    saving: false,
    editing: false
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
      wrapper = mount(DepositForm, {
        props: defaultProps
      })
      
      expect(wrapper.find('.form-container').exists()).toBe(true)
      expect(wrapper.find('.deposit-form').exists()).toBe(true)
    })

    it('renders form in create mode', () => {
      wrapper = mount(DepositForm, {
        props: defaultProps
      })
      
      expect(wrapper.find('.form-header h3').text()).toBe('Add Deposit')
    })

    it('renders form in edit mode', () => {
      const editProps = {
        ...defaultProps,
        editing: true
      }

      wrapper = mount(DepositForm, {
        props: editProps
      })
      
      expect(wrapper.find('.form-header h3').text()).toBe('Edit Deposit')
    })

    it('renders all form fields', () => {
      wrapper = mount(DepositForm, {
        props: defaultProps
      })
      
      expect(wrapper.find('#dep-title').exists()).toBe(true)
      expect(wrapper.find('#dep-amount').exists()).toBe(true)
      expect(wrapper.find('#dep-category').exists()).toBe(true)
      expect(wrapper.find('#dep-date').exists()).toBe(true)
      expect(wrapper.find('#dep-description').exists()).toBe(true)
    })

    it('renders category options', () => {
      wrapper = mount(DepositForm, {
        props: defaultProps
      })
      
      const categorySelect = wrapper.find('#dep-category')
      expect(categorySelect.exists()).toBe(true)
      
      const options = categorySelect.findAll('option')
      expect(options).toHaveLength(3) // Default + 2 categories
      expect(options[1].text()).toContain('💼 Salary')
      expect(options[2].text()).toContain('💰 Business')
    })
  })

  describe('Form Interaction', () => {
    it('emits update:modelValue on input change', async () => {
      wrapper = mount(DepositForm, {
        props: defaultProps
      })
      
      const titleInput = wrapper.find('#dep-title')
      await titleInput.setValue('Test Salary')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('emits cancel when cancel button clicked', async () => {
      wrapper = mount(DepositForm, {
        props: defaultProps
      })
      
      await wrapper.find('.btn-secondary').trigger('click')
      
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('emits cancel when close button clicked', async () => {
      wrapper = mount(DepositForm, {
        props: defaultProps
      })
      
      await wrapper.find('.close-btn').trigger('click')
      
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('shows saving state on submit button', () => {
      const savingProps = {
        ...defaultProps,
        saving: true
      }

      wrapper = mount(DepositForm, {
        props: savingProps
      })
      
      const submitButton = wrapper.find('.btn-primary')
      expect(submitButton.attributes('disabled')).toBeDefined()
      expect(submitButton.text()).toContain('Saving...')
    })
  })

  describe('Form Submission', () => {
    it('emits submit when form is submitted with valid data', async () => {
      const validModelValue = {
        title: 'Test Salary',
        amount: '5000',
        categoryId: '1',
        date: '2024-01-01',
        description: 'Monthly salary'
      }

      wrapper = mount(DepositForm, {
        props: {
          ...defaultProps,
          modelValue: validModelValue
        }
      })
      
      await wrapper.find('.deposit-form').trigger('submit')
      
      expect(wrapper.emitted('submit')).toBeTruthy()
    })

    it('does not emit submit when required fields are missing', async () => {
      const invalidModelValue = {
        title: '',
        amount: '',
        categoryId: '',
        date: '',
        description: ''
      }

      wrapper = mount(DepositForm, {
        props: {
          ...defaultProps,
          modelValue: invalidModelValue
        }
      })
      
      await wrapper.find('.deposit-form').trigger('submit')
      
      expect(wrapper.emitted('submit')).toBeFalsy()
    })
  })

  describe('Props Watching', () => {
    it('updates local data when modelValue prop changes', async () => {
      wrapper = mount(DepositForm, {
        props: defaultProps
      })
      
      const newModelValue = {
        title: 'New Title',
        amount: '1000',
        categoryId: '2',
        date: '2024-01-01',
        description: 'New description'
      }
      
      await wrapper.setProps({ modelValue: newModelValue })
      
      expect(wrapper.find('#dep-title').element.value).toBe('New Title')
      expect(wrapper.find('#dep-amount').element.value).toBe('1000')
    })
  })

  describe('Button States', () => {
    it('shows correct button text in create mode', () => {
      wrapper = mount(DepositForm, {
        props: defaultProps
      })
      
      expect(wrapper.find('.btn-primary').text()).toBe('Add Deposit')
    })

    it('shows correct button text in edit mode', () => {
      const editProps = {
        ...defaultProps,
        editing: true
      }

      wrapper = mount(DepositForm, {
        props: editProps
      })
      
      expect(wrapper.find('.btn-primary').text()).toBe('Update Deposit')
    })
  })
})
