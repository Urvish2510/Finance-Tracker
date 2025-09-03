import express from 'express';
import * as depositController from '../controllers/depositController.js';

const router = express.Router();

// GET /api/deposits - Get all deposits
router.get('/', depositController.getAllDeposits);

// GET /api/deposits/summary - Get deposits summary
router.get('/summary', depositController.getDepositSummary);

// GET /api/deposits/category/:categoryId - Get deposits by category
router.get('/category/:categoryId', depositController.getDepositsByCategory);

// GET /api/deposits/date-range - Get deposits by date range
router.get('/date-range', depositController.getDepositsByDateRange);

// DELETE /api/deposits/clear-all - Clear all deposits
router.delete('/clear-all', depositController.clearAllDeposits);

// GET /api/deposits/:id - Get deposit by ID
router.get('/:id', depositController.getDepositById);

// POST /api/deposits - Create new deposit
router.post('/', depositController.createDeposit);

// PUT /api/deposits/:id - Update deposit
router.put('/:id', depositController.updateDeposit);

// DELETE /api/deposits/:id - Delete deposit
router.delete('/:id', depositController.deleteDeposit);

export default router;
