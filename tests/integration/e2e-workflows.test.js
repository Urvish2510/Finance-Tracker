import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { startIntegrationDb, stopIntegrationDb, clearIntegrationDb } from './setup.js'
import app from '../../server/server.js'

// End-to-End workflow tests simulate complete user journeys
describe('🎯 End-to-End User Workflows', () => {
  beforeAll(async () => {
    await startIntegrationDb()
  })

  afterAll(async () => {
    await stopIntegrationDb()
  })

  beforeEach(async () => {
    await clearIntegrationDb()
  })

  describe('💰 Complete Finance Management Session', () => {
    it('should complete a full user session with income and expenses', async () => {
      // 1. Initialize user settings
      const settingsData = {
        currency: 'USD',
        budgetLimit: 2000,
        theme: 'light'
      }

      const settingsResponse = await request(app)
        .post('/api/settings')
        .send(settingsData)
        .expect(201)

      expect(settingsResponse.body.currency).toBe('USD')
      expect(settingsResponse.body.budgetLimit).toBe(2000)

      // 2. Set up expense categories
      const categories = [
        { name: 'Food', color: '#FF6B6B', icon: '🍔' },
        { name: 'Transport', color: '#4ECDC4', icon: '🚗' },
        { name: 'Entertainment', color: '#45B7D1', icon: '🎬' }
      ]

      const createdCategories = []
      for (const category of categories) {
        const response = await request(app)
          .post('/api/categories')
          .send(category)
          .expect(201)
        
        createdCategories.push(response.body)
      }

      // 3. Record monthly income deposits
      const deposits = [
        { amount: 3000, source: 'Salary', title: 'Salary', date: '2024-01-01', categoryId: createdCategories[0]._id },
        { amount: 500, source: 'Freelance', title: 'Freelance', date: '2024-01-15', categoryId: createdCategories[0]._id }
      ]

      let totalIncome = 0
      for (const deposit of deposits) {
        const response = await request(app)
          .post('/api/deposits')
          .send(deposit)
          .expect(201)
        
        totalIncome += deposit.amount
        expect(response.body.amount).toBe(deposit.amount)
      }

      // 4. Record various expenses
      const expenses = [
        { amount: 50, title: 'Grocery shopping', description: 'Grocery shopping', categoryId: createdCategories[0]._id, date: '2024-01-02' },
        { amount: 25, title: 'Bus ticket', description: 'Bus ticket', categoryId: createdCategories[1]._id, date: '2024-01-03' },
        { amount: 15, title: 'Movie ticket', description: 'Movie ticket', categoryId: createdCategories[2]._id, date: '2024-01-04' },
        { amount: 80, title: 'Restaurant dinner', description: 'Restaurant dinner', categoryId: createdCategories[0]._id, date: '2024-01-05' }
      ]

      let totalExpenses = 0
      for (const expense of expenses) {
        const response = await request(app)
          .post('/api/expenses')
          .send(expense)
          .expect(201)
        
        totalExpenses += expense.amount
        expect(response.body.amount).toBe(expense.amount)
        expect(response.body.categoryId).toBe(expense.categoryId)
      }

      // 5. Verify analytics data
      const analyticsResponse = await request(app)
        .get('/api/analytics/summary')
        .expect(200)

      expect(analyticsResponse.body.totalIncome).toBe(totalIncome)
      expect(analyticsResponse.body.totalExpenses).toBe(totalExpenses)
      expect(analyticsResponse.body.balance).toBe(totalIncome - totalExpenses)
  expect(analyticsResponse.body.categoryBreakdown).toHaveLength(3) // All three categories have expenses

      // 6. Check budget status
      const budgetResponse = await request(app)
        .get('/api/analytics/budget-status')
        .expect(200)

      expect(budgetResponse.body.budgetLimit).toBe(2000)
      expect(budgetResponse.body.currentExpenses).toBe(totalExpenses)
      expect(budgetResponse.body.remainingBudget).toBe(2000 - totalExpenses)
      expect(budgetResponse.body.isOverBudget).toBe(false)
    })
  })

  describe('📅 Multi-Month Tracking Workflow', () => {
    it('should handle data across multiple months', async () => {
      // Set up categories first
      const foodCategory = await request(app)
        .post('/api/categories')
        .send({ name: 'Food', color: '#FF6B6B', icon: '🍔' })
        .expect(201)

      // Record transactions across different months
      const januaryDeposits = [
        { amount: 3000, source: 'January Salary', title: 'January Salary', date: '2024-01-01', categoryId: foodCategory.body._id },
        { amount: 200, source: 'Bonus', title: 'Bonus', date: '2024-01-15', categoryId: foodCategory.body._id }
      ]

      const februaryDeposits = [
        { amount: 3200, source: 'February Salary', title: 'February Salary', date: '2024-02-01', categoryId: foodCategory.body._id },
        { amount: 150, source: 'Side Work', title: 'Side Work', date: '2024-02-15', categoryId: foodCategory.body._id }
      ]

      // Add January data
      for (const deposit of januaryDeposits) {
        await request(app)
          .post('/api/deposits')
          .send(deposit)
          .expect(201)
      }

      const januaryExpenses = [
        { amount: 400, title: 'January groceries', description: 'January groceries', categoryId: foodCategory.body._id, date: '2024-01-10' },
        { amount: 50, title: 'January dining', description: 'January dining', categoryId: foodCategory.body._id, date: '2024-01-20' }
      ]

      for (const expense of januaryExpenses) {
        await request(app)
          .post('/api/expenses')
          .send(expense)
          .expect(201)
      }

      // Add February data
      for (const deposit of februaryDeposits) {
        await request(app)
          .post('/api/deposits')
          .send(deposit)
          .expect(201)
      }

      const februaryExpenses = [
        { amount: 350, title: 'February groceries', description: 'February groceries', categoryId: foodCategory.body._id, date: '2024-02-10' },
        { amount: 75, title: 'February dining', description: 'February dining', categoryId: foodCategory.body._id, date: '2024-02-20' }
      ]

      for (const expense of februaryExpenses) {
        await request(app)
          .post('/api/expenses')
          .send(expense)
          .expect(201)
      }

      // Test month-specific filtering
      const januaryAnalytics = await request(app)
        .get('/api/analytics/summary?month=2024-01')
        .expect(200)

      expect(januaryAnalytics.body.totalIncome).toBe(3200) // Jan deposits
      expect(januaryAnalytics.body.totalExpenses).toBe(450) // Jan expenses

      const februaryAnalytics = await request(app)
        .get('/api/analytics/summary?month=2024-02')
        .expect(200)

      expect(februaryAnalytics.body.totalIncome).toBe(3350) // Feb deposits
      expect(februaryAnalytics.body.totalExpenses).toBe(425) // Feb expenses

      // Test overall summary
      const overallAnalytics = await request(app)
        .get('/api/analytics/summary')
        .expect(200)

      expect(overallAnalytics.body.totalIncome).toBe(6550) // All deposits
      expect(overallAnalytics.body.totalExpenses).toBe(875) // All expenses
    })
  })

  describe('💡 Budget Management Workflow', () => {
    it('should handle budget warnings and limit violations', async () => {
      // Set tight budget limit
      await request(app)
        .post('/api/settings')
        .send({ currency: 'USD', budgetLimit: 500, theme: 'light' })
        .expect(201)

      const category = await request(app)
        .post('/api/categories')
        .send({ name: 'Shopping', color: '#FF6B6B', icon: '🛒' })
        .expect(201)

      // Add income
      await request(app)
        .post('/api/deposits')
        .send({ amount: 2000, source: 'Income', title: 'Income', date: '2024-01-01', categoryId: category.body._id })
        .expect(201)

      // Gradually approach budget limit
      const expenses = [
  { amount: 200, title: 'Purchase 1', description: 'Purchase 1', categoryId: category.body._id, date: '2024-01-05' },
  { amount: 150, title: 'Purchase 2', description: 'Purchase 2', categoryId: category.body._id, date: '2024-01-10' },
  { amount: 100, title: 'Purchase 3', description: 'Purchase 3', categoryId: category.body._id, date: '2024-01-15' }
      ]

      for (const [index, expense] of expenses.entries()) {
        await request(app)
          .post('/api/expenses')
          .send(expense)
          .expect(201)

        // Check budget status after each expense
        const budgetStatus = await request(app)
          .get('/api/analytics/budget-status')
          .expect(200)

        if (index === 0) { // After first expense: 200/500
          expect(budgetStatus.body.remainingBudget).toBe(300)
          expect(budgetStatus.body.isOverBudget).toBe(false)
          expect(budgetStatus.body.warningLevel).toBe('safe')
        } else if (index === 1) { // After second expense: 350/500
          expect(budgetStatus.body.remainingBudget).toBe(150)
          expect(budgetStatus.body.isOverBudget).toBe(false)
          expect(budgetStatus.body.warningLevel).toBe('warning')
        } else if (index === 2) { // After third expense: 450/500
          expect(budgetStatus.body.remainingBudget).toBe(50)
          expect(budgetStatus.body.isOverBudget).toBe(false)
          expect(budgetStatus.body.warningLevel).toBe('critical')
        }
      }

      // Push over budget limit
      await request(app)
        .post('/api/expenses')
  .send({ amount: 100, title: 'Over budget purchase', description: 'Over budget purchase', categoryId: category.body._id, date: '2024-01-20' })
        .expect(201)

      const finalBudgetStatus = await request(app)
        .get('/api/analytics/budget-status')
        .expect(200)

      expect(finalBudgetStatus.body.remainingBudget).toBe(-50)
      expect(finalBudgetStatus.body.isOverBudget).toBe(true)
      expect(finalBudgetStatus.body.warningLevel).toBe('over')
    })
  })

  describe('🔄 Data Consistency Workflow', () => {
    it('should maintain consistency across CRUD operations', async () => {
      // Create initial data
      const category = await request(app)
        .post('/api/categories')
        .send({ name: 'Utilities', color: '#45B7D1', icon: '💡' })
        .expect(201)

      const deposit = await request(app)
        .post('/api/deposits')
        .send({ amount: 1000, source: 'Income', title: 'Income', date: '2024-01-01', categoryId: category.body._id })
        .expect(201)

      const expense = await request(app)
        .post('/api/expenses')
        .send({ amount: 100, title: 'Electric bill', description: 'Electric bill', categoryId: category.body._id, date: '2024-01-05' })
        .expect(201)

      // Verify initial analytics
      let analytics = await request(app)
        .get('/api/analytics/summary')
        .expect(200)

      expect(analytics.body.totalIncome).toBe(1000)
      expect(analytics.body.totalExpenses).toBe(100)
      expect(analytics.body.balance).toBe(900)

      // Update operations
      const updatedDeposit = await request(app)
        .put(`/api/deposits/${deposit.body._id}`)
        .send({ amount: 1200, source: 'Updated Income', date: '2024-01-01' })
        .expect(200)

      const updatedExpense = await request(app)
        .put(`/api/expenses/${expense.body._id}`)
  .send({ amount: 150, title: 'Updated Electric bill', description: 'Updated Electric bill', categoryId: category.body._id, date: '2024-01-05' })
        .expect(200)

      // Verify analytics reflect updates
      analytics = await request(app)
        .get('/api/analytics/summary')
        .expect(200)

      expect(analytics.body.totalIncome).toBe(1200)
      expect(analytics.body.totalExpenses).toBe(150)
      expect(analytics.body.balance).toBe(1050)

      // Delete operations
      await request(app)
        .delete(`/api/expenses/${expense.body._id}`)
        .expect(200)

      // Verify analytics reflect deletion
      analytics = await request(app)
        .get('/api/analytics/summary')
        .expect(200)

      expect(analytics.body.totalIncome).toBe(1200)
      expect(analytics.body.totalExpenses).toBe(0)
      expect(analytics.body.balance).toBe(1200)
      expect(analytics.body.categoryBreakdown).toHaveLength(0)

      // Verify data integrity - category should still exist
      const categories = await request(app)
        .get('/api/categories')
        .expect(200)

      expect(categories.body).toHaveLength(1)
      expect(categories.body[0].name).toBe('Utilities')
    })
  })

  describe('⚡ Error Recovery Workflow', () => {
    it('should handle and recover from various error scenarios', async () => {
      // Test invalid category creation
      const invalidCategory = await request(app)
        .post('/api/categories')
        .send({ name: '', color: 'invalid-color', icon: '' }) // Invalid data
        .expect(400)

      expect(invalidCategory.body.error).toBeDefined()

      // Create valid category for subsequent tests
      const validCategory = await request(app)
        .post('/api/categories')
        .send({ name: 'Transport', color: '#4ECDC4', icon: '🚗' })
        .expect(201)

      // Test expense with invalid category ID
      const invalidExpense = await request(app)
        .post('/api/expenses')
        .send({ 
          amount: 50, 
          description: 'Invalid expense', 
          categoryId: '507f1f77bcf86cd799439011', // Non-existent ObjectId
          date: '2024-01-01' 
        })
        .expect(400)

      expect(invalidExpense.body.error).toBeDefined()

      // Test negative amounts
      const negativeDeposit = await request(app)
        .post('/api/deposits')
        .send({ amount: -100, source: 'Invalid deposit', date: '2024-01-01' })
        .expect(400)

      const negativeExpense = await request(app)
        .post('/api/expenses')
        .send({ 
          amount: -50, 
          description: 'Invalid expense', 
          categoryId: validCategory.body._id,
          date: '2024-01-01' 
        })
        .expect(400)

      // Test operations on non-existent resources
      const nonExistentUpdate = await request(app)
        .put('/api/deposits/507f1f77bcf86cd799439011')
        .send({ amount: 100, source: 'Update attempt', date: '2024-01-01' })
        .expect(404)

      const nonExistentDelete = await request(app)
        .delete('/api/expenses/507f1f77bcf86cd799439011')
        .expect(404)

      // Verify system remains stable after errors
      const analytics = await request(app)
        .get('/api/analytics/summary')
        .expect(200)

      expect(analytics.body.totalIncome).toBe(0)
      expect(analytics.body.totalExpenses).toBe(0)
      expect(analytics.body.balance).toBe(0)

      // Verify valid operations still work after errors
      const validDeposit = await request(app)
        .post('/api/deposits')
  .send({ amount: 500, source: 'Recovery test', title: 'Recovery test', date: '2024-01-01', categoryId: validCategory.body._id })
        .expect(201)

      const validExpense = await request(app)
        .post('/api/expenses')
        .send({ 
          amount: 25, 
          title: 'Recovery expense',
          description: 'Recovery expense', 
          categoryId: validCategory.body._id,
          date: '2024-01-02' 
        })
        .expect(201)

      // Final verification
      const finalAnalytics = await request(app)
        .get('/api/analytics/summary')
        .expect(200)

      expect(finalAnalytics.body.totalIncome).toBe(500)
      expect(finalAnalytics.body.totalExpenses).toBe(25)
      expect(finalAnalytics.body.balance).toBe(475)
    })
  })

  describe('🎨 Settings and Preferences Workflow', () => {
    it('should handle user preference changes and their effects', async () => {
      // Test default settings retrieval
      const defaultSettings = await request(app)
        .get('/api/settings')
        .expect(200)

      // Should return default values if no settings exist
  expect(defaultSettings.body.currency).toBe('INR')
      expect(defaultSettings.body.theme).toBe('light')
      expect(defaultSettings.body.budgetLimit).toBe(1000)

      // Create custom settings
      const customSettings = await request(app)
        .post('/api/settings')
        .send({
          currency: 'EUR',
          budgetLimit: 1500,
          theme: 'dark',
          notifications: true,
          autoBackup: false
        })
        .expect(201)

      expect(customSettings.body.currency).toBe('EUR')
      expect(customSettings.body.budgetLimit).toBe(1500)

      // Test settings update
      const updatedSettings = await request(app)
        .put('/api/settings')
        .send({
          currency: 'GBP',
          budgetLimit: 2000,
          theme: 'dark',
          notifications: false,
          autoBackup: true
        })
        .expect(200)

      expect(updatedSettings.body.currency).toBe('GBP')
      expect(updatedSettings.body.budgetLimit).toBe(2000)

      // Add some expenses to test budget interaction
      const category = await request(app)
        .post('/api/categories')
        .send({ name: 'Test', color: '#FF6B6B', icon: '🔧' })
        .expect(201)

      await request(app)
        .post('/api/expenses')
        .send({ 
          amount: 1500, 
          description: 'Large expense', 
          categoryId: category.body._id,
          date: '2024-01-01' 
        })
        .expect(201)

      // Verify budget calculation uses updated limit
      const budgetStatus = await request(app)
        .get('/api/analytics/budget-status')
        .expect(200)

      expect(budgetStatus.body.budgetLimit).toBe(2000)
      expect(budgetStatus.body.remainingBudget).toBe(500)
      expect(budgetStatus.body.isOverBudget).toBe(false)

      // Test settings persistence
      const retrievedSettings = await request(app)
        .get('/api/settings')
        .expect(200)

      expect(retrievedSettings.body.currency).toBe('GBP')
      expect(retrievedSettings.body.budgetLimit).toBe(2000)
      expect(retrievedSettings.body.theme).toBe('dark')
    })
  })
})
