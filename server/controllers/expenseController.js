import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import UserSettings from '../models/UserSettings.js';

export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('category', 'name icon color type createdAt updatedAt')
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
      .populate('category', 'name icon color type createdAt updatedAt');
    
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
      .populate('category', 'name icon color type createdAt updatedAt')
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
  .populate('category', 'name icon color type createdAt updatedAt')
    .sort({ date: -1 });
    
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses by date range:', error);
    res.status(500).json({ error: 'Failed to fetch expenses by date range' });
  }
};

export const createExpense = async (req, res) => {
  try {
  const { title, amount, category, categoryId, date, description, currency } = req.body;
  const effectiveCategory = category || categoryId; // allow alias
  const effectiveTitle = (title || description || 'Expense').trim();
    
    // Validate required fields
    if (!amount || !effectiveCategory) {
      return res.status(400).json({ error: 'Amount and category are required' });
    }
    
    // Validate amount
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    
    // Validate category exists
  const categoryExists = await Category.findById(effectiveCategory);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    // Get user settings for default currency
    const settings = await UserSettings.getOrCreateDefault();
    
    const expense = new Expense({
      title: effectiveTitle,
      amount: parseFloat(amount),
  category: effectiveCategory,
      date: date || new Date(),
      description: description?.trim() || '',
      currency: currency || settings.currency
    });
    
    const savedExpense = await expense.save();
  await savedExpense.populate('category', 'name icon color type createdAt updatedAt');
    
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

export const updateExpense = async (req, res) => {
  try {
  const { title, amount, category, categoryId, date, description, currency } = req.body;
  const existing = await Expense.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Expense not found' });
  const effectiveTitle = title || existing.title;
  const effectiveCategory = category || categoryId || existing.category?.toString();
  const effectiveAmount = amount !== undefined ? amount : existing.amount;
  if (!effectiveTitle || !effectiveCategory) {
    return res.status(400).json({ error: 'Title and category are required' });
  }
  if (isNaN(effectiveAmount) || parseFloat(effectiveAmount) <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  if (effectiveCategory && effectiveCategory.toString() !== existing.category?.toString()) {
    const catExists = await Category.findById(effectiveCategory);
    if (!catExists) return res.status(400).json({ error: 'Invalid category' });
  }
  const settings = await UserSettings.getOrCreateDefault();
  existing.title = effectiveTitle.trim();
  existing.amount = parseFloat(effectiveAmount);
  existing.category = effectiveCategory;
  if (date) existing.date = date;
  existing.description = description?.trim() || existing.description || '';
  existing.currency = currency || existing.currency || settings.currency;
  await existing.save();
  await existing.populate('category', 'name icon color type createdAt updatedAt');
  res.json(existing);
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
  const expenses = await Expense.find().populate('category', 'name icon color type createdAt updatedAt');
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
