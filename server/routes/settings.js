import express from 'express';
import * as settingsController from '../controllers/settingsController.js';

const router = express.Router();

// Get user settings
router.get('/', settingsController.getSettings);

// Update user settings
router.put('/', settingsController.updateSettings);

// Get currency information
router.get('/currency', settingsController.getCurrencyInfo);

export default router;
