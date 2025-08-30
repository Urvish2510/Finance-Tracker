import UserSettings from '../models/UserSettings.js';

// Get user settings
export const getSettings = async (req, res) => {
  try {
    const settings = await UserSettings.getOrCreateDefault();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Update user settings
export const createOrUpdateSettings = async (req, res) => {
  try {
    const { currency, currencySymbol, dateFormat, theme, defaultCategory, budgetLimit, notifications, autoBackup } = req.body;
    // Basic validation of enums if provided
    const validCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD', 'CNY', 'KRW'];
    if (currency && !validCurrencies.includes(currency)) {
      return res.status(400).json({ error: 'Invalid currency' });
    }
    const validThemes = ['light', 'dark', 'auto'];
    if (theme && !validThemes.includes(theme)) {
      return res.status(400).json({ error: 'Invalid theme' });
    }
    
    let settings = await UserSettings.findOne({ userId: 'default' });
    
  const isNew = !settings;
  if (isNew) {
      settings = await UserSettings.create({
        userId: 'default',
        currency: currency || 'INR',
        currencySymbol: currencySymbol || '₹',
        dateFormat: dateFormat || 'DD/MM/YYYY',
        theme: theme || 'light',
        defaultCategory,
        budgetLimit: budgetLimit ?? 1000,
        notifications: notifications ?? true,
        autoBackup: autoBackup ?? false
      });
  } else {
      settings.currency = currency || settings.currency;
      settings.currencySymbol = currencySymbol || settings.currencySymbol;
      settings.dateFormat = dateFormat || settings.dateFormat;
      settings.theme = theme || settings.theme;
      settings.defaultCategory = defaultCategory || settings.defaultCategory;
      if (budgetLimit !== undefined) settings.budgetLimit = budgetLimit;
      if (notifications !== undefined) settings.notifications = notifications;
      if (autoBackup !== undefined) settings.autoBackup = autoBackup;
      
      await settings.save();
    }
  // Status code logic: POST always 201, PUT always 200
  const status = req.method === 'POST' ? 201 : 200;
  res.status(status).json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Get currency info
export const getCurrencyInfo = async (req, res) => {
  try {
    const settings = await UserSettings.getOrCreateDefault();
    
    const currencyMap = {
      'INR': { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
      'USD': { symbol: '$', name: 'US Dollar', code: 'USD' },
      'EUR': { symbol: '€', name: 'Euro', code: 'EUR' },
      'GBP': { symbol: '£', name: 'British Pound', code: 'GBP' },
      'JPY': { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
      'CAD': { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
      'AUD': { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
      'SGD': { symbol: 'S$', name: 'Singapore Dollar', code: 'SGD' },
      'CNY': { symbol: '¥', name: 'Chinese Yuan', code: 'CNY' },
      'KRW': { symbol: '₩', name: 'South Korean Won', code: 'KRW' }
    };
    
    const currentCurrency = currencyMap[settings.currency] || currencyMap['INR'];
    
    res.json({
      current: currentCurrency,
      available: currencyMap,
      settings: settings
    });
  } catch (error) {
    console.error('Error fetching currency info:', error);
    res.status(500).json({ error: 'Failed to fetch currency info' });
  }
};
