import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  merchantName: {
    type: String,
    required: [true, 'Please add a merchant name']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  paymentApp: {
    type: String,
    default: 'Unknown'
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  rawText: {
    type: String
  },
  imagePath: {
    type: String
  },
  notes: {
    type: String
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);
