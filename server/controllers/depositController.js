import Deposit from '../models/Deposit.js';
import Category from '../models/Category.js';
import UserSettings from '../models/UserSettings.js';

export const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .populate('category', 'name icon color')
      .sort({ date: -1, createdAt: -1 });
    res.json(deposits);
  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ error: 'Failed to fetch deposits' });
  }
};

export const getDepositById = async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id)
      .populate('category', 'name icon color');
    
    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }
    
    res.json(deposit);
  } catch (error) {
    console.error('Error fetching deposit:', error);
    res.status(500).json({ error: 'Failed to fetch deposit' });
  }
};

export const getDepositsByCategory = async (req, res) => {
  try {
    const deposits = await Deposit.find({ category: req.params.categoryId })
      .populate('category', 'name icon color')
      .sort({ date: -1 });
    res.json(deposits);
  } catch (error) {
    console.error('Error fetching deposits by category:', error);
    res.status(500).json({ error: 'Failed to fetch deposits by category' });
  }
};

export const getDepositsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const deposits = await Deposit.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('category', 'name icon color')
    .sort({ date: -1 });
    
    res.json(deposits);
  } catch (error) {
    console.error('Error fetching deposits by date range:', error);
    res.status(500).json({ error: 'Failed to fetch deposits by date range' });
  }
};

export const createDeposit = async (req, res) => {
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
    
    const deposit = new Deposit({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date: date || new Date(),
      description: description?.trim() || '',
      currency: currency || settings.currency
    });
    
    const savedDeposit = await deposit.save();
    await savedDeposit.populate('category', 'name icon color');
    
    res.status(201).json(savedDeposit);
  } catch (error) {
    console.error('Error creating deposit:', error);
    res.status(500).json({ error: 'Failed to create deposit' });
  }
};

export const updateDeposit = async (req, res) => {
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
    
    const deposit = await Deposit.findByIdAndUpdate(
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
    
    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }
    
    res.json(deposit);
  } catch (error) {
    console.error('Error updating deposit:', error);
    res.status(500).json({ error: 'Failed to update deposit' });
  }
};

export const deleteDeposit = async (req, res) => {
  try {
    const deposit = await Deposit.findByIdAndDelete(req.params.id);
    
    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }
    
    res.json({ message: 'Deposit deleted successfully' });
  } catch (error) {
    console.error('Error deleting deposit:', error);
    res.status(500).json({ error: 'Failed to delete deposit' });
  }
};

export const getDepositSummary = async (req, res) => {
  try {
    const deposits = await Deposit.find().populate('category', 'name icon color');
    const categories = await Category.find();
    
    // Calculate total deposits
    const totalDeposits = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
    
    // Category breakdown
    const categoryBreakdown = {};
    deposits.forEach(deposit => {
      const categoryId = deposit.category._id.toString();
      const categoryName = deposit.category.name;
      
      if (!categoryBreakdown[categoryId]) {
        categoryBreakdown[categoryId] = {
          name: categoryName,
          icon: deposit.category.icon,
          color: deposit.category.color,
          total: 0,
          count: 0
        };
      }
      
      categoryBreakdown[categoryId].total += deposit.amount;
      categoryBreakdown[categoryId].count += 1;
    });
    
    // Monthly breakdown
    const monthlyTotals = {};
    deposits.forEach(deposit => {
      const month = deposit.date.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0;
      }
      monthlyTotals[month] += deposit.amount;
    });
    
    // Recent deposits (last 5)
    const recentDeposits = deposits
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
    
    const summary = {
      totalDeposits,
      depositCount: deposits.length,
      categoryCount: categories.length,
      categoryBreakdown,
      monthlyTotals,
      recentDeposits
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error getting deposit summary:', error);
    res.status(500).json({ error: 'Failed to get deposit summary' });
  }
};
