import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { startIntegrationDb, stopIntegrationDb, clearIntegrationDb } from '../integration/setup.js'
import app from '../../server/server.js'

// Focused tests for new analytics time range query params
describe('Analytics summary time range selection', () => {
  beforeAll(async () => { await startIntegrationDb() })
  afterAll(async () => { await stopIntegrationDb() })
  beforeEach(async () => { await clearIntegrationDb() })

  async function seed(categoryId, model, entries) {
    for (const e of entries) {
      await request(app).post(`/api/${model}`).send({ ...e, categoryId }).expect(201)
    }
  }

  async function createCategory() {
    const res = await request(app).post('/api/categories').send({ name: 'General', color: '#000', icon: '📦' }).expect(201)
    return res.body._id
  }

  it('supports month filter', async () => {
    const cat = await createCategory()
    await seed(cat, 'deposits', [
      { amount: 1000, source: 'Salary', title: 'Salary', date: '2024-01-01' },
      { amount: 1100, source: 'Salary', title: 'Salary', date: '2024-02-01' }
    ])
    await seed(cat, 'expenses', [
      { amount: 100, title: 'Jan expense', description: 'Jan', date: '2024-01-10' },
      { amount: 200, title: 'Feb expense', description: 'Feb', date: '2024-02-10' }
    ])
    const jan = await request(app).get('/api/analytics/summary?month=2024-01').expect(200)
    expect(jan.body.totalIncome).toBe(1000)
    expect(jan.body.totalExpenses).toBe(100)
    expect(jan.body.range.month).toBe('2024-01')
  })

  it('supports custom start/end date range', async () => {
    const cat = await createCategory()
    await seed(cat, 'deposits', [
      { amount: 500, source: 'A', title: 'A', date: '2024-03-01' },
      { amount: 600, source: 'B', title: 'B', date: '2024-03-15' },
      { amount: 700, source: 'C', title: 'C', date: '2024-04-01' }
    ])
    await seed(cat, 'expenses', [
      { amount: 50, title: 'E1', description: 'E1', date: '2024-03-05' },
      { amount: 60, title: 'E2', description: 'E2', date: '2024-03-20' },
      { amount: 70, title: 'E3', description: 'E3', date: '2024-04-02' }
    ])
    const res = await request(app).get('/api/analytics/summary?startDate=2024-03-01&endDate=2024-03-31').expect(200)
    expect(res.body.totalIncome).toBe(1100) // first two deposits
    expect(res.body.totalExpenses).toBe(110) // first two expenses
    expect(res.body.range.startDate).toContain('2024-03-01')
    expect(res.body.range.endDate).toContain('2024-03-31')
  })

  it('supports rolling period', async () => {
    const cat = await createCategory()
    // Use dynamic dates near "now" so period window picks them up
    const now = new Date()
    const dFmt = d => d.toISOString().slice(0,10)
    const tenDaysAgo = new Date(now); tenDaysAgo.setDate(now.getDate()-10)
    const fiveDaysAgo = new Date(now); fiveDaysAgo.setDate(now.getDate()-5)
    await seed(cat, 'deposits', [
      { amount: 300, source: 'Recent1', title: 'Recent1', date: dFmt(tenDaysAgo) },
      { amount: 400, source: 'Recent2', title: 'Recent2', date: dFmt(fiveDaysAgo) }
    ])
    await seed(cat, 'expenses', [
      { amount: 30, title: 'R1', description: 'R1', date: dFmt(tenDaysAgo) },
      { amount: 40, title: 'R2', description: 'R2', date: dFmt(fiveDaysAgo) }
    ])
    const res = await request(app).get('/api/analytics/summary?period=month').expect(200)
    expect(res.body.totalIncome).toBe(700)
    expect(res.body.totalExpenses).toBe(70)
    expect(res.body.range.period).toBe('month')
  })

  it('rejects invalid combinations', async () => {
    const invalid = await request(app).get('/api/analytics/summary?period=decade').expect(400)
    expect(invalid.body.error).toBeDefined()
  })
})
