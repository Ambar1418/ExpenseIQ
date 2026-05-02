import Transaction from '../models/Transaction.js';
import { generateInsights } from '../services/aiService.js';

// @desc    Generate AI insights based on recent transactions
// @route   GET /api/insights
// @access  Private
export const getAiInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch last 30 days of transactions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await Transaction.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).select('merchantName amount category date -_id');

    if (recentTransactions.length === 0) {
      return res.status(200).json({ insights: ["Not enough recent transaction data to generate insights. Please upload some screenshots."] });
    }

    const insights = await generateInsights(recentTransactions);

    res.status(200).json({ insights });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
