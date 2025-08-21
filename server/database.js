import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Debug: Log the MongoDB URI being used (hide password for security)
    const mongoUri = process.env.MONGODB_URI;
    const safeUri = mongoUri ? mongoUri.replace(/:([^:@]+)@/, ':***@') : 'NOT FOUND';
    console.log(`🔗 Connecting to MongoDB: ${safeUri}`);

    if (!mongoUri) {
      console.log('⚠️ No MongoDB URI provided - running in memory-only mode');
      console.log('📝 Data will not persist between server restarts');
      return null; // Return null to indicate in-memory mode
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`📚 Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️ Falling back to in-memory mode - data will not persist');
    return null; // Return null to indicate fallback to in-memory mode
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed through app termination');
  }
  process.exit(0);
});

export default connectDB;
