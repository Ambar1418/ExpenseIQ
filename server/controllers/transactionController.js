import Transaction from '../models/Transaction.js';

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a transaction manually
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
  try {
    const { merchantName, amount, category, date, paymentApp, notes, tags } = req.body;

    if (!merchantName || !amount || !category || !date) {
      res.status(400);
      throw new Error('Please add all required fields');
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      merchantName,
      amount,
      category,
      date,
      paymentApp,
      notes,
      tags
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Check for user
    if (transaction.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await transaction.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  try {
    const { merchantName, amount, category, date, paymentApp, notes, tags } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    if (merchantName) transaction.merchantName = merchantName;
    if (amount !== undefined) transaction.amount = amount;
    if (category) transaction.category = category;
    if (date) transaction.date = date;
    if (paymentApp) transaction.paymentApp = paymentApp;
    if (notes !== undefined) transaction.notes = notes;
    if (tags !== undefined) transaction.tags = tags;

    await transaction.save();

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk delete transactions
// @route   POST /api/transactions/bulk-delete
// @access  Private
export const deleteBulkTransactions = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'Please provide valid IDs for bulk deletion' });
    }

    await Transaction.deleteMany({
      _id: { $in: ids },
      userId: req.user._id
    });

    res.status(200).json({ message: 'Selected transactions deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all user transactions
// @route   DELETE /api/transactions/clear
// @access  Private
export const clearTransactions = async (req, res) => {
  try {
    await Transaction.deleteMany({ userId: req.user._id });
    res.status(200).json({ message: 'All transactions cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
