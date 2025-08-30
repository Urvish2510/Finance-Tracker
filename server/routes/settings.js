import express from 'express';
import * as settingsController from '../controllers/settingsController.js';

const router = express.Router();

// Get user settings
router.get('/', settingsController.getSettings);

// Create or update user settings
router.post('/', settingsController.createOrUpdateSettings);
router.put('/', settingsController.createOrUpdateSettings);

// Get currency information
router.get('/currency', settingsController.getCurrencyInfo);

export default router;
