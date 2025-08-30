import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  const config = {
    plugins: [
      vue(),
      // Only enable dev tools in development
      ...(mode === 'development' ? [vueDevTools()] : []),
    ],
    server: {
      port: parseInt(env.VITE_DEV_PORT) || 3000,
      host: true, // Allow external connections
      open: mode === 'development', // Auto-open browser in dev
    },
    build: {
      // Production build optimizations
      minify: mode === 'production' ? 'terser' : false,
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          // Chunk splitting for better caching
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            charts: ['chart.js']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    define: {
      // Make environment variables available to the app
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
    }
  }

  // Environment-specific settings for production
  if (mode === 'production') {
    config.build.reportCompressedSize = true
    config.build.chunkSizeWarningLimit = 1000
  }

  return config
})
