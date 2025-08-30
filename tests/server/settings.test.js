import { describe, it, expect, beforeEach } from 'vitest'
import { api, clearTestDb } from './setup.js'

describe('Settings API', () => {
  beforeEach(async () => {
    await clearTestDb()
  })

  describe('GET /api/settings', () => {
    it('returns default settings when none exist', async () => {
      const response = await api().get('/api/settings')

      expect(response.status).toBe(200)
      expect(response.body.userId).toBe('default')
      expect(response.body.currency).toBe('INR')
      expect(response.body.currencySymbol).toBe('₹')
      expect(response.body.dateFormat).toBe('DD/MM/YYYY')
      expect(response.body.theme).toBe('light')
    })

    it('returns existing settings', async () => {
      // First create settings by updating
      await api().put('/api/settings').send({
        currency: 'USD',
        currencySymbol: '$',
        theme: 'dark'
      })

      const response = await api().get('/api/settings')

      expect(response.status).toBe(200)
      expect(response.body.currency).toBe('USD')
      expect(response.body.currencySymbol).toBe('$')
      expect(response.body.theme).toBe('dark')
    })
  })

  describe('PUT /api/settings', () => {
    it('creates new settings if none exist', async () => {
      const settingsData = {
        currency: 'EUR',
        currencySymbol: '€',
        dateFormat: 'MM/DD/YYYY',
        theme: 'dark'
      }

      const response = await api()
        .put('/api/settings')
        .send(settingsData)

      expect(response.status).toBe(200)
      expect(response.body.currency).toBe('EUR')
      expect(response.body.currencySymbol).toBe('€')
      expect(response.body.dateFormat).toBe('MM/DD/YYYY')
      expect(response.body.theme).toBe('dark')
    })

    it('updates existing settings', async () => {
      // Create initial settings
      await api().put('/api/settings').send({
        currency: 'USD',
        theme: 'light'
      })

      // Update settings
      const updateData = {
        currency: 'GBP',
        currencySymbol: '£',
        theme: 'dark'
      }

      const response = await api()
        .put('/api/settings')
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.currency).toBe('GBP')
      expect(response.body.currencySymbol).toBe('£')
      expect(response.body.theme).toBe('dark')
    })

    it('partially updates settings', async () => {
      // Create initial settings
      await api().put('/api/settings').send({
        currency: 'USD',
        theme: 'light',
        dateFormat: 'DD/MM/YYYY'
      })

      // Update only currency
      const response = await api()
        .put('/api/settings')
        .send({ currency: 'CAD' })

      expect(response.status).toBe(200)
      expect(response.body.currency).toBe('CAD')
      expect(response.body.theme).toBe('light') // Should remain unchanged
      expect(response.body.dateFormat).toBe('DD/MM/YYYY') // Should remain unchanged
    })

    it('handles empty update gracefully', async () => {
      const response = await api()
        .put('/api/settings')
        .send({})

      expect(response.status).toBe(200)
      // Should create default settings
      expect(response.body.currency).toBe('INR')
      expect(response.body.theme).toBe('light')
    })
  })

  describe('GET /api/settings/currency', () => {
    it('returns currency info with default settings', async () => {
      const response = await api().get('/api/settings/currency')

      expect(response.status).toBe(200)
      expect(response.body.current).toBeDefined()
      expect(response.body.current.code).toBe('INR')
      expect(response.body.current.symbol).toBe('₹')
      expect(response.body.current.name).toBe('Indian Rupee')
      expect(response.body.available).toBeDefined()
      expect(response.body.settings).toBeDefined()
    })

    it('returns currency info with custom settings', async () => {
      // Set custom currency
      await api().put('/api/settings').send({
        currency: 'USD',
        currencySymbol: '$'
      })

      const response = await api().get('/api/settings/currency')

      expect(response.status).toBe(200)
      expect(response.body.current.code).toBe('USD')
      expect(response.body.current.symbol).toBe('$')
      expect(response.body.current.name).toBe('US Dollar')
    })

    it('includes all available currencies', async () => {
      const response = await api().get('/api/settings/currency')

      expect(response.status).toBe(200)
      
      const available = response.body.available
      expect(available.INR).toBeDefined()
      expect(available.USD).toBeDefined()
      expect(available.EUR).toBeDefined()
      expect(available.GBP).toBeDefined()
      expect(available.JPY).toBeDefined()
      expect(available.CAD).toBeDefined()
      expect(available.AUD).toBeDefined()
      expect(available.SGD).toBeDefined()
      expect(available.CNY).toBeDefined()
      expect(available.KRW).toBeDefined()
    })

    it('falls back to INR for unknown currency', async () => {
      // Manually set an invalid currency in DB (this would normally not happen via API)
      await api().put('/api/settings').send({
        currency: 'INVALID'
      })

      const response = await api().get('/api/settings/currency')

      expect(response.status).toBe(200)
      // Should fall back to INR mapping
      expect(response.body.current.code).toBe('INR')
      expect(response.body.current.symbol).toBe('₹')
    })
  })

  describe('Settings validation', () => {
    it('accepts valid currency codes', async () => {
      const validCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD', 'CNY', 'KRW']
      
      for (const currency of validCurrencies) {
        const response = await api()
          .put('/api/settings')
          .send({ currency })

        expect(response.status).toBe(200)
        expect(response.body.currency).toBe(currency)
      }
    })

    it('accepts valid date formats', async () => {
      const validFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
      
      for (const format of validFormats) {
        const response = await api()
          .put('/api/settings')
          .send({ dateFormat: format })

        expect(response.status).toBe(200)
        expect(response.body.dateFormat).toBe(format)
      }
    })

    it('accepts valid themes', async () => {
      const validThemes = ['light', 'dark', 'auto']
      
      for (const theme of validThemes) {
        const response = await api()
          .put('/api/settings')
          .send({ theme })

        expect(response.status).toBe(200)
        expect(response.body.theme).toBe(theme)
      }
    })
  })

  describe('Settings persistence', () => {
    it('persists settings across requests', async () => {
      // Create settings
      await api().put('/api/settings').send({
        currency: 'EUR',
        theme: 'dark'
      })

      // Verify persistence by fetching again
      const response = await api().get('/api/settings')

      expect(response.status).toBe(200)
      expect(response.body.currency).toBe('EUR')
      expect(response.body.theme).toBe('dark')
    })

    it('maintains settings when partially updated', async () => {
      // Create initial settings
      await api().put('/api/settings').send({
        currency: 'USD',
        theme: 'dark',
        dateFormat: 'MM/DD/YYYY'
      })

      // Update only one field
      await api().put('/api/settings').send({
        currency: 'GBP'
      })

      // Verify other fields are maintained
      const response = await api().get('/api/settings')

      expect(response.status).toBe(200)
      expect(response.body.currency).toBe('GBP')
      expect(response.body.theme).toBe('dark')
      expect(response.body.dateFormat).toBe('MM/DD/YYYY')
    })
  })
})
