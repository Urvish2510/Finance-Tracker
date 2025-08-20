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

const seedCategories = [
  { name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B', type: 'expense' },
  { name: 'Transportation', icon: '🚗', color: '#4ECDC4', type: 'expense' },
  { name: 'Shopping', icon: '🛍️', color: '#45B7D1', type: 'expense' },
  { name: 'Entertainment', icon: '🎬', color: '#96CEB4', type: 'expense' },
  { name: 'Utilities', icon: '⚡', color: '#FFEAA7', type: 'expense' },
  { name: 'Healthcare', icon: '🏥', color: '#DDA0DD', type: 'expense' },
  { name: 'Education', icon: '📚', color: '#98D8C8', type: 'expense' },
  { name: 'Travel', icon: '✈️', color: '#F7DC6F', type: 'expense' }
];

const seedIncomeCategories = [
  { name: 'Salary', icon: '💼', color: '#28A745', type: 'income' },
  { name: 'Freelancing', icon: '💻', color: '#17A2B8', type: 'income' },
  { name: 'Investment Returns', icon: '📈', color: '#FFC107', type: 'income' },
  { name: 'Business Income', icon: '🏢', color: '#6F42C1', type: 'income' },
  { name: 'Rental Income', icon: '🏠', color: '#E83E8C', type: 'income' },
  { name: 'Gifts & Bonuses', icon: '🎁', color: '#20C997', type: 'income' },
  { name: 'Side Hustle', icon: '🚀', color: '#FD7E14', type: 'income' },
  { name: 'Other Income', icon: '💰', color: '#6C757D', type: 'income' }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Expense.deleteMany({});
    await Deposit.deleteMany({});
    await Category.deleteMany({});
    await UserSettings.deleteMany({});
    
    // Create default user settings
    console.log('⚙️ Creating default settings...');
    const defaultSettings = await UserSettings.create({
      userId: 'default',
      currency: 'INR',
      currencySymbol: '₹',
      dateFormat: 'DD/MM/YYYY',
      theme: 'light'
    });
    console.log('✅ Created default user settings');
    
    // Insert categories
    console.log('📂 Inserting expense categories...');
    const expenseCategories = await Category.insertMany(seedCategories);
    console.log(`✅ Inserted ${expenseCategories.length} expense categories`);
    
    // Insert income categories
    console.log('📂 Inserting income categories...');
    const incomeCategories = await Category.insertMany(seedIncomeCategories);
    console.log(`✅ Inserted ${incomeCategories.length} income categories`);
    
    const allCategories = [...expenseCategories, ...incomeCategories];
    
    // Create sample expenses
    const sampleExpenses = [
      {
        title: 'Lunch at Italian Restaurant',
        amount: 1250.50,
        category: expenseCategories[0]._id, // Food & Dining
        date: new Date('2024-01-15'),
        description: 'Delicious pasta and wine',
        currency: 'INR'
      },
      {
        title: 'Gas Station Fill-up',
        amount: 3500.00,
        category: expenseCategories[1]._id, // Transportation
        date: new Date('2024-01-14'),
        description: 'Petrol fill up',
        currency: 'INR'
      },
      {
        title: 'Grocery Shopping',
        amount: 2890.30,
        category: expenseCategories[0]._id, // Food & Dining
        date: new Date('2024-01-13'),
        description: 'Weekly groceries',
        currency: 'INR'
      },
      {
        title: 'Movie Tickets',
        amount: 800.00,
        category: expenseCategories[3]._id, // Entertainment
        date: new Date('2024-01-12'),
        description: 'Avatar 2 - IMAX',
        currency: 'INR'
      },
      {
        title: 'Uber Ride',
        amount: 450.50,
        category: expenseCategories[1]._id, // Transportation
        date: new Date('2024-01-11'),
        description: 'Downtown to airport',
        currency: 'INR'
      },
      {
        title: 'Coffee and Pastry',
        amount: 275.75,
        category: expenseCategories[0]._id, // Food & Dining
        date: new Date('2024-01-11'),
        description: 'Morning coffee break',
        currency: 'INR'
      },
      {
        title: 'Electricity Bill',
        amount: 1950.50,
        category: expenseCategories[4]._id, // Utilities
        date: new Date('2024-01-10'),
        description: 'Monthly electricity bill',
        currency: 'INR'
      },
      {
        title: 'Netflix Subscription',
        amount: 499.00,
        category: expenseCategories[3]._id, // Entertainment
        date: new Date('2024-01-09'),
        description: 'Monthly subscription',
        currency: 'INR'
      },
      {
        title: 'New Headphones',
        amount: 8999.99,
        category: expenseCategories[2]._id, // Shopping
        date: new Date('2024-01-08'),
        description: 'Wireless noise-canceling headphones',
        currency: 'INR'
      },
      {
        title: 'Doctor Visit',
        amount: 2500.00,
        category: expenseCategories[5]._id, // Healthcare
        date: new Date('2024-01-07'),
        description: 'Annual checkup',
        currency: 'INR'
      },
      {
        title: 'Book Purchase',
        amount: 1299.99,
        category: expenseCategories[6]._id, // Education
        date: new Date('2024-01-06'),
        description: 'JavaScript: The Definitive Guide',
        currency: 'INR'
      },
      {
        title: 'Flight Booking',
        amount: 28500.00,
        category: expenseCategories[7]._id, // Travel
        date: new Date('2024-01-05'),
        description: 'Round trip to Mumbai',
        currency: 'INR'
      }
    ];
    
    console.log('💰 Inserting expenses...');
    const expenses = await Expense.insertMany(sampleExpenses);
    console.log(`✅ Inserted ${expenses.length} expenses`);
    
    // Create sample deposits
    const sampleDeposits = [
      {
        title: 'Monthly Salary',
        amount: 85000.00,
        category: incomeCategories[0]._id, // Salary
        date: new Date('2024-01-01'),
        description: 'Software developer salary',
        currency: 'INR'
      },
      {
        title: 'Freelance Project Payment',
        amount: 25000.00,
        category: incomeCategories[1]._id, // Freelancing
        date: new Date('2024-01-05'),
        description: 'Website development project',
        currency: 'INR'
      },
      {
        title: 'Stock Market Gains',
        amount: 8500.00,
        category: incomeCategories[2]._id, // Investment Returns
        date: new Date('2024-01-08'),
        description: 'Quarterly dividend payout',
        currency: 'INR'
      },
      {
        title: 'Consulting Work',
        amount: 15000.00,
        category: incomeCategories[3]._id, // Business Income
        date: new Date('2024-01-10'),
        description: 'IT consulting for startup',
        currency: 'INR'
      },
      {
        title: 'Apartment Rent',
        amount: 18000.00,
        category: incomeCategories[4]._id, // Rental Income
        date: new Date('2024-01-02'),
        description: 'Monthly rent from tenant',
        currency: 'INR'
      },
      {
        title: 'Birthday Gift',
        amount: 5000.00,
        category: incomeCategories[5]._id, // Gifts & Bonuses
        date: new Date('2024-01-12'),
        description: 'Cash gift from family',
        currency: 'INR'
      },
      {
        title: 'Online Course Sales',
        amount: 12000.00,
        category: incomeCategories[6]._id, // Side Hustle
        date: new Date('2024-01-15'),
        description: 'Revenue from coding course',
        currency: 'INR'
      },
      {
        title: 'Cashback Rewards',
        amount: 850.00,
        category: incomeCategories[7]._id, // Other Income
        date: new Date('2024-01-14'),
        description: 'Credit card cashback',
        currency: 'INR'
      }
    ];
    
    console.log('💵 Inserting deposits...');
    const deposits = await Deposit.insertMany(sampleDeposits);
    console.log(`✅ Inserted ${deposits.length} deposits`);
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Display summary
    const totalExpenseAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalDepositAmount = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
    console.log(`📊 Summary:`);
    console.log(`   Settings: Currency set to INR (₹)`);
    console.log(`   Categories: ${allCategories.length} (${expenseCategories.length} expense + ${incomeCategories.length} income)`);
    console.log(`   Expenses: ${expenses.length} (Total: ₹${totalExpenseAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})})`);
    console.log(`   Deposits: ${deposits.length} (Total: ₹${totalDepositAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})})`);
    console.log(`   Net Income: ₹${(totalDepositAmount - totalExpenseAmount).toLocaleString('en-IN', {minimumFractionDigits: 2})}`);
    
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
seedDatabase();
