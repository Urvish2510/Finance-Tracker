import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Deposit from './server/models/Deposit.js';
import Category from './server/models/Category.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding deposits');
    
    // First, let's check if we have income categories
    const incomeCategories = await Category.find({ type: 'income' });
    console.log('📂 Income categories found:', incomeCategories.length);
    
    if (incomeCategories.length === 0) {
      console.log('🔧 Creating income categories...');
      
      const sampleIncomeCategories = [
        { name: 'Salary', icon: '💰', color: '#22c55e', type: 'income' },
        { name: 'Freelance', icon: '💻', color: '#3b82f6', type: 'income' },
        { name: 'Investment', icon: '📈', color: '#8b5cf6', type: 'income' },
        { name: 'Business', icon: '🏢', color: '#f59e0b', type: 'income' },
        { name: 'Rental', icon: '🏠', color: '#06b6d4', type: 'income' },
      ];
      
      for (const categoryData of sampleIncomeCategories) {
        const category = new Category(categoryData);
        await category.save();
        console.log(`   ✅ Created income category: ${category.name}`);
      }
      
      // Refresh income categories
      const newIncomeCategories = await Category.find({ type: 'income' });
      console.log('📂 Total income categories now:', newIncomeCategories.length);
    }
    
    // Get income categories for creating deposits
    const categories = await Category.find({ type: 'income' });
    
    if (categories.length > 0) {
      console.log('💰 Creating sample deposits...');
      
      const sampleDeposits = [
        {
          title: 'Monthly Salary',
          amount: 45000,
          category: categories[0]._id, // Salary
          date: new Date('2024-08-01'),
          description: 'August 2024 salary'
        },
        {
          title: 'Freelance Project',
          amount: 15000,
          category: categories[1]._id, // Freelance
          date: new Date('2024-08-15'),
          description: 'Website development project'
        },
        {
          title: 'Stock Dividend',
          amount: 2500,
          category: categories[2]._id, // Investment
          date: new Date('2024-08-10'),
          description: 'Quarterly dividend payment'
        },
        {
          title: 'Consulting Fee',
          amount: 8000,
          category: categories[3]._id, // Business
          date: new Date('2024-08-20'),
          description: 'Business consultation'
        },
        {
          title: 'Previous Month Salary',
          amount: 45000,
          category: categories[0]._id, // Salary
          date: new Date('2024-07-01'),
          description: 'July 2024 salary'
        }
      ];
      
      for (const depositData of sampleDeposits) {
        const deposit = new Deposit(depositData);
        await deposit.save();
        console.log(`   ✅ Created deposit: ${deposit.title} - ₹${deposit.amount}`);
      }
      
      console.log('🎉 Sample deposits created successfully!');
    } else {
      console.log('❌ No income categories found to create deposits');
    }
    
    // Verify deposits were created
    const deposits = await Deposit.find().populate('category');
    console.log('📊 Total deposits in database now:', deposits.length);
    
    if (deposits.length > 0) {
      const totalAmount = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
      console.log('💵 Total deposit amount:', totalAmount);
    }
    
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding deposits:', error);
    process.exit(1);
  }
};

connectDB();
