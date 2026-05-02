import Transaction from '../models/Transaction.js';

// @desc    Get dashboard analytics (current month stats)
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Current month transactions
    const currentMonthTransactions = await Transaction.find({
      userId,
      date: { $gte: currentMonthStart, $lt: nextMonthStart }
    });

    // Previous month transactions
    const prevMonthTransactions = await Transaction.find({
      userId,
      date: { $gte: prevMonthStart, $lt: currentMonthStart }
    });

    // Calculate totals
    const totalCurrentMonth = currentMonthTransactions.reduce((acc, curr) => acc + curr.amount, 0);
    const totalPrevMonth = prevMonthTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate month-over-month delta percentage
    let delta = 0;
    if (totalPrevMonth > 0) {
      delta = ((totalCurrentMonth - totalPrevMonth) / totalPrevMonth) * 100;
    }

    // Category breakdown for current month
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: currentMonthStart, $lt: nextMonthStart }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Format for frontend Recharts
    const formattedCategories = categoryBreakdown.map(cat => ({
      name: cat._id,
      value: cat.total
    }));

    // Daily spending for the current month
    const dailySpending = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: currentMonthStart, $lt: nextMonthStart }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      totalSpend: totalCurrentMonth,
      previousMonthSpend: totalPrevMonth,
      delta: parseFloat(delta.toFixed(2)),
      categories: formattedCategories,
      dailySpending: dailySpending.map(day => ({ date: day._id, total: day.total })),
      recentTransactions: currentMonthTransactions.sort((a, b) => b.date - a.date).slice(0, 5)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
