import express from 'express';
import {
  getAllExpenses,
  getExpenseById,
  getExpensesByCategory,
  getExpensesByDateRange,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} from '../controllers/expenseController.js';

const router = express.Router();

// GET /api/expenses - Get all expenses
router.get('/', getAllExpenses);

// GET /api/expenses/summary - Get expense summary
router.get('/summary', getExpenseSummary);

// GET /api/expenses/category/:categoryId - Get expenses by category
router.get('/category/:categoryId', getExpensesByCategory);

// GET /api/expenses/date-range - Get expenses by date range
router.get('/date-range', getExpensesByDateRange);

// GET /api/expenses/:id - Get expense by ID
router.get('/:id', getExpenseById);

// POST /api/expenses - Create new expense
router.post('/', createExpense);

// PUT /api/expenses/:id - Update expense
router.put('/:id', updateExpense);

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', deleteExpense);

export default router;
