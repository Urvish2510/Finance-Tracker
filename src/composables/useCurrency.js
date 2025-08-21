// Simplified currency composable - INR only
import { ref } from 'vue';

export const useCurrency = () => {
  // Default INR settings - no API calls needed
  const userSettings = ref({ currency: 'INR', currencySymbol: '₹' });
  
  // Simple load function for compatibility
  const loadSettings = async () => {
    // No-op - settings are hardcoded to INR
    return Promise.resolve();
  };

  // Format amount with INR currency symbol
  const formatCurrency = (amount, options = {}) => {
    const {
      showSymbol = true,
      precision = 2
    } = options;

    if (amount === null || amount === undefined || amount === '') {
      amount = 0;
    }

    // Format number for INR
    const formatted = parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });

    if (showSymbol) {
      return `₹${formatted}`;
    }

    return formatted;
  };

  // Get currency symbol - always INR
  const getCurrencySymbol = () => {
    return '₹';
  };

  // Get currency code - always INR
  const getCurrencyCode = () => {
    return 'INR';
  };

  // Parse amount string to number (removes currency symbols)
  const parseCurrencyAmount = (amountString) => {
    if (typeof amountString === 'number') return amountString;
    if (!amountString) return 0;
    
    // Remove currency symbols and commas, then parse
    const cleanAmount = amountString.toString()
      .replace(/[₹$€£¥₩]/g, '')
      .replace(/[,\s]/g, '');
    
    return parseFloat(cleanAmount) || 0;
  };

  return {
    userSettings,
    loadSettings,
    formatCurrency,
    getCurrencySymbol,
    getCurrencyCode,
    parseCurrencyAmount
  };
};
