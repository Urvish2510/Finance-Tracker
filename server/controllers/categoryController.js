import Category from '../models/Category.js';
import Expense from '../models/Expense.js';

export const getAllCategories = async (req, res) => {
  try {
    // Build query based on type filter
    let query = {};
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    const categories = await Category.find(query).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, icon, color, type } = req.body;
    
    // Validate required fields
    if (!name || !icon || !color) {
      return res.status(400).json({ error: 'Name, icon, and color are required' });
    }
    
    // Validate type if provided
    if (type && !['expense', 'income'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "expense" or "income"' });
    }
    
    // Check if category name already exists for the same type
    const query = { 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    };
    if (type) {
      query.type = type;
    }
    
    const existingCategory = await Category.findOne(query);
    
    if (existingCategory) {
      return res.status(400).json({ error: 'Category name already exists for this type' });
    }
    
    const category = new Category({ 
      name: name.trim(), 
      icon, 
      color,
      type: type || 'expense' // Default to expense if not specified
    });
    const savedCategory = await category.save();
    
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, icon, color, type } = req.body;
    
    // Validate required fields
    if (!name || !icon || !color) {
      return res.status(400).json({ error: 'Name, icon, and color are required' });
    }
    
    // Validate type if provided
    if (type && !['expense', 'income'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "expense" or "income"' });
    }
    
    // Check if category name already exists for other categories of the same type
    const query = { 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    };
    if (type) {
      query.type = type;
    }
    
    const existingCategory = await Category.findOne(query);
    
    if (existingCategory) {
      return res.status(400).json({ error: 'Category name already exists for this type' });
    }
    
    const updateData = { name: name.trim(), icon, color };
    if (type) {
      updateData.type = type;
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    // Check if category has expenses
    const expenseCount = await Expense.countDocuments({ category: req.params.id });
    
    if (expenseCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that has expenses. Please move or delete the expenses first.',
        expenseCount 
      });
    }
    
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

export const clearAllCategories = async (req, res) => {
  try {
    // Check if there are any expenses that use these categories
    const expenseCount = await Expense.countDocuments({});
    
    if (expenseCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot clear categories while expenses exist. Please clear expenses first.',
        expenseCount 
      });
    }
    
    const result = await Category.deleteMany({});
    res.json({ 
      message: 'All categories cleared successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error clearing all categories:', error);
    res.status(500).json({ error: 'Failed to clear all categories' });
  }
};
