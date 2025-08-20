import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    default: '📦'
  },
  color: {
    type: String,
    required: true,
    default: '#3498db'
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income'],
    default: 'expense'
  }
}, {
  timestamps: true
});

// Compound unique index for name and type combination
categorySchema.index({ name: 1, type: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
