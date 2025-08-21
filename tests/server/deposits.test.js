import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import depositRoutes from '../../server/routes/deposits.js'
import { mockDeposits } from '../mocks/mockData.js'

// Mock the Deposit model
vi.mock('../../server/models/Deposit.js', () => ({
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

describe('Deposits API Routes', () => {
  let app
  let Deposit

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Import the mocked Deposit model
    Deposit = (await import('../../server/models/Deposit.js')).default
    
    // Set up Express app with routes
    app = express()
    app.use(express.json())
    app.use('/deposits', depositRoutes)
  })

  describe('GET /deposits', () => {
    it('should return all deposits with populated categories', async () => {
      const mockPopulate = { populate: vi.fn().mockResolvedValue(mockDeposits) }
      Deposit.find.mockReturnValue(mockPopulate)
      
      const response = await request(app)
        .get('/deposits')
        .expect(200)
      
      expect(response.body).toEqual(mockDeposits)
      expect(Deposit.find).toHaveBeenCalledWith({})
      expect(mockPopulate.populate).toHaveBeenCalledWith('category')
    })

    it('should filter deposits by category', async () => {
      const filteredDeposits = mockDeposits.filter(dep => dep.category_id === '3')
      const mockPopulate = { populate: vi.fn().mockResolvedValue(filteredDeposits) }
      Deposit.find.mockReturnValue(mockPopulate)
      
      const response = await request(app)
        .get('/deposits?category=3')
        .expect(200)
      
      expect(response.body).toEqual(filteredDeposits)
      expect(Deposit.find).toHaveBeenCalledWith({ category: '3' })
    })

    it('should filter deposits by date range', async () => {
      const mockPopulate = { populate: vi.fn().mockResolvedValue(mockDeposits) }
      Deposit.find.mockReturnValue(mockPopulate)
      
      await request(app)
        .get('/deposits?startDate=2024-08-01&endDate=2024-08-31')
        .expect(200)
      
      expect(Deposit.find).toHaveBeenCalledWith({
        date: {
          $gte: '2024-08-01',
          $lte: '2024-08-31'
        }
      })
    })

    it('should handle database errors', async () => {
      const mockPopulate = { populate: vi.fn().mockRejectedValue(new Error('Database error')) }
      Deposit.find.mockReturnValue(mockPopulate)
      
      await request(app)
        .get('/deposits')
        .expect(500)
    })
  })

  describe('GET /deposits/:id', () => {
    it('should return a specific deposit', async () => {
      const mockPopulate = { populate: vi.fn().mockResolvedValue(mockDeposits[0]) }
      Deposit.findById.mockReturnValue(mockPopulate)
      
      const response = await request(app)
        .get('/deposits/dep1')
        .expect(200)
      
      expect(response.body).toEqual(mockDeposits[0])
      expect(Deposit.findById).toHaveBeenCalledWith('dep1')
    })

    it('should return 404 for non-existent deposit', async () => {
      const mockPopulate = { populate: vi.fn().mockResolvedValue(null) }
      Deposit.findById.mockReturnValue(mockPopulate)
      
      await request(app)
        .get('/deposits/999')
        .expect(404)
    })
  })

  describe('POST /deposits', () => {
    it('should create a new deposit', async () => {
      const newDeposit = {
        title: 'Bonus',
        amount: 10000,
        category: '3',
        date: '2024-08-21',
        description: 'Performance bonus'
      }
      
      const createdDeposit = { _id: 'dep3', ...newDeposit }
      const mockPopulate = { populate: vi.fn().mockResolvedValue(createdDeposit) }
      Deposit.create.mockResolvedValue({ _id: 'dep3', ...newDeposit })
      Deposit.findById.mockReturnValue(mockPopulate)
      
      const response = await request(app)
        .post('/deposits')
        .send(newDeposit)
        .expect(201)
      
      expect(response.body).toEqual(createdDeposit)
      expect(Deposit.create).toHaveBeenCalledWith(newDeposit)
    })

    it('should validate required fields', async () => {
      const invalidDeposit = {
        // missing required fields
        description: 'Test'
      }
      
      await request(app)
        .post('/deposits')
        .send(invalidDeposit)
        .expect(400)
    })

    it('should handle validation errors', async () => {
      const newDeposit = {
        title: 'Bonus',
        amount: 10000,
        category: '3',
        date: '2024-08-21'
      }
      
      Deposit.create.mockRejectedValue(new Error('Validation error'))
      
      await request(app)
        .post('/deposits')
        .send(newDeposit)
        .expect(500)
    })
  })

  describe('PUT /deposits/:id', () => {
    it('should update an existing deposit', async () => {
      const updatedDeposit = { ...mockDeposits[0], amount: 80000 }
      const mockPopulate = { populate: vi.fn().mockResolvedValue(updatedDeposit) }
      Deposit.findByIdAndUpdate.mockReturnValue(mockPopulate)
      
      const response = await request(app)
        .put('/deposits/dep1')
        .send({ amount: 80000 })
        .expect(200)
      
      expect(response.body).toEqual(updatedDeposit)
      expect(Deposit.findByIdAndUpdate).toHaveBeenCalledWith(
        'dep1',
        { amount: 80000 },
        { new: true, runValidators: true }
      )
    })

    it('should return 404 for non-existent deposit', async () => {
      const mockPopulate = { populate: vi.fn().mockResolvedValue(null) }
      Deposit.findByIdAndUpdate.mockReturnValue(mockPopulate)
      
      await request(app)
        .put('/deposits/999')
        .send({ amount: 80000 })
        .expect(404)
    })
  })

  describe('DELETE /deposits/:id', () => {
    it('should delete a deposit', async () => {
      Deposit.findByIdAndDelete.mockResolvedValue(mockDeposits[0])
      
      await request(app)
        .delete('/deposits/dep1')
        .expect(200)
      
      expect(Deposit.findByIdAndDelete).toHaveBeenCalledWith('dep1')
    })

    it('should return 404 for non-existent deposit', async () => {
      Deposit.findByIdAndDelete.mockResolvedValue(null)
      
      await request(app)
        .delete('/deposits/999')
        .expect(404)
    })
  })

  describe('DELETE /deposits/clear-all', () => {
    it('should delete all deposits', async () => {
      Deposit.deleteMany.mockResolvedValue({ deletedCount: 2 })
      
      const response = await request(app)
        .delete('/deposits/clear-all')
        .expect(200)
      
      expect(response.body.message).toContain('All deposits deleted')
      expect(response.body.deletedCount).toBe(2)
      expect(Deposit.deleteMany).toHaveBeenCalledWith({})
    })

    it('should handle deletion errors', async () => {
      Deposit.deleteMany.mockRejectedValue(new Error('Deletion failed'))
      
      await request(app)
        .delete('/deposits/clear-all')
        .expect(500)
    })
  })
})
