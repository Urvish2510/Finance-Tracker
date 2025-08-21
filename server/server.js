import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './database.js';
import categoryRoutes from './routes/categories.js';
import expenseRoutes from './routes/expenses.js';
import depositRoutes from './routes/deposits.js';
import settingsRoutes from './routes/settings.js';

// Load environment variables based on NODE_ENV
const ENV = process.env.NODE_ENV || 'development';
console.log(`🔧 Loading environment: ${ENV}`);

// Load the appropriate .env file
if (ENV === 'development') {
  dotenv.config({ path: '.env.development' });
} else if (ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config(); // fallback to default .env
}

// Initialize Express app
const app = express();
const PORT = process.env.API_PORT || 5000;

// Environment-specific logging
const logLevel = process.env.LOG_LEVEL || 'info';
const enableLogging = process.env.ENABLE_LOGGING !== 'false';

// Custom logger based on environment
const logger = {
  debug: (...args) => logLevel === 'debug' && enableLogging && console.log('🐛', ...args),
  info: (...args) => ['debug', 'info'].includes(logLevel) && enableLogging && console.log('ℹ️', ...args),
  warn: (...args) => ['debug', 'info', 'warn'].includes(logLevel) && console.warn('⚠️', ...args),
  error: (...args) => console.error('❌', ...args),
};

// Connect to MongoDB (gracefully handle failure)
connectDB().then(dbConnection => {
  if (dbConnection) {
    console.log('✅ Database connection established');
  } else {
    console.log('⚠️ Running without persistent database - data will be stored in memory');
  }
}).catch(error => {
  console.warn('⚠️ Database connection failed, continuing in in-memory mode:', error.message);
});

// Environment-specific CORS configuration
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:3000', 'http://localhost:3001'];

// Log CORS origins only in development
if (ENV === 'development') {
  console.log('🔗 CORS origins configured:', corsOrigins);
}

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests, etc.)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      // Only log CORS blocks in development
      if (ENV === 'development') {
        console.warn(`❌ CORS blocked origin: ${origin}`);
      }
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-App-Environment', 'X-Debug-Mode', 'X-Health-Check']
}));

app.use(express.json({ 
  limit: ENV === 'production' ? '5mb' : '10mb' // Smaller limit in production
}));
app.use(express.urlencoded({ extended: true }));

// Environment info middleware
app.use((req, res, next) => {
  req.environment = ENV;
  req.logger = logger;
  
  // Add environment headers
  res.setHeader('X-Environment', ENV);
  res.setHeader('X-API-Version', '1.0.0');
  
  // Only log requests in development and only for non-health endpoints
  if (ENV === 'development' && enableLogging && !req.path.includes('/health')) {
    logger.debug(`${req.method} ${req.path}`);
  }
  
  next();
});

// Rate limiting for production
if (ENV === 'production') {
  const rateLimit = (req, res, next) => {
    // Simple rate limiting implementation
    // In a real app, use express-rate-limit package
    next();
  };
  app.use(rateLimit);
}

// Health check route with environment info
app.get('/health', (req, res) => {
  const healthInfo = {
    status: 'OK',
    message: 'Finance Tracker API is running',
    environment: ENV,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    ...(ENV === 'development' && {
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    })
  };
  
  // Remove verbose health check logging
  res.json(healthInfo);
});

// Environment status endpoint (development only)
if (ENV === 'development') {
  app.get('/env-status', (req, res) => {
    res.json({
      environment: ENV,
      config: {
        port: PORT,
        mongoUri: process.env.MONGODB_URI ? '***configured***' : 'not configured',
        corsOrigins,
        logLevel,
        enableLogging
      },
      processInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    });
  });
}

// API Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware with environment-specific responses
app.use((err, req, res, next) => {
  logger.error('Server Error:', err);
  
  const isDev = ENV === 'development';
  const errorResponse = {
    error: 'Internal server error',
    message: isDev ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    ...(isDev && {
      stack: err.stack,
      details: err
    })
  };
  
  res.status(err.status || 500).json(errorResponse);
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`� Environment: ${ENV}`);
  console.log(`�📍 API endpoints:`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  
  if (ENV === 'development') {
    console.log(`   Environment Status: http://localhost:${PORT}/env-status`);
    logger.info('Development mode enabled with enhanced logging');
  }
});

export default app;
