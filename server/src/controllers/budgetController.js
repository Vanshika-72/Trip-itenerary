import mongoose from 'mongoose';
import Activity, { ACTIVITY_CATEGORIES } from '../models/Activity.js';

export const getTripBudget = async (req, res, next) => {
  try {
    const trip = req.trip;
    const tripId = trip._id;

    // Use MongoDB aggregation pipeline for category breakdown
    const categoryAggregation = await Activity.aggregate([
      { $match: { tripId: new mongoose.Types.ObjectId(tripId) } },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$cost' },
          activityCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    // Build complete category map ensuring all categories are represented or listed
    const categoryTotals = {};
    ACTIVITY_CATEGORIES.forEach((cat) => {
      categoryTotals[cat] = 0;
    });

    let totalPlannedCost = 0;
    categoryAggregation.forEach((item) => {
      const categoryName = item._id || 'Other';
      categoryTotals[categoryName] = item.totalSpent || 0;
      totalPlannedCost += item.totalSpent || 0;
    });

    // Format for Recharts consumption
    const categoryData = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
      }))
      .filter((item) => item.amount > 0 || true); // Include all or non-zero

    const totalBudget = trip.budget || 0;
    const remainingBudget = totalBudget - totalPlannedCost;
    const budgetPercentage =
      totalBudget > 0 ? Math.min(100, Math.round((totalPlannedCost / totalBudget) * 100)) : 0;
    const isOverBudget = totalBudget > 0 && totalPlannedCost > totalBudget;

    res.status(200).json({
      success: true,
      budget: {
        totalBudget,
        totalPlannedCost,
        remainingBudget,
        budgetPercentage,
        isOverBudget,
        currency: trip.currency || 'USD',
        byCategory: categoryAggregation.map((cat) => ({
          category: cat._id || 'Other',
          total: cat.totalSpent,
          count: cat.activityCount,
        })),
        chartData: categoryData,
      },
    });
  } catch (error) {
    next(error);
  }
};
