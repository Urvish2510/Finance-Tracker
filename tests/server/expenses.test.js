import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import expenseRoutes from '../../server/routes/expenses.js'
import { mockExpenses } from '../mocks/mockData.js'

// Mock the Expense model
vi.mock('../../server/models/Expense.js', () => ({
  default: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    deleteMany: vi.fn(),
    populate: vi.fn()
  }
}))

describe('Expenses API Routes', () => {
  let app
  let Expense

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Import the mocked Expense model
    Expense = (await import('../../server/models/Expense.js')).default
    
    // Set up Express app with routes
    app = express()
    app.use(express.json())
    app.use('/expenses', expenseRoutes)
  })

  describe('GET /expenses', () => {
    it('should return all expenses with populated categories', async () => {
      const mockPopulate = { populate: vi.fn().mockResolvedValue(mockExpenses) }
      Expense.find.mockReturnValue(mockPopulate)
      
      const response = await request(app)
        .get('/expenses')
        .expect(200)
      
      expect(response.body).toEqual(mockExpenses)
      expect(Expense.find).toHaveBeenCalledWith({})
      expect(mockPopulate.populate).toHaveBeenCalledWith('category')
    })

    it('should filter expenses by category', async () => {
      const filteredExpenses = mockExpenses.filter(exp => exp.category_id === '1')
      const mockPopulate = { populate: vi.fn().mockResolvedValue(filteredExpenses) }
      Expense.find.mockReturnValue(mockPopulate)
      
      const response = await request(app)
        .get('/expenses?category=1')
        .expect(200)
      
      expect(response.body).toEqual(filteredExpenses)
      expect(Expense.find).toHaveBeenCalledWith({ category: '1' })
    })

    it('should filter expenses by date range', async () => {
      const mockPopulate = { populate: vi.fn().mockResolvedValue(mockExpenses) }
      Expense.find.mockReturnValue(mockPopulate)
      
      await request(app)
        .get('/expenses?startDate=2024-08-01&endDate=2024-08-31')
        .expect(200)
      
      expect(Expense.find).toHaveBeenCalledWith({
        date: {
          $gte: '2024-08-01',
          $lte: '2024-08-31'
        }
      })
    })

    it('should handle database errors', async () => {
      const mockPopulate = { populate: vi.fn().mockRejectedValue(new Error('Database error')) }
      Expense.find.mockReturnValue(mockPopulate)
      
      await request(app)
        .get('/expenses')
        .expect(500)
    })
  })

  describe('GET /expenses/:id', () => {
    it('should return a specific expense', async () => {
      const mockPopulate = { populate: vi.fn().mockResolvedValue(mockExpenses[0]) }
      Expense.findById.mockReturnValue(mockPopulate)
      
      const response = await request(app)
        .get('/expenses/exp1')
        .expect(200)
      
      expect(response.body).toEqual(mockExpenses[0])
      expect(Expense.findById).toHaveBeenCalledWith('exp1')
    })

    it('should return 404 for non-existent expense', async () => {
      const mockPopulate = { populate: vi.fn().mockResolvedValue(null) }
      Expense.findById.mockReturnValue(mockPopulate)
      
      await request(app)
        .get('/expenses/999')
        .expect(404)
    })
  })

  describe('POST /expenses', () => {
    it('should create a new expense', async () => {
      const newExpense = {
        title: 'Coffee',
        amount: 150,
        category: '1',
        date: '2024-08-21',
        description: 'Morning coffee'
      }
      
      const createdExpense = { _id: 'exp3', ...newExpense }
      const mockPopulate = { populate: vi.fn().mockResolvedValue(createdExpense) }
      Expense.create.mockResolvedValue({ _id: 'exp3', ...newExpense })
      Expense.findById.mockReturnValue(mockPopulate)
      
      const response = await request(app)
        .post('/expenses')
        .send(newExpense)
        .expect(201)
      
      expect(response.body).toEqual(createdExpense)
      expect(Expense.create).toHaveBeenCalledWith(newExpense)
    })

    it('should validate required fields', async () => {
      const invalidExpense = {
        // missing required fields
        description: 'Test'
      }
      
      await request(app)
        .post('/expenses')
        .send(invalidExpense)
        .expect(400)
    })

    it('should handle validation errors', async () => {
      const newExpense = {
        title: 'Coffee',
        amount: 150,
        category: '1',
        date: '2024-08-21'
      }
      
      Expense.create.mockRejectedValue(new Error('Validation error'))
      
      await request(app)
        .post('/expenses')
        .send(newExpense)
        .expect(500)
    })
  })

  describe('PUT /expenses/:id', () => {
    it('should update an existing expense', async () => {
      const updatedExpense = { ...mockExpenses[0], amount: 900 }
      const mockPopulate = { populate: vi.fn().mockResolvedValue(updatedExpense) }
      Expense.findByIdAndUpdate.mockReturnValue(mockPopulate)
      
      const response = await request(app)
        .put('/expenses/exp1')
        .send({ amount: 900 })
        .expect(200)
      
      expect(response.body).toEqual(updatedExpense)
      expect(Expense.findByIdAndUpdate).toHaveBeenCalledWith(
        'exp1',
        { amount: 900 },
        { new: true, runValidators: true }
      )
    })

    it('should return 404 for non-existent expense', async () => {
      const mockPopulate = { populate: vi.fn().mockResolvedValue(null) }
      Expense.findByIdAndUpdate.mockReturnValue(mockPopulate)
      
      await request(app)
        .put('/expenses/999')
        .send({ amount: 900 })
        .expect(404)
    })
  })

  describe('DELETE /expenses/:id', () => {
    it('should delete an expense', async () => {
      Expense.findByIdAndDelete.mockResolvedValue(mockExpenses[0])
      
      await request(app)
        .delete('/expenses/exp1')
        .expect(200)
      
      expect(Expense.findByIdAndDelete).toHaveBeenCalledWith('exp1')
    })

    it('should return 404 for non-existent expense', async () => {
      Expense.findByIdAndDelete.mockResolvedValue(null)
      
      await request(app)
        .delete('/expenses/999')
        .expect(404)
    })
  })

  describe('DELETE /expenses/clear-all', () => {
    it('should delete all expenses', async () => {
      Expense.deleteMany.mockResolvedValue({ deletedCount: 5 })
      
      const response = await request(app)
        .delete('/expenses/clear-all')
        .expect(200)
      
      expect(response.body.message).toContain('All expenses deleted')
      expect(response.body.deletedCount).toBe(5)
      expect(Expense.deleteMany).toHaveBeenCalledWith({})
    })

    it('should handle deletion errors', async () => {
      Expense.deleteMany.mockRejectedValue(new Error('Deletion failed'))
      
      await request(app)
        .delete('/expenses/clear-all')
        .expect(500)
    })
  })
})
