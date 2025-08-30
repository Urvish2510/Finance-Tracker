import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD', 'CNY', 'KRW']
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true, 
    transform: (_doc, ret) => { 
      if (ret.category) {
        ret.categoryId = ret.category._id ? ret.category._id.toString() : ret.category;
      }
      return ret; 
    } 
  },
  toObject: { virtuals: true }
});

expenseSchema.virtual('categoryId').get(function() { return this.category; });

// Indexes for faster queries
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ createdAt: -1 });

export default mongoose.model('Expense', expenseSchema);
