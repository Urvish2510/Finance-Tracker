import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
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
    required: false
  },
  date: {
    type: Date,
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

// Provide a flat categoryId for client/tests expecting it
depositSchema.virtual('categoryId').get(function() { return this.category; });

export default mongoose.model('Deposit', depositSchema);
