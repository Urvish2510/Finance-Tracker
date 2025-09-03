import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  clearAllCategories
} from '../controllers/categoryController.js';

const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', getAllCategories);

// DELETE /api/categories/clear-all - Clear all categories
router.delete('/clear-all', clearAllCategories);

// GET /api/categories/:id - Get category by ID
router.get('/:id', getCategoryById);

// POST /api/categories - Create new category
router.post('/', createCategory);

// PUT /api/categories/:id - Update category
router.put('/:id', updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', deleteCategory);

export default router;
