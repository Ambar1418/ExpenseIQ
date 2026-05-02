import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Food', 'Shopping', 'Bills', 'Travel', 'Entertainment', 'Healthcare', 'Recharge', 'Others', 'All']
  },
  limit: {
    type: Number,
    required: [true, 'Please add a limit']
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can only have one budget per category per month/year
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
