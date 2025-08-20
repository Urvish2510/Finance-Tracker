import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'default', // For now, using a single user system
    unique: true
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD', 'CNY', 'KRW']
  },
  currencySymbol: {
    type: String,
    default: '₹'
  },
  dateFormat: {
    type: String,
    default: 'DD/MM/YYYY',
    enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
  },
  theme: {
    type: String,
    default: 'light',
    enum: ['light', 'dark', 'auto']
  },
  defaultCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  }
}, {
  timestamps: true
});

// Create default settings if they don't exist
userSettingsSchema.statics.getOrCreateDefault = async function() {
  let settings = await this.findOne({ userId: 'default' });
  
  if (!settings) {
    settings = await this.create({
      userId: 'default',
      currency: 'INR',
      currencySymbol: '₹',
      dateFormat: 'DD/MM/YYYY',
      theme: 'light'
    });
  }
  
  return settings;
};

export default mongoose.model('UserSettings', userSettingsSchema);
