import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'integration',
    root: '.',
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 60000,
    setupFiles: ['./tests/integration/setup.js'],
    include: [
      'tests/integration/**/*.test.js'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'tests/client/**',
      'tests/server/**'
    ],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'tests/**',
        'coverage/**'
      ]
    }
  }
})
