// Mock data for testing
export const mockCategories = [
  {
    _id: '1',
    name: 'Food & Dining',
    icon: '🍽️',
    color: '#FF6B6B',
    type: 'expense',
    budget: 5000,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '2',
    name: 'Transportation',
    icon: '🚗',
    color: '#4ECDC4',
    type: 'expense',
    budget: 3000,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '3',
    name: 'Salary',
    icon: '💰',
    color: '#45B7D1',
    type: 'income',
    budget: 0,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
]

export const mockExpenses = [
  {
    _id: 'exp1',
    title: 'Lunch at Restaurant',
    amount: 850,
    category: mockCategories[0],
    category_id: '1',
    date: '2024-08-20',
    description: 'Team lunch',
    createdAt: '2024-08-20T12:00:00.000Z'
  },
  {
    _id: 'exp2',
    title: 'Bus Ticket',
    amount: 50,
    category: mockCategories[1],
    category_id: '2',
    date: '2024-08-20',
    description: 'Daily commute',
    createdAt: '2024-08-20T08:00:00.000Z'
  }
]

export const mockDeposits = [
  {
    _id: 'dep1',
    title: 'Monthly Salary',
    amount: 75000,
    category: mockCategories[2],
    category_id: '3',
    date: '2024-08-01',
    description: 'Salary for August',
    createdAt: '2024-08-01T00:00:00.000Z'
  },
  {
    _id: 'dep2',
    title: 'Freelance Payment',
    amount: 15000,
    category: mockCategories[2],
    category_id: '3',
    date: '2024-08-15',
    description: 'Website development project',
    createdAt: '2024-08-15T10:00:00.000Z'
  }
]

export const mockSettings = {
  currency: 'INR',
  symbol: '₹',
  theme: 'light',
  dateFormat: 'DD/MM/YYYY'
}

// Mock API responses
export const mockApiResponses = {
  categories: {
    success: mockCategories,
    empty: [],
    error: { message: 'Failed to fetch categories' }
  },
  expenses: {
    success: mockExpenses,
    empty: [],
    error: { message: 'Failed to fetch expenses' }
  },
  deposits: {
    success: mockDeposits,
    empty: [],
    error: { message: 'Failed to fetch deposits' }
  },
  settings: {
    success: mockSettings,
    error: { message: 'Failed to fetch settings' }
  }
}

// Mock localStorage data
export const mockLocalStorageData = {
  'finance-tracker-global-store': JSON.stringify({
    categories: {
      data: mockCategories,
      timestamp: Date.now(),
      expires: Date.now() + 600000 // 10 minutes
    },
    expenses: {
      data: mockExpenses,
      timestamp: Date.now(),
      expires: Date.now() + 300000 // 5 minutes
    },
    deposits: {
      data: mockDeposits,
      timestamp: Date.now(),
      expires: Date.now() + 600000 // 10 minutes
    }
  }),
  'finance-tracker-settings': JSON.stringify(mockSettings)
}
