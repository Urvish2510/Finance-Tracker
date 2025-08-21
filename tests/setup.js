import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

global.localStorage = localStorageMock

// Mock fetch
global.fetch = vi.fn()

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
})

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}
