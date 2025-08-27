import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './server/models/Category.js';
import Expense from './server/models/Expense.js';
import Deposit from './server/models/Deposit.js';
import UserSettings from './server/models/UserSettings.js';

// Load environment variables from development file
dotenv.config({ path: '.env.development' });

const connectDB = async () => {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for comprehensive demo data seeding');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Comprehensive categories with more variety
const expenseCategories = [
  { name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B', type: 'expense' },
  { name: 'Transportation', icon: '🚗', color: '#4ECDC4', type: 'expense' },
  { name: 'Shopping', icon: '🛍️', color: '#45B7D1', type: 'expense' },
  { name: 'Entertainment', icon: '🎬', color: '#96CEB4', type: 'expense' },
  { name: 'Utilities', icon: '⚡', color: '#FFEAA7', type: 'expense' },
  { name: 'Healthcare', icon: '🏥', color: '#DDA0DD', type: 'expense' },
  { name: 'Education', icon: '📚', color: '#98D8C8', type: 'expense' },
  { name: 'Travel', icon: '✈️', color: '#F7DC6F', type: 'expense' },
  { name: 'Housing', icon: '🏠', color: '#AED6F1', type: 'expense' },
  { name: 'Insurance', icon: '🛡️', color: '#F8C471', type: 'expense' },
  { name: 'Subscriptions', icon: '📱', color: '#BB8FCE', type: 'expense' },
  { name: 'Gifts & Donations', icon: '🎁', color: '#85C1E9', type: 'expense' },
  { name: 'Personal Care', icon: '💄', color: '#F1C40F', type: 'expense' },
  { name: 'Sports & Fitness', icon: '🏋️', color: '#58D68D', type: 'expense' },
  { name: 'Home & Garden', icon: '🏡', color: '#EC7063', type: 'expense' }
];

const incomeCategories = [
  { name: 'Salary', icon: '💼', color: '#28A745', type: 'income' },
  { name: 'Freelancing', icon: '💻', color: '#17A2B8', type: 'income' },
  { name: 'Investment Returns', icon: '📈', color: '#FFC107', type: 'income' },
  { name: 'Business Income', icon: '🏢', color: '#6F42C1', type: 'income' },
  { name: 'Rental Income', icon: '🏠', color: '#E83E8C', type: 'income' },
  { name: 'Gifts & Bonuses', icon: '🎁', color: '#20C997', type: 'income' },
  { name: 'Side Hustle', icon: '🚀', color: '#FD7E14', type: 'income' },
  { name: 'Other Income', icon: '💰', color: '#6C757D', type: 'income' }
];

// Generate random date within a range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate random amount within a range
const randomAmount = (min, max) => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

const generateExpenseData = (categories) => {
  const expenses = [];
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  
  // Sample expense titles for each category
  const expenseTitles = {
    'Food & Dining': [
      'Lunch at Restaurant', 'Grocery Shopping', 'Coffee Shop', 'Pizza Delivery', 
      'Fine Dining', 'Street Food', 'Breakfast Cafe', 'Fast Food', 'Food Court',
      'Chinese Takeout', 'Italian Restaurant', 'Local Diner', 'Food Truck',
      'Ice Cream Shop', 'Bakery Visit', 'Buffet Dinner', 'Sushi Restaurant'
    ],
    'Transportation': [
      'Gas Fill-up', 'Uber Ride', 'Bus Ticket', 'Train Fare', 'Taxi Fare',
      'Car Maintenance', 'Parking Fee', 'Toll Charges', 'Metro Card',
      'Car Wash', 'Auto Repair', 'Bike Service', 'Flight Ticket'
    ],
    'Shopping': [
      'Clothing Store', 'Online Shopping', 'Electronics Store', 'Bookstore',
      'Department Store', 'Shoes Purchase', 'Accessories', 'Gadgets',
      'Home Decor', 'Kitchen Items', 'Sports Equipment', 'Stationery'
    ],
    'Entertainment': [
      'Movie Tickets', 'Concert', 'Streaming Service', 'Gaming', 'Sports Event',
      'Theater Show', 'Museum Visit', 'Amusement Park', 'Bowling', 'Mini Golf',
      'Arcade Games', 'Comedy Show', 'Art Exhibition', 'Music Festival'
    ],
    'Utilities': [
      'Electricity Bill', 'Water Bill', 'Internet Bill', 'Phone Bill', 'Gas Bill',
      'Trash Service', 'Cable TV', 'Home Security', 'Maintenance Fee'
    ],
    'Healthcare': [
      'Doctor Visit', 'Dentist', 'Pharmacy', 'Health Insurance', 'Lab Tests',
      'Eye Checkup', 'Medicine', 'Physical Therapy', 'Wellness Checkup',
      'Emergency Room', 'Specialist Visit', 'Vaccination', 'Medical Equipment'
    ],
    'Education': [
      'Course Fee', 'Books', 'Online Learning', 'Workshop', 'Certification',
      'Tuition', 'School Supplies', 'Training Program', 'Seminar Fee',
      'Library Fee', 'Educational Software', 'Language Course'
    ],
    'Travel': [
      'Hotel Stay', 'Flight Booking', 'Travel Insurance', 'Visa Fee', 'Car Rental',
      'Tour Package', 'Travel Gear', 'Vacation Expenses', 'Weekend Trip',
      'Business Travel', 'Adventure Tour', 'Cruise Booking', 'Resort Stay'
    ],
    'Housing': [
      'Rent Payment', 'Mortgage', 'Property Tax', 'Home Repair', 'Cleaning Service',
      'Furniture', 'Appliances', 'Home Insurance', 'Moving Costs', 'Storage Unit'
    ],
    'Insurance': [
      'Health Insurance', 'Car Insurance', 'Life Insurance', 'Home Insurance',
      'Travel Insurance', 'Pet Insurance', 'Disability Insurance'
    ],
    'Subscriptions': [
      'Netflix', 'Spotify', 'Amazon Prime', 'Gym Membership', 'Magazine',
      'Cloud Storage', 'Software License', 'News Subscription', 'Gaming Pass',
      'Streaming Services', 'Premium App', 'Professional Software'
    ],
    'Gifts & Donations': [
      'Birthday Gift', 'Anniversary Gift', 'Charity Donation', 'Wedding Gift',
      'Holiday Gifts', 'Thank You Gift', 'Graduation Gift', 'Baby Shower',
      'Religious Donation', 'Fundraiser', 'Community Support'
    ],
    'Personal Care': [
      'Haircut', 'Spa Treatment', 'Skincare Products', 'Dental Care', 'Massage',
      'Salon Visit', 'Cosmetics', 'Personal Hygiene', 'Beauty Treatment',
      'Nail Care', 'Wellness Products', 'Self Care Items'
    ],
    'Sports & Fitness': [
      'Gym Membership', 'Sports Equipment', 'Fitness Classes', 'Yoga Session',
      'Swimming Pool', 'Tennis Court', 'Running Gear', 'Cycling Accessories',
      'Personal Trainer', 'Sports Club Fee', 'Marathon Registration'
    ],
    'Home & Garden': [
      'Garden Supplies', 'Home Tools', 'Paint & Supplies', 'Lawn Care',
      'Plants & Seeds', 'Garden Furniture', 'Home Improvement', 'Lighting',
      'Storage Solutions', 'Outdoor Equipment', 'Landscaping'
    ]
  };

  // Generate 200-300 expenses across the year
  const numExpenses = 250;
  
  categories.forEach(category => {
    const categoryTitles = expenseTitles[category.name] || ['General Expense'];
    const expensesForCategory = Math.floor(numExpenses / categories.length) + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < expensesForCategory; i++) {
      const title = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
      const date = randomDate(oneYearAgo, now);
      
      // Different amount ranges for different categories
      let minAmount, maxAmount;
      switch (category.name) {
        case 'Food & Dining':
          minAmount = 50; maxAmount = 2500;
          break;
        case 'Transportation':
          minAmount = 100; maxAmount = 5000;
          break;
        case 'Shopping':
          minAmount = 200; maxAmount = 8000;
          break;
        case 'Entertainment':
          minAmount = 150; maxAmount = 3000;
          break;
        case 'Utilities':
          minAmount = 500; maxAmount = 4000;
          break;
        case 'Healthcare':
          minAmount = 300; maxAmount = 15000;
          break;
        case 'Education':
          minAmount = 500; maxAmount = 25000;
          break;
        case 'Travel':
          minAmount = 1000; maxAmount = 50000;
          break;
        case 'Housing':
          minAmount = 5000; maxAmount = 75000;
          break;
        case 'Insurance':
          minAmount = 2000; maxAmount = 20000;
          break;
        case 'Subscriptions':
          minAmount = 100; maxAmount = 2000;
          break;
        case 'Gifts & Donations':
          minAmount = 200; maxAmount = 5000;
          break;
        case 'Personal Care':
          minAmount = 150; maxAmount = 3500;
          break;
        case 'Sports & Fitness':
          minAmount = 200; maxAmount = 5000;
          break;
        case 'Home & Garden':
          minAmount = 300; maxAmount = 8000;
          break;
        default:
          minAmount = 100; maxAmount = 3000;
      }
      
      const amount = randomAmount(minAmount, maxAmount);
      
      expenses.push({
        title,
        amount,
        category: category._id,
        date,
        description: `${title} - Auto-generated demo data`,
        currency: 'INR'
      });
    }
  });

  return expenses;
};

const generateIncomeData = (categories) => {
  const incomes = [];
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  
  const incomeTitles = {
    'Salary': ['Monthly Salary', 'Bonus Payment', 'Overtime Pay', 'Performance Bonus'],
    'Freelancing': ['Web Design Project', 'Content Writing', 'Consulting Work', 'App Development'],
    'Investment Returns': ['Stock Dividends', 'Mutual Fund Returns', 'Bond Interest', 'Crypto Gains'],
    'Business Income': ['Service Revenue', 'Product Sales', 'Client Payment', 'Partnership Income'],
    'Rental Income': ['Apartment Rent', 'Commercial Rent', 'Property Lease', 'Room Rental'],
    'Gifts & Bonuses': ['Birthday Gift', 'Festival Bonus', 'Achievement Award', 'Cash Gift'],
    'Side Hustle': ['Tutoring Income', 'Food Delivery', 'Part-time Job', 'Online Sales'],
    'Other Income': ['Refund', 'Insurance Claim', 'Prize Money', 'Cashback']
  };

  categories.forEach(category => {
    const categoryTitles = incomeTitles[category.name] || ['Income'];
    let frequency;
    
    // Different frequencies for different income types
    switch (category.name) {
      case 'Salary':
        frequency = 12; // Monthly
        break;
      case 'Freelancing':
        frequency = 20; // Variable
        break;
      case 'Investment Returns':
        frequency = 8; // Quarterly-ish
        break;
      case 'Business Income':
        frequency = 15; // Variable
        break;
      case 'Rental Income':
        frequency = 12; // Monthly
        break;
      case 'Gifts & Bonuses':
        frequency = 6; // Few times a year
        break;
      case 'Side Hustle':
        frequency = 25; // Frequent
        break;
      case 'Other Income':
        frequency = 10; // Occasional
        break;
      default:
        frequency = 10;
    }
    
    for (let i = 0; i < frequency; i++) {
      const title = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
      const date = randomDate(oneYearAgo, now);
      
      let minAmount, maxAmount;
      switch (category.name) {
        case 'Salary':
          minAmount = 35000; maxAmount = 85000;
          break;
        case 'Freelancing':
          minAmount = 5000; maxAmount = 45000;
          break;
        case 'Investment Returns':
          minAmount = 2000; maxAmount = 25000;
          break;
        case 'Business Income':
          minAmount = 10000; maxAmount = 100000;
          break;
        case 'Rental Income':
          minAmount = 15000; maxAmount = 50000;
          break;
        case 'Gifts & Bonuses':
          minAmount = 1000; maxAmount = 15000;
          break;
        case 'Side Hustle':
          minAmount = 500; maxAmount = 8000;
          break;
        case 'Other Income':
          minAmount = 500; maxAmount = 10000;
          break;
        default:
          minAmount = 1000; maxAmount = 10000;
      }
      
      const amount = randomAmount(minAmount, maxAmount);
      
      incomes.push({
        title,
        amount,
        category: category._id,
        date,
        description: `${title} - Auto-generated demo data`,
        currency: 'INR'
      });
    }
  });

  return incomes;
};

const seedComprehensiveData = async () => {
  try {
    console.log('🌱 Starting comprehensive demo data seeding...');
    
    await connectDB();
    
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Expense.deleteMany({});
    await Deposit.deleteMany({});
    await Category.deleteMany({});
    await UserSettings.deleteMany({});
    
    // Create user settings
    console.log('⚙️ Creating user settings...');
    await UserSettings.create({
      userId: 'default',
      currency: 'INR',
      currencySymbol: '₹',
      dateFormat: 'DD/MM/YYYY',
      theme: 'light'
    });
    console.log('✅ User settings created');
    
    // Insert categories
    console.log('📂 Inserting comprehensive categories...');
    const createdExpenseCategories = await Category.insertMany(expenseCategories);
    const createdIncomeCategories = await Category.insertMany(incomeCategories);
    console.log(`✅ Created ${createdExpenseCategories.length} expense categories`);
    console.log(`✅ Created ${createdIncomeCategories.length} income categories`);
    
    // Generate and insert expenses
    console.log('💸 Generating comprehensive expense data...');
    const expenseData = generateExpenseData(createdExpenseCategories);
    await Expense.insertMany(expenseData);
    console.log(`✅ Created ${expenseData.length} expense entries`);
    
    // Generate and insert income
    console.log('💰 Generating comprehensive income data...');
    const incomeData = generateIncomeData(createdIncomeCategories);
    await Deposit.insertMany(incomeData);
    console.log(`✅ Created ${incomeData.length} income entries`);
    
    // Summary
    console.log('\n📊 Demo Data Summary:');
    console.log(`   📂 Categories: ${createdExpenseCategories.length + createdIncomeCategories.length}`);
    console.log(`   💸 Expenses: ${expenseData.length}`);
    console.log(`   💰 Income: ${incomeData.length}`);
    console.log(`   📅 Date Range: Last 12 months`);
    console.log(`   💵 Total Expense Amount: ₹${expenseData.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}`);
    console.log(`   💵 Total Income Amount: ₹${incomeData.reduce((sum, inc) => sum + inc.amount, 0).toLocaleString()}`);
    
    console.log('\n✨ Comprehensive demo data seeding completed successfully!');
    console.log('🎯 All charts should now display rich, varied data across all categories and time periods.');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding
seedComprehensiveData();
