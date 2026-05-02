import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

// @desc    Get user budgets with current spending
// @route   GET /api/budget
// @access  Private
export const getBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const budgets = await Budget.find({
      userId,
      month: currentMonth,
      year: currentYear
    });

    // Calculate current spending for each budget category
    const budgetsWithSpending = await Promise.all(budgets.map(async (budget) => {
      const matchStage = {
        userId,
        date: {
          $gte: new Date(currentYear, currentMonth - 1, 1),
          $lt: new Date(currentYear, currentMonth, 1)
        }
      };

      if (budget.category !== 'All') {
        matchStage.category = budget.category;
      }

      const spending = await Transaction.aggregate([
        { $match: matchStage },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const currentSpend = spending.length > 0 ? spending[0].total : 0;

      return {
        ...budget._doc,
        currentSpend,
        remaining: budget.limit - currentSpend,
        percentUsed: parseFloat(((currentSpend / budget.limit) * 100).toFixed(2))
      };
    }));

    res.status(200).json(budgetsWithSpending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update a budget
// @route   POST /api/budget
// @access  Private
export const setBudget = async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;
    const userId = req.user._id;

    if (!category || !limit || !month || !year) {
      res.status(400);
      throw new Error('Please provide category, limit, month, and year');
    }

    // Check if budget exists for this category/month/year
    let budget = await Budget.findOne({ userId, category, month, year });

    if (budget) {
      budget.limit = limit;
      await budget.save();
    } else {
      budget = await Budget.create({
        userId,
        category,
        limit,
        month,
        year
      });
    }

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
