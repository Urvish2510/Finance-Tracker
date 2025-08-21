import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import categoryRoutes from '../../server/routes/categories.js'
import { mockCategories } from '../mocks/mockData.js'

// Mock the Category model
vi.mock('../../server/models/Category.js', () => ({
  default: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    deleteMany: vi.fn()
  }
}))

describe('Categories API Routes', () => {
  let app
  let Category

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Import the mocked Category model
    Category = (await import('../../server/models/Category.js')).default
    
    // Set up Express app with routes
    app = express()
    app.use(express.json())
    app.use('/categories', categoryRoutes)
  })

  describe('GET /categories', () => {
    it('should return all categories', async () => {
      Category.find.mockResolvedValue(mockCategories)
      
      const response = await request(app)
        .get('/categories')
        .expect(200)
      
      expect(response.body).toEqual(mockCategories)
      expect(Category.find).toHaveBeenCalledWith({})
    })

    it('should filter categories by type', async () => {
      const expenseCategories = mockCategories.filter(cat => cat.type === 'expense')
      Category.find.mockResolvedValue(expenseCategories)
      
      const response = await request(app)
        .get('/categories?type=expense')
        .expect(200)
      
      expect(response.body).toEqual(expenseCategories)
      expect(Category.find).toHaveBeenCalledWith({ type: 'expense' })
    })

    it('should handle database errors', async () => {
      Category.find.mockRejectedValue(new Error('Database error'))
      
      await request(app)
        .get('/categories')
        .expect(500)
    })
  })

  describe('GET /categories/:id', () => {
    it('should return a specific category', async () => {
      Category.findById.mockResolvedValue(mockCategories[0])
      
      const response = await request(app)
        .get('/categories/1')
        .expect(200)
      
      expect(response.body).toEqual(mockCategories[0])
      expect(Category.findById).toHaveBeenCalledWith('1')
    })

    it('should return 404 for non-existent category', async () => {
      Category.findById.mockResolvedValue(null)
      
      await request(app)
        .get('/categories/999')
        .expect(404)
    })
  })

  describe('POST /categories', () => {
    it('should create a new category', async () => {
      const newCategory = {
        name: 'Entertainment',
        icon: '🎬',
        color: '#FF9F43',
        type: 'expense',
        budget: 2000
      }
      
      const createdCategory = { _id: '4', ...newCategory }
      Category.create.mockResolvedValue(createdCategory)
      
      const response = await request(app)
        .post('/categories')
        .send(newCategory)
        .expect(201)
      
      expect(response.body).toEqual(createdCategory)
      expect(Category.create).toHaveBeenCalledWith(newCategory)
    })

    it('should validate required fields', async () => {
      const invalidCategory = {
        // missing required fields
        color: '#FF9F43'
      }
      
      await request(app)
        .post('/categories')
        .send(invalidCategory)
        .expect(400)
    })

    it('should handle validation errors', async () => {
      const newCategory = {
        name: 'Entertainment',
        icon: '🎬',
        color: '#FF9F43',
        type: 'expense',
        budget: 2000
      }
      
      Category.create.mockRejectedValue(new Error('Validation error'))
      
      await request(app)
        .post('/categories')
        .send(newCategory)
        .expect(500)
    })
  })

  describe('PUT /categories/:id', () => {
    it('should update an existing category', async () => {
      const updatedCategory = { ...mockCategories[0], name: 'Updated Food' }
      Category.findByIdAndUpdate.mockResolvedValue(updatedCategory)
      
      const response = await request(app)
        .put('/categories/1')
        .send({ name: 'Updated Food' })
        .expect(200)
      
      expect(response.body).toEqual(updatedCategory)
      expect(Category.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { name: 'Updated Food' },
        { new: true, runValidators: true }
      )
    })

    it('should return 404 for non-existent category', async () => {
      Category.findByIdAndUpdate.mockResolvedValue(null)
      
      await request(app)
        .put('/categories/999')
        .send({ name: 'Updated' })
        .expect(404)
    })
  })

  describe('DELETE /categories/:id', () => {
    it('should delete a category', async () => {
      Category.findByIdAndDelete.mockResolvedValue(mockCategories[0])
      
      await request(app)
        .delete('/categories/1')
        .expect(200)
      
      expect(Category.findByIdAndDelete).toHaveBeenCalledWith('1')
    })

    it('should return 404 for non-existent category', async () => {
      Category.findByIdAndDelete.mockResolvedValue(null)
      
      await request(app)
        .delete('/categories/999')
        .expect(404)
    })
  })

  describe('DELETE /categories/clear-all', () => {
    it('should delete all categories', async () => {
      Category.deleteMany.mockResolvedValue({ deletedCount: 3 })
      
      const response = await request(app)
        .delete('/categories/clear-all')
        .expect(200)
      
      expect(response.body.message).toContain('All categories deleted')
      expect(response.body.deletedCount).toBe(3)
      expect(Category.deleteMany).toHaveBeenCalledWith({})
    })

    it('should handle deletion errors', async () => {
      Category.deleteMany.mockRejectedValue(new Error('Deletion failed'))
      
      await request(app)
        .delete('/categories/clear-all')
        .expect(500)
    })
  })
})
