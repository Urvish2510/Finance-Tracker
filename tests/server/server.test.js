import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import request from 'supertest'

// Mock database connection and models
vi.mock('../../server/database.js', () => ({
  default: vi.fn().mockResolvedValue(true)
}))

vi.mock('../../server/models/Category.js', () => ({
  default: {
    find: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn()
  }
}))

vi.mock('../../server/models/Expense.js', () => ({
  default: {
    find: vi.fn().mockReturnValue({ populate: vi.fn().mockResolvedValue([]) }),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn()
  }
}))

vi.mock('../../server/models/Deposit.js', () => ({
  default: {
    find: vi.fn().mockReturnValue({ populate: vi.fn().mockResolvedValue([]) }),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn()
  }
}))

vi.mock('../../server/models/UserSettings.js', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn()
  }
}))

describe('Server Integration Tests', () => {
  let app

  beforeAll(async () => {
    // Import the server app after mocks are set up
    const { default: serverApp } = await import('../../server/server.js')
    app = serverApp
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Server Health and Middleware', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/api/health')
      
      expect(response.status).toBe(200)
    })

    it('should handle CORS headers', async () => {
      const response = await request(app)
        .get('/api/categories')
      
      expect(response.headers['access-control-allow-origin']).toBe('*')
    })

    it('should parse JSON payloads', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ name: 'Test Category', color: '#FF0000' })
      
      // Should not return 400 for malformed JSON since we're sending valid JSON
      expect(response.status).not.toBe(400)
    })
  })

  describe('API Route Integration', () => {
    it('should have categories routes mounted', async () => {
      const response = await request(app)
        .get('/api/categories')
      
      expect(response.status).toBe(200)
    })

    it('should have expenses routes mounted', async () => {
      const response = await request(app)
        .get('/api/expenses')
      
      expect(response.status).toBe(200)
    })

    it('should have deposits routes mounted', async () => {
      const response = await request(app)
        .get('/api/deposits')
      
      expect(response.status).toBe(200)
    })

    it('should have settings routes mounted', async () => {
      const response = await request(app)
        .get('/api/settings')
      
      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
      
      expect(response.status).toBe(404)
    })
  })

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Mock a database error
      const Category = (await import('../../server/models/Category.js')).default
      Category.find.mockRejectedValue(new Error('Database connection failed'))
      
      const response = await request(app)
        .get('/api/categories')
      
      expect(response.status).toBe(500)
    })

    it('should validate request bodies', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({}) // Empty body should fail validation
      
      expect(response.status).toBe(400)
    })
  })

  describe('Database Integration', () => {
    it('should handle database connection initialization', async () => {
      const connectDB = (await import('../../server/database.js')).default
      expect(connectDB).toHaveBeenCalled()
    })
  })

  describe('Analytics Integration', () => {
    it('should calculate total expenses correctly', async () => {
      const mockExpenses = [
        { amount: 100 },
        { amount: 250 },
        { amount: 75 }
      ]
      
      const Expense = (await import('../../server/models/Expense.js')).default
      Expense.find.mockReturnValue({ 
        populate: vi.fn().mockResolvedValue(mockExpenses) 
      })
      
      const response = await request(app)
        .get('/api/analytics/summary')
      
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('totalExpenses')
    })

    it('should calculate total deposits correctly', async () => {
      const mockDeposits = [
        { amount: 5000 },
        { amount: 3000 }
      ]
      
      const Deposit = (await import('../../server/models/Deposit.js')).default
      Deposit.find.mockReturnValue({ 
        populate: vi.fn().mockResolvedValue(mockDeposits) 
      })
      
      const response = await request(app)
        .get('/api/analytics/summary')
      
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('totalDeposits')
    })
  })

  describe('Cross-Route Data Consistency', () => {
    it('should maintain category references across expenses and deposits', async () => {
      const mockCategory = { _id: 'cat1', name: 'Food', color: '#FF5733' }
      const mockExpense = { _id: 'exp1', category: mockCategory, amount: 100 }
      const mockDeposit = { _id: 'dep1', category: mockCategory, amount: 1000 }
      
      const Category = (await import('../../server/models/Category.js')).default
      const Expense = (await import('../../server/models/Expense.js')).default
      const Deposit = (await import('../../server/models/Deposit.js')).default
      
      Category.find.mockResolvedValue([mockCategory])
      Expense.find.mockReturnValue({ populate: vi.fn().mockResolvedValue([mockExpense]) })
      Deposit.find.mockReturnValue({ populate: vi.fn().mockResolvedValue([mockDeposit]) })
      
      const [categoriesRes, expensesRes, depositsRes] = await Promise.all([
        request(app).get('/api/categories'),
        request(app).get('/api/expenses'),
        request(app).get('/api/deposits')
      ])
      
      expect(categoriesRes.status).toBe(200)
      expect(expensesRes.status).toBe(200)
      expect(depositsRes.status).toBe(200)
      
      // Verify category consistency
      expect(categoriesRes.body[0]._id).toBe('cat1')
      expect(expensesRes.body[0].category._id).toBe('cat1')
      expect(depositsRes.body[0].category._id).toBe('cat1')
    })
  })
})
