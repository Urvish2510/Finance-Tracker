import { describe, it, expect, beforeEach } from 'vitest'
import { api, clearTestDb } from './setup.js'

describe('Deposits API', () => {
  let categoryId
  
  beforeEach(async () => {
    await clearTestDb()
    
    // Create a test income category for deposits
    const categoryResponse = await api().post('/api/categories').send({
      name: 'Salary',
      icon: '💼',
      color: '#33aa55',
      type: 'income'
    })
    categoryId = categoryResponse.body._id
  })

  describe('POST /api/deposits', () => {
    it('creates a deposit successfully', async () => {
      const depositData = {
        title: 'Monthly Salary',
        amount: 5000,
        category: categoryId,
        date: new Date().toISOString(),
        description: 'Regular salary payment',
        currency: 'INR'
      }

      const response = await api()
        .post('/api/deposits')
        .send(depositData)

      expect(response.status).toBe(201)
      expect(response.body.title).toBe('Monthly Salary')
      expect(response.body.amount).toBe(5000)
      expect(response.body.category).toBeDefined()
      expect(response.body.category.name).toBe('Salary')
    })

    it('validates required fields', async () => {
      const response = await api()
        .post('/api/deposits')
        .send({ title: 'Test' })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('required')
    })

    it('validates positive amount', async () => {
      const response = await api()
        .post('/api/deposits')
        .send({
          title: 'Test',
          amount: -100,
          category: categoryId
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('positive')
    })

    it('validates category exists', async () => {
      const response = await api()
        .post('/api/deposits')
        .send({
          title: 'Test',
          amount: 100,
          category: '507f1f77bcf86cd799439011'
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Invalid category')
    })
  })

  describe('GET /api/deposits', () => {
    it('returns empty array when no deposits', async () => {
      const response = await api().get('/api/deposits')

      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
    })

    it('returns all deposits with category populated', async () => {
      await api().post('/api/deposits').send({
        title: 'Deposit 1',
        amount: 1000,
        category: categoryId
      })

      await api().post('/api/deposits').send({
        title: 'Deposit 2',
        amount: 1500,
        category: categoryId
      })

      const response = await api().get('/api/deposits')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0].category.name).toBe('Salary')
      expect(response.body[1].category.name).toBe('Salary')
    })

    it('sorts deposits by date descending', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const today = new Date()

      await api().post('/api/deposits').send({
        title: 'Yesterday Deposit',
        amount: 1000,
        category: categoryId,
        date: yesterday.toISOString()
      })

      await api().post('/api/deposits').send({
        title: 'Today Deposit',
        amount: 1500,
        category: categoryId,
        date: today.toISOString()
      })

      const response = await api().get('/api/deposits')

      expect(response.status).toBe(200)
      expect(response.body[0].title).toBe('Today Deposit')
      expect(response.body[1].title).toBe('Yesterday Deposit')
    })
  })

  describe('GET /api/deposits/:id', () => {
    it('returns deposit by ID', async () => {
      const createResponse = await api().post('/api/deposits').send({
        title: 'Test Deposit',
        amount: 2000,
        category: categoryId
      })

      const response = await api().get(`/api/deposits/${createResponse.body._id}`)

      expect(response.status).toBe(200)
      expect(response.body.title).toBe('Test Deposit')
      expect(response.body.category.name).toBe('Salary')
    })

    it('returns 404 for non-existent deposit', async () => {
      const response = await api().get('/api/deposits/507f1f77bcf86cd799439011')

      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/deposits/category/:categoryId', () => {
    it('returns deposits for specific category', async () => {
      // Create another income category
      const category2Response = await api().post('/api/categories').send({
        name: 'Bonus',
        icon: '💰',
        color: '#ffaa00',
        type: 'income'
      })

      await api().post('/api/deposits').send({
        title: 'Salary Deposit',
        amount: 5000,
        category: categoryId
      })

      await api().post('/api/deposits').send({
        title: 'Bonus Deposit',
        amount: 1000,
        category: category2Response.body._id
      })

      const response = await api().get(`/api/deposits/category/${categoryId}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].title).toBe('Salary Deposit')
    })
  })

  describe('GET /api/deposits/date-range', () => {
    it('returns deposits within date range', async () => {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      await api().post('/api/deposits').send({
        title: 'Old Deposit',
        amount: 1000,
        category: categoryId,
        date: twoDaysAgo.toISOString()
      })

      await api().post('/api/deposits').send({
        title: 'Recent Deposit',
        amount: 2000,
        category: categoryId,
        date: yesterday.toISOString()
      })

      const response = await api()
        .get('/api/deposits/date-range')
        .query({
          startDate: yesterday.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].title).toBe('Recent Deposit')
    })

    it('validates required date parameters', async () => {
      const response = await api().get('/api/deposits/date-range')

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('required')
    })
  })

  describe('PUT /api/deposits/:id', () => {
    it('updates deposit successfully', async () => {
      const createResponse = await api().post('/api/deposits').send({
        title: 'Original Title',
        amount: 3000,
        category: categoryId
      })

      const updateData = {
        title: 'Updated Title',
        amount: 3500,
        category: categoryId,
        description: 'Updated description',
        currency: 'USD'
      }

      const response = await api()
        .put(`/api/deposits/${createResponse.body._id}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.title).toBe('Updated Title')
      expect(response.body.amount).toBe(3500)
      expect(response.body.currency).toBe('USD')
    })

    it('returns 404 for non-existent deposit', async () => {
      const response = await api()
        .put('/api/deposits/507f1f77bcf86cd799439011')
        .send({
          title: 'Test',
          amount: 1000,
          category: categoryId
        })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/deposits/:id', () => {
    it('deletes deposit successfully', async () => {
      const createResponse = await api().post('/api/deposits').send({
        title: 'To Delete',
        amount: 1000,
        category: categoryId
      })

      const response = await api().delete(`/api/deposits/${createResponse.body._id}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toContain('deleted successfully')
    })

    it('returns 404 for non-existent deposit', async () => {
      const response = await api().delete('/api/deposits/507f1f77bcf86cd799439011')

      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/deposits/summary', () => {
    it('returns deposit summary', async () => {
      await api().post('/api/deposits').send({
        title: 'Deposit 1',
        amount: 3000,
        category: categoryId
      })

      await api().post('/api/deposits').send({
        title: 'Deposit 2',
        amount: 2000,
        category: categoryId
      })

      const response = await api().get('/api/deposits/summary')

      expect(response.status).toBe(200)
      expect(response.body.totalDeposits).toBe(5000)
      expect(response.body.depositCount).toBe(2)
      expect(response.body.categoryBreakdown).toBeDefined()
      expect(response.body.monthlyTotals).toBeDefined()
      expect(response.body.recentDeposits).toBeDefined()
    })

    it('returns correct category breakdown', async () => {
      // Create another income category
      const category2Response = await api().post('/api/categories').send({
        name: 'Bonus',
        icon: '💰',
        color: '#ffaa00',
        type: 'income'
      })

      await api().post('/api/deposits').send({
        title: 'Salary Deposit',
        amount: 5000,
        category: categoryId
      })

      await api().post('/api/deposits').send({
        title: 'Bonus Deposit',
        amount: 1000,
        category: category2Response.body._id
      })

      const response = await api().get('/api/deposits/summary')

      expect(response.status).toBe(200)
      
      const breakdown = response.body.categoryBreakdown
      const salaryCategory = Object.values(breakdown).find(cat => cat.name === 'Salary')
      const bonusCategory = Object.values(breakdown).find(cat => cat.name === 'Bonus')

      expect(salaryCategory.total).toBe(5000)
      expect(salaryCategory.count).toBe(1)
      expect(bonusCategory.total).toBe(1000)
      expect(bonusCategory.count).toBe(1)
    })
  })
})
