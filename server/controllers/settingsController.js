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
export const updateSettings = async (req, res) => {
  try {
    const { currency, currencySymbol, dateFormat, theme, defaultCategory } = req.body;
    
    let settings = await UserSettings.findOne({ userId: 'default' });
    
    if (!settings) {
      settings = await UserSettings.create({
        userId: 'default',
        currency: currency || 'INR',
        currencySymbol: currencySymbol || '₹',
        dateFormat: dateFormat || 'DD/MM/YYYY',
        theme: theme || 'light',
        defaultCategory
      });
    } else {
      settings.currency = currency || settings.currency;
      settings.currencySymbol = currencySymbol || settings.currencySymbol;
      settings.dateFormat = dateFormat || settings.dateFormat;
      settings.theme = theme || settings.theme;
      settings.defaultCategory = defaultCategory || settings.defaultCategory;
      
      await settings.save();
    }
    
    res.json(settings);
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
