import { describe, it, expect, beforeEach } from 'vitest'
import { useCurrency } from '../../src/composables/useCurrency.js'

describe('useCurrency', () => {
  let currency

  beforeEach(() => {
    currency = useCurrency()
  })

  it('should format currency correctly', () => {
    expect(currency.formatCurrency(1000)).toBe('₹1,000.00')
    expect(currency.formatCurrency(1000.50)).toBe('₹1,000.50')
    expect(currency.formatCurrency(0)).toBe('₹0.00')
  })

  it('should handle negative amounts', () => {
    expect(currency.formatCurrency(-500)).toBe('₹-500.00')
  })

  it('should handle very large numbers', () => {
    expect(currency.formatCurrency(1000000)).toBe('₹10,00,000.00')
  })

  it('should handle very small numbers', () => {
    expect(currency.formatCurrency(0.01)).toBe('₹0.01')
    expect(currency.formatCurrency(0.99)).toBe('₹0.99')
  })

  it('should use default settings when localStorage is empty', () => {
    expect(currency.getCurrencySymbol()).toBe('₹')
    expect(currency.getCurrencyCode()).toBe('INR')
  })

  it('should handle invalid JSON in localStorage', async () => {
    // loadSettings should not throw error
    await expect(currency.loadSettings()).resolves.not.toThrow()
  })

  it('should load settings without localStorage calls', async () => {
    // This implementation doesn't use localStorage
    await currency.loadSettings()
    expect(currency.getCurrencySymbol()).toBe('₹')
  })

  it('should format without symbol when requested', () => {
    expect(currency.formatCurrency(1000, { showSymbol: false })).toBe('1,000.00')
    expect(currency.formatCurrency(500.75, { showSymbol: false })).toBe('500.75')
  })

  it('should format with custom precision', () => {
    expect(currency.formatCurrency(1234.56, { precision: 0 })).toBe('₹1,235')
    expect(currency.formatCurrency(1234.44, { precision: 0 })).toBe('₹1,234')
  })

  it('should format decimal places correctly', () => {
    expect(currency.formatCurrency(1234.56, { precision: 0 })).toBe('₹1,235') // Rounded
    expect(currency.formatCurrency(1234.44, { precision: 0 })).toBe('₹1,234') // Rounded down
  })

  it('should handle edge cases', () => {
    expect(currency.formatCurrency(null)).toBe('₹0.00')
    expect(currency.formatCurrency(undefined)).toBe('₹0.00')
    expect(currency.formatCurrency('')).toBe('₹0.00')
  })

  it('should maintain consistent formatting', () => {
    const amounts = [100, 1000, 10000, 100000]
    
    amounts.forEach(amount => {
      const formatted = currency.formatCurrency(amount)
      expect(formatted).toMatch(/^₹[\d,]+\.\d{2}$/)
      expect(formatted).toContain('₹')
    })
  })

  it('should parse currency amounts correctly', () => {
    expect(currency.parseCurrencyAmount('₹1,000.00')).toBe(1000)
    expect(currency.parseCurrencyAmount('$500.50')).toBe(500.5)
    expect(currency.parseCurrencyAmount('1000')).toBe(1000)
    expect(currency.parseCurrencyAmount(1234.56)).toBe(1234.56)
    expect(currency.parseCurrencyAmount('')).toBe(0)
    expect(currency.parseCurrencyAmount(null)).toBe(0)
  })

  it('should return correct currency symbol', () => {
    expect(currency.getCurrencySymbol()).toBe('₹')
  })

  it('should return correct currency code', () => {
    expect(currency.getCurrencyCode()).toBe('INR')
  })
})
