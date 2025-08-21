import { beforeEach, vi } from 'vitest'

// Setup for server-side tests
beforeEach(() => {
  vi.clearAllMocks()
})

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.API_PORT = '5000'
