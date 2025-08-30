import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Expense from './models/Expense.js';
import Deposit from './models/Deposit.js';
import UserSettings from './models/UserSettings.js';
import connectDB from './database.js';

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

const clearDatabase = async () => {
  try {
    console.log('🌱 Starting database clearing...');

    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Expense.deleteMany({});
    await Deposit.deleteMany({});
    await Category.deleteMany({});
    await UserSettings.deleteMany({});
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
clearDatabase();
