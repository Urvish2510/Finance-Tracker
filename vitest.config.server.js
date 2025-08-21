import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/server/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    setupFiles: ['./tests/server/setup.js']
  },
  resolve: {
    alias: {
      '@server': resolve(__dirname, './server')
    }
  }
})
