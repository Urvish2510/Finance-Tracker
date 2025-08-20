# Environment Configuration Guide

This document explains how to set up and use different environments for the Finance Tracker application.

## Available Environments

### 1. Development Environment
- **Purpose**: Local development and debugging
- **Database**: `finance-tracker-dev`
- **Features**: Debug logging, dev tools enabled, relaxed timeouts
- **Config File**: `.env.development`

### 2. Production Environment
- **Purpose**: Live application deployment
- **Database**: `finance-tracker-prod`
- **Features**: Optimized builds, error reporting, strict timeouts
- **Config File**: `.env.production`

## Quick Start

### Development
```bash
# Start development environment (default)
npm run dev:full

# Or start individually
npm run server:dev  # Backend only
npm run dev         # Frontend only
```

### Production
```bash
# Build for production
npm run build

# Start production server
npm run start

# Or deploy with script
./scripts/deploy.sh
```

## Environment Variables

### Backend Variables
- `MONGODB_URI`: Database connection string
- `API_PORT`: Server port (5000 for dev/prod)
- `NODE_ENV`: Environment mode
- `LOG_LEVEL`: Logging level (debug/info/warn/error)
- `CORS_ORIGIN`: Allowed frontend origins

### Frontend Variables
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_APP_TITLE`: Application title
- `VITE_APP_ENV`: Environment identifier
- `VITE_ENABLE_DEV_TOOLS`: Enable Vue dev tools
- `VITE_DEBUG_MODE`: Enable debug logging

## File Structure
```
.env.development     # Development config
.env.production      # Production config
.env               # Local overrides (gitignored)
src/config/environment.js  # Environment service
```

## Configuration Service

The `src/config/environment.js` provides a centralized configuration service:

```javascript
import { config, isDev, isProd } from '@/config/environment.js'

// Access configuration
console.log(config.apiBaseUrl)
console.log(config.debugMode)

// Environment checks
if (isDev) {
  // Development-only code
}

// Get API configuration
const apiConfig = config.getApiConfig()
```

## Build Scripts

### Standard Build Commands
```bash
npm run build          # Production build
npm run build:dev      # Development build
```

### Custom Build Scripts
```bash
# Linux/Mac
./scripts/build.sh production
./scripts/build.sh development

# Windows
scripts\build.bat production
scripts\build.bat development
```

## Deployment

### Production Deployment
1. Set up production environment variables
2. Build the application: `npm run build`
3. Deploy using: `./scripts/deploy.sh`

### Environment-Specific Database

Each environment uses its own database:
- Development: `finance-tracker-dev`
- Production: `finance-tracker-prod`

This prevents data conflicts between environments.

## Security Notes

### Development
- Uses weak secrets (safe for local development)
- Debug information exposed
- Relaxed CORS policy

### Production
- Strong secrets required (set in .env.production)
- No debug information exposed
- Strict CORS policy
- Error reporting enabled

### Environment File Security
- Never commit `.env.production` with real secrets
- Use environment-specific deployment tools for secrets
- Keep `.env.development` in version control as template

## Monitoring and Logging

### Development
- Full debug logging to console
- Request/response logging
- Performance metrics

### Production
- Error-level logging only
- Error reporting to external services
- Performance monitoring

### Endpoints
- Health check: `GET /health`
- Environment status (dev only): `GET /env-status`

## Troubleshooting

### Common Issues
1. **API connection failed**: Check `VITE_API_BASE_URL` matches server port
2. **Database connection error**: Verify `MONGODB_URI` in environment file
3. **CORS errors**: Check `CORS_ORIGIN` includes frontend URL
4. **Build failures**: Ensure all environment variables are set

### Debug Commands
```bash
# Check environment status
curl http://localhost:5000/env-status  # Development only

# Check API health
curl http://localhost:5000/health

# View environment variables (development)
npm run dev  # Check console for environment info
```

## Best Practices

1. **Never commit secrets**: Use `.env.local` for sensitive data
2. **Use environment checks**: Wrap debug code in `if (isDev)`
3. **Verify builds**: Test builds work in both environments
4. **Monitor production**: Set up proper error reporting
5. **Database isolation**: Keep environment databases separate
6. **Version environment configs**: Track changes to environment files

## Migration from Single Environment

If upgrading from a single-environment setup:

1. Copy your current `.env` to `.env.development`
2. Create `.env.production` with production values
3. Update scripts to use environment-specific commands
4. Test both environments individually
5. Update deployment processes

This ensures a smooth transition to multi-environment setup.
