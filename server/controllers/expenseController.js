import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import UserSettings from '../models/UserSettings.js';

export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('category', 'name icon color')
      .sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('category', 'name icon color');
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
};

export const getExpensesByCategory = async (req, res) => {
  try {
    const expenses = await Expense.find({ category: req.params.categoryId })
      .populate('category', 'name icon color')
      .sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses by category:', error);
    res.status(500).json({ error: 'Failed to fetch expenses by category' });
  }
};

export const getExpensesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const expenses = await Expense.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('category', 'name icon color')
    .sort({ date: -1 });
    
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses by date range:', error);
    res.status(500).json({ error: 'Failed to fetch expenses by date range' });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description, currency } = req.body;
    
    // Validate required fields
    if (!title || !amount || !category) {
      return res.status(400).json({ error: 'Title, amount, and category are required' });
    }
    
    // Validate amount
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    
    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    // Get user settings for default currency
    const settings = await UserSettings.getOrCreateDefault();
    
    const expense = new Expense({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date: date || new Date(),
      description: description?.trim() || '',
      currency: currency || settings.currency
    });
    
    const savedExpense = await expense.save();
    await savedExpense.populate('category', 'name icon color');
    
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description, currency } = req.body;
    
    // Validate required fields
    if (!title || !amount || !category) {
      return res.status(400).json({ error: 'Title, amount, and category are required' });
    }
    
    // Validate amount
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    
    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    // Get user settings for default currency
    const settings = await UserSettings.getOrCreateDefault();
    
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        amount: parseFloat(amount),
        category,
        date,
        description: description?.trim() || '',
        currency: currency || settings.currency
      },
      { new: true, runValidators: true }
    ).populate('category', 'name icon color');
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

export const getExpenseSummary = async (req, res) => {
  try {
    const expenses = await Expense.find().populate('category', 'name icon color');
    const categories = await Category.find();
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach(expense => {
      const categoryId = expense.category._id.toString();
      const categoryName = expense.category.name;
      
      if (!categoryBreakdown[categoryId]) {
        categoryBreakdown[categoryId] = {
          name: categoryName,
          icon: expense.category.icon,
          color: expense.category.color,
          total: 0,
          count: 0
        };
      }
      
      categoryBreakdown[categoryId].total += expense.amount;
      categoryBreakdown[categoryId].count += 1;
    });
    
    // Monthly breakdown
    const monthlyTotals = {};
    expenses.forEach(expense => {
      const month = expense.date.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0;
      }
      monthlyTotals[month] += expense.amount;
    });
    
    // Recent expenses (last 5)
    const recentExpenses = expenses
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
    
    const summary = {
      totalExpenses,
      expenseCount: expenses.length,
      categoryCount: categories.length,
      categoryBreakdown,
      monthlyTotals,
      recentExpenses
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error getting expense summary:', error);
    res.status(500).json({ error: 'Failed to get expense summary' });
  }
};
