import { describe, it, expect, beforeEach } from 'vitest'
import { api, clearTestDb } from './setup.js'

describe('Expenses API', () => {
  let categoryId
  
  beforeEach(async () => {
    await clearTestDb()
    
    // Create a test category for expenses
    const categoryResponse = await api().post('/api/categories').send({
      name: 'Food',
      icon: '🍔',
      color: '#ff8800',
      type: 'expense'
    })
    categoryId = categoryResponse.body._id
  })

  describe('POST /api/expenses', () => {
    it('creates an expense successfully', async () => {
      const expenseData = {
        title: 'Lunch at Restaurant',
        amount: 25.50,
        category: categoryId,
        date: new Date().toISOString(),
        description: 'Team lunch',
        currency: 'INR'
      }

      const response = await api()
        .post('/api/expenses')
        .send(expenseData)

      expect(response.status).toBe(201)
      expect(response.body.title).toBe('Lunch at Restaurant')
      expect(response.body.amount).toBe(25.5)
      expect(response.body.category).toBeDefined()
      expect(response.body.category.name).toBe('Food')
    })

    it('validates required fields', async () => {
      const response = await api()
        .post('/api/expenses')
        .send({ title: 'Test' })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('required')
    })

    it('validates positive amount', async () => {
      const response = await api()
        .post('/api/expenses')
        .send({
          title: 'Test',
          amount: -10,
          category: categoryId
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('positive')
    })

    it('validates category exists', async () => {
      const response = await api()
        .post('/api/expenses')
        .send({
          title: 'Test',
          amount: 10,
          category: '507f1f77bcf86cd799439011'
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Invalid category')
    })

    it('uses default currency from settings', async () => {
      const response = await api()
        .post('/api/expenses')
        .send({
          title: 'Test Expense',
          amount: 100,
          category: categoryId
        })

      expect(response.status).toBe(201)
      expect(response.body.currency).toBe('INR')
    })
  })

  describe('GET /api/expenses', () => {
    it('returns empty array when no expenses', async () => {
      const response = await api().get('/api/expenses')

      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
    })

    it('returns all expenses with category populated', async () => {
      await api().post('/api/expenses').send({
        title: 'Expense 1',
        amount: 50,
        category: categoryId
      })

      await api().post('/api/expenses').send({
        title: 'Expense 2',
        amount: 75,
        category: categoryId
      })

      const response = await api().get('/api/expenses')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0].category.name).toBe('Food')
      expect(response.body[1].category.name).toBe('Food')
    })

    it('sorts expenses by date descending', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const today = new Date()

      await api().post('/api/expenses').send({
        title: 'Yesterday Expense',
        amount: 50,
        category: categoryId,
        date: yesterday.toISOString()
      })

      await api().post('/api/expenses').send({
        title: 'Today Expense',
        amount: 75,
        category: categoryId,
        date: today.toISOString()
      })

      const response = await api().get('/api/expenses')

      expect(response.status).toBe(200)
      expect(response.body[0].title).toBe('Today Expense')
      expect(response.body[1].title).toBe('Yesterday Expense')
    })
  })

  describe('GET /api/expenses/:id', () => {
    it('returns expense by ID', async () => {
      const createResponse = await api().post('/api/expenses').send({
        title: 'Test Expense',
        amount: 100,
        category: categoryId
      })

      const response = await api().get(`/api/expenses/${createResponse.body._id}`)

      expect(response.status).toBe(200)
      expect(response.body.title).toBe('Test Expense')
      expect(response.body.category.name).toBe('Food')
    })

    it('returns 404 for non-existent expense', async () => {
      const response = await api().get('/api/expenses/507f1f77bcf86cd799439011')

      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/expenses/category/:categoryId', () => {
    it('returns expenses for specific category', async () => {
      // Create another category
      const category2Response = await api().post('/api/categories').send({
        name: 'Transport',
        icon: '🚌',
        color: '#00aaee',
        type: 'expense'
      })

      await api().post('/api/expenses').send({
        title: 'Food Expense',
        amount: 50,
        category: categoryId
      })

      await api().post('/api/expenses').send({
        title: 'Transport Expense',
        amount: 25,
        category: category2Response.body._id
      })

      const response = await api().get(`/api/expenses/category/${categoryId}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].title).toBe('Food Expense')
    })
  })

  describe('GET /api/expenses/date-range', () => {
    it('returns expenses within date range', async () => {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      await api().post('/api/expenses').send({
        title: 'Old Expense',
        amount: 100,
        category: categoryId,
        date: twoDaysAgo.toISOString()
      })

      await api().post('/api/expenses').send({
        title: 'Recent Expense',
        amount: 50,
        category: categoryId,
        date: yesterday.toISOString()
      })

      const response = await api()
        .get('/api/expenses/date-range')
        .query({
          startDate: yesterday.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].title).toBe('Recent Expense')
    })

    it('validates required date parameters', async () => {
      const response = await api().get('/api/expenses/date-range')

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('required')
    })
  })

  describe('PUT /api/expenses/:id', () => {
    it('updates expense successfully', async () => {
      const createResponse = await api().post('/api/expenses').send({
        title: 'Original Title',
        amount: 100,
        category: categoryId
      })

      const updateData = {
        title: 'Updated Title',
        amount: 150,
        category: categoryId,
        description: 'Updated description',
        currency: 'USD'
      }

      const response = await api()
        .put(`/api/expenses/${createResponse.body._id}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.title).toBe('Updated Title')
      expect(response.body.amount).toBe(150)
      expect(response.body.currency).toBe('USD')
    })

    it('returns 404 for non-existent expense', async () => {
      const response = await api()
        .put('/api/expenses/507f1f77bcf86cd799439011')
        .send({
          title: 'Test',
          amount: 100,
          category: categoryId
        })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/expenses/:id', () => {
    it('deletes expense successfully', async () => {
      const createResponse = await api().post('/api/expenses').send({
        title: 'To Delete',
        amount: 100,
        category: categoryId
      })

      const response = await api().delete(`/api/expenses/${createResponse.body._id}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toContain('deleted successfully')
    })

    it('returns 404 for non-existent expense', async () => {
      const response = await api().delete('/api/expenses/507f1f77bcf86cd799439011')

      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/expenses/summary', () => {
    it('returns expense summary', async () => {
      await api().post('/api/expenses').send({
        title: 'Expense 1',
        amount: 100,
        category: categoryId
      })

      await api().post('/api/expenses').send({
        title: 'Expense 2',
        amount: 50,
        category: categoryId
      })

      const response = await api().get('/api/expenses/summary')

      expect(response.status).toBe(200)
      expect(response.body.totalExpenses).toBe(150)
      expect(response.body.expenseCount).toBe(2)
      expect(response.body.categoryBreakdown).toBeDefined()
      expect(response.body.monthlyTotals).toBeDefined()
      expect(response.body.recentExpenses).toBeDefined()
    })

    it('returns correct category breakdown', async () => {
      // Create another category
      const category2Response = await api().post('/api/categories').send({
        name: 'Transport',
        icon: '🚌',
        color: '#00aaee',
        type: 'expense'
      })

      await api().post('/api/expenses').send({
        title: 'Food Expense',
        amount: 100,
        category: categoryId
      })

      await api().post('/api/expenses').send({
        title: 'Transport Expense',
        amount: 25,
        category: category2Response.body._id
      })

      const response = await api().get('/api/expenses/summary')

      expect(response.status).toBe(200)
      
      const breakdown = response.body.categoryBreakdown
      const foodCategory = Object.values(breakdown).find(cat => cat.name === 'Food')
      const transportCategory = Object.values(breakdown).find(cat => cat.name === 'Transport')

      expect(foodCategory.total).toBe(100)
      expect(foodCategory.count).toBe(1)
      expect(transportCategory.total).toBe(25)
      expect(transportCategory.count).toBe(1)
    })
  })
})
