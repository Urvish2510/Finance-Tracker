// Environment configuration service
// This module provides environment-specific configuration and utilities

class EnvironmentConfig {
  constructor() {
    this.env = import.meta.env.VITE_APP_ENV || 'development'
    this.isDev = this.env === 'development' || import.meta.env.DEV
    this.isProd = this.env === 'production'
  }

  // API Configuration
  get apiBaseUrl() {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
  }

  get apiTimeout() {
    return this.isDev ? 30000 : 15000 // 30s for dev, 15s for prod
  }

  // App Configuration
  get appTitle() {
    return import.meta.env.VITE_APP_TITLE || 'Finance Tracker'
  }

  get enableDevTools() {
    return import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' || this.isDev
  }

  get debugMode() {
    return import.meta.env.VITE_DEBUG_MODE === 'true' || this.isDev
  }

  // Feature Flags
  get enableAnalytics() {
    return import.meta.env.VITE_ENABLE_ANALYTICS === 'true' && this.isProd
  }

  get enableErrorReporting() {
    return import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true' && this.isProd
  }

  // Logging Configuration
  get logLevel() {
    if (this.isDev) return 'debug'
    return 'error'
  }

  // Environment-specific settings
  get settings() {
    return {
      environment: this.env,
      isDevelopment: this.isDev,
      isProduction: this.isProd,
      apiBaseUrl: this.apiBaseUrl,
      apiTimeout: this.apiTimeout,
      appTitle: this.appTitle,
      enableDevTools: this.enableDevTools,
      debugMode: this.debugMode,
      enableAnalytics: this.enableAnalytics,
      enableErrorReporting: this.enableErrorReporting,
      logLevel: this.logLevel
    }
  }

  // Utility method to log environment info
  logEnvironmentInfo() {
    if (this.debugMode) {
      console.group('🔧 Environment Configuration')
      console.log('Environment:', this.env)
      console.log('API Base URL:', this.apiBaseUrl)
      console.log('Debug Mode:', this.debugMode)
      console.log('Dev Tools:', this.enableDevTools)
      console.log('Analytics:', this.enableAnalytics)
      console.log('Error Reporting:', this.enableErrorReporting)
      console.groupEnd()
    }
  }

  // Environment-specific error handling
  handleError(error, context = {}) {
    if (this.isDev) {
      console.error('🐛 Development Error:', error, context)
    }

    if (this.enableErrorReporting && this.isProd) {
      // In production, you could send to error reporting service
      // Example: Sentry, LogRocket, etc.
      console.warn('Error would be reported to monitoring service:', error)
    }
  }

  // Environment-specific API configuration
  getApiConfig() {
    return {
      baseURL: this.apiBaseUrl,
      timeout: this.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
        'X-App-Environment': this.env,
        ...(this.isDev && { 'X-Debug-Mode': 'true' })
      },
      // Add more timeout for development
      ...(this.isDev && { 
        timeout: 60000,
        retry: 3 
      }),
      // Strict settings for production
      ...(this.isProd && { 
        timeout: 15000,
        retry: 1,
        validateStatus: (status) => status >= 200 && status < 300
      })
    }
  }
}

// Create singleton instance
export const config = new EnvironmentConfig()

// Export individual utilities
export const isDev = config.isDev
export const isProd = config.isProd
export const debugMode = config.debugMode

// Initialize environment logging
config.logEnvironmentInfo()

export default config
