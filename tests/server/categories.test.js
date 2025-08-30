import { describe, it, expect, beforeEach } from 'vitest'
import { api, clearTestDb } from './setup.js'

describe('Categories API', () => {
  beforeEach(async () => {
    await clearTestDb()
  })

  describe('POST /api/categories', () => {
    it('creates a new category successfully', async () => {
      const categoryData = {
        name: 'Food',
        icon: '🍔',
        color: '#ff8800',
        type: 'expense'
      }

      const response = await api()
        .post('/api/categories')
        .send(categoryData)

      expect(response.status).toBe(201)
      expect(response.body.name).toBe('Food')
      expect(response.body.icon).toBe('🍔')
      expect(response.body.color).toBe('#ff8800')
      expect(response.body.type).toBe('expense')
    })

    it('creates income category', async () => {
      const categoryData = {
        name: 'Salary',
        icon: '💼',
        color: '#33aa55',
        type: 'income'
      }

      const response = await api()
        .post('/api/categories')
        .send(categoryData)

      expect(response.status).toBe(201)
      expect(response.body.type).toBe('income')
    })

    it('rejects duplicate category name for same type', async () => {
      const categoryData = {
        name: 'Transport',
        icon: '🚌',
        color: '#00aaee',
        type: 'expense'
      }

      await api().post('/api/categories').send(categoryData)
      
      const duplicateResponse = await api()
        .post('/api/categories')
        .send(categoryData)

      expect(duplicateResponse.status).toBe(400)
      expect(duplicateResponse.body.error).toContain('already exists')
    })

    it('allows same name for different types', async () => {
      const expenseCategory = {
        name: 'Bonus',
        icon: '💰',
        color: '#ffaa00',
        type: 'expense'
      }

      const incomeCategory = {
        name: 'Bonus',
        icon: '💰',
        color: '#ffaa00',
        type: 'income'
      }

      const response1 = await api().post('/api/categories').send(expenseCategory)
      const response2 = await api().post('/api/categories').send(incomeCategory)

      expect(response1.status).toBe(201)
      expect(response2.status).toBe(201)
    })

    it('validates required fields', async () => {
      const response = await api()
        .post('/api/categories')
        .send({ name: 'Test' })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('required')
    })
  })

  describe('GET /api/categories', () => {
    it('returns empty array when no categories', async () => {
      const response = await api().get('/api/categories')

      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
    })

    it('returns all categories', async () => {
      await api().post('/api/categories').send({
        name: 'Food',
        icon: '🍔',
        color: '#ff8800',
        type: 'expense'
      })

      await api().post('/api/categories').send({
        name: 'Transport',
        icon: '🚌',
        color: '#00aaee',
        type: 'expense'
      })

      const response = await api().get('/api/categories')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0].name).toBe('Food')
      expect(response.body[1].name).toBe('Transport')
    })

    it('filters categories by type', async () => {
      await api().post('/api/categories').send({
        name: 'Food',
        icon: '🍔',
        color: '#ff8800',
        type: 'expense'
      })

      await api().post('/api/categories').send({
        name: 'Salary',
        icon: '💼',
        color: '#33aa55',
        type: 'income'
      })

      const expenseResponse = await api().get('/api/categories?type=expense')
      const incomeResponse = await api().get('/api/categories?type=income')

      expect(expenseResponse.status).toBe(200)
      expect(expenseResponse.body).toHaveLength(1)
      expect(expenseResponse.body[0].type).toBe('expense')

      expect(incomeResponse.status).toBe(200)
      expect(incomeResponse.body).toHaveLength(1)
      expect(incomeResponse.body[0].type).toBe('income')
    })
  })

  describe('GET /api/categories/:id', () => {
    it('returns category by ID', async () => {
      const createResponse = await api().post('/api/categories').send({
        name: 'Food',
        icon: '🍔',
        color: '#ff8800',
        type: 'expense'
      })

      const response = await api().get(`/api/categories/${createResponse.body._id}`)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('Food')
    })

    it('returns 404 for non-existent category', async () => {
      const response = await api().get('/api/categories/507f1f77bcf86cd799439011')

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/categories/:id', () => {
    it('updates category successfully', async () => {
      const createResponse = await api().post('/api/categories').send({
        name: 'Food',
        icon: '🍔',
        color: '#ff8800',
        type: 'expense'
      })

      const updateData = {
        name: 'Meals',
        icon: '🍽️',
        color: '#ff6600',
        type: 'expense'
      }

      const response = await api()
        .put(`/api/categories/${createResponse.body._id}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('Meals')
      expect(response.body.icon).toBe('🍽️')
    })

    it('validates required fields on update', async () => {
      const createResponse = await api().post('/api/categories').send({
        name: 'Food',
        icon: '🍔',
        color: '#ff8800',
        type: 'expense'
      })

      const response = await api()
        .put(`/api/categories/${createResponse.body._id}`)
        .send({ name: 'Updated' })

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/categories/:id', () => {
    it('deletes category without expenses', async () => {
      const createResponse = await api().post('/api/categories').send({
        name: 'Food',
        icon: '🍔',
        color: '#ff8800',
        type: 'expense'
      })

      const response = await api().delete(`/api/categories/${createResponse.body._id}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toContain('deleted successfully')
    })

    it('prevents deletion of category with expenses', async () => {
      // First create a category
      const categoryResponse = await api().post('/api/categories').send({
        name: 'Food',
        icon: '🍔',
        color: '#ff8800',
        type: 'expense'
      })

      // Then create an expense with that category
      await api().post('/api/expenses').send({
        title: 'Lunch',
        amount: 25,
        category: categoryResponse.body._id,
        date: new Date().toISOString()
      })

      // Try to delete the category
      const response = await api().delete(`/api/categories/${categoryResponse.body._id}`)

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('has expenses')
    })
  })
})
