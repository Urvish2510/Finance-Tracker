import Expense from '../models/Expense.js';
import Deposit from '../models/Deposit.js';
import Category from '../models/Category.js';

// Get comprehensive analytics data
const getAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Get date ranges for comparison
    const now = new Date();
    const dateRanges = getDateRanges(period, now);
    
    // Fetch expenses for current and previous periods
    const [currentExpenses, previousExpenses, allExpenses] = await Promise.all([
      Expense.find({
        date: { $gte: dateRanges.currentStart, $lte: dateRanges.currentEnd }
      }).populate('category'),
      Expense.find({
        date: { $gte: dateRanges.previousStart, $lt: dateRanges.currentStart }
      }).populate('category'),
      Expense.find({}).populate('category')
    ]);

    // Calculate current period metrics
    const currentTotal = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const currentCount = currentExpenses.length;
    const currentAvgPerDay = currentTotal / dateRanges.daysInPeriod;
    
    // Calculate previous period metrics
    const previousTotal = previousExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const previousCount = previousExpenses.length;
    
    // Calculate changes
    const spendingChange = calculatePercentageChange(currentTotal, previousTotal);
    const transactionChange = currentCount - previousCount;
    const transactionChangePercent = calculatePercentageChange(currentCount, previousCount);
    
    // Find top category for current period
    const categoryTotals = {};
    currentExpenses.forEach(expense => {
      const categoryId = expense.category._id.toString();
      const categoryName = expense.category.name;
      const categoryIcon = expense.category.icon;
      
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = {
          id: categoryId,
          name: categoryName,
          icon: categoryIcon,
          amount: 0
        };
      }
      categoryTotals[categoryId].amount += expense.amount;
    });
    
    const topCategory = Object.values(categoryTotals).reduce((max, current) => 
      current.amount > (max?.amount || 0) ? current : max, null
    );

    // Calculate category breakdown
    const categoryBreakdown = await getCategoryBreakdown(allExpenses);
    
    // Generate insights
    const insights = generateInsights(currentTotal, categoryBreakdown, spendingChange, currentCount);
    
    // Monthly trend data (last 6 months)
    const monthlyTrends = await getMonthlyTrends(6);

    const analytics = {
      currentPeriod: {
        totalSpent: currentTotal,
        transactionCount: currentCount,
        avgPerDay: currentAvgPerDay,
        avgPerTransaction: currentCount > 0 ? currentTotal / currentCount : 0
      },
      previousPeriod: {
        totalSpent: previousTotal,
        transactionCount: previousCount
      },
      changes: {
        spending: {
          amount: currentTotal - previousTotal,
          percentage: spendingChange,
          direction: spendingChange > 5 ? 'increase' : spendingChange < -5 ? 'decrease' : 'stable'
        },
        transactions: {
          count: transactionChange,
          percentage: transactionChangePercent,
          direction: transactionChangePercent > 5 ? 'increase' : transactionChangePercent < -5 ? 'decrease' : 'stable'
        }
      },
      topCategory,
      categoryBreakdown,
      insights,
      monthlyTrends,
      period,
      daysInPeriod: dateRanges.daysInPeriod
    };

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error generating analytics', error: error.message });
  }
};

// Get dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    
    // Current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Previous month
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // This week
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    
    // Previous week
    const previousWeekStart = new Date(thisWeekStart);
    previousWeekStart.setDate(thisWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(previousWeekStart);
    previousWeekEnd.setDate(previousWeekStart.getDate() + 6);

    // Fetch all required data
    const [
      allExpenses,
      allDeposits,
      allCategories,
      currentMonthExpenses,
      previousMonthExpenses,
      currentMonthDeposits,
      previousMonthDeposits,
      thisWeekExpenses,
      previousWeekExpenses
    ] = await Promise.all([
      Expense.find({}).populate('category'),
      Deposit.find({}).populate('category'),
      Category.find({}),
      Expense.find({
        date: { $gte: currentMonthStart, $lte: currentMonthEnd }
      }),
      Expense.find({
        date: { $gte: previousMonthStart, $lte: previousMonthEnd }
      }),
      Deposit.find({
        date: { $gte: currentMonthStart, $lte: currentMonthEnd }
      }),
      Deposit.find({
        date: { $gte: previousMonthStart, $lte: previousMonthEnd }
      }),
      Expense.find({
        date: { $gte: thisWeekStart, $lte: thisWeekEnd }
      }),
      Expense.find({
        date: { $gte: previousWeekStart, $lte: previousWeekEnd }
      })
    ]);

    // Calculate totals
    const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalDeposits = allDeposits.reduce((sum, dep) => sum + dep.amount, 0);
    const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const previousMonthTotal = previousMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const currentMonthDepositsTotal = currentMonthDeposits.reduce((sum, dep) => sum + dep.amount, 0);
    const monthlyDeposits = currentMonthDepositsTotal;
    
    // Calculate averages
    const avgExpense = allExpenses.length > 0 ? totalExpenses / allExpenses.length : 0;
    const currentMonthAvg = currentMonthExpenses.length > 0 ? currentMonthTotal / currentMonthExpenses.length : 0;
    const previousMonthAvg = previousMonthExpenses.length > 0 ? previousMonthTotal / previousMonthExpenses.length : 0;
    
    // Calculate changes
    const monthlyChange = calculatePercentageChange(currentMonthTotal, previousMonthTotal);
    const weeklyTransactionChange = thisWeekExpenses.length - previousWeekExpenses.length;
    const avgExpenseChange = calculatePercentageChange(currentMonthAvg, previousMonthAvg);

    const summary = {
      totalExpenses,
      totalDeposits,
      depositsCount: allDeposits.length,
      monthlyDeposits,
      transactionCount: allExpenses.length,
      categoriesCount: allCategories.length,
      avgExpense,
      monthlyChange: {
        percentage: monthlyChange,
        direction: monthlyChange > 0 ? 'increase' : monthlyChange < 0 ? 'decrease' : 'stable',
        amount: currentMonthTotal - previousMonthTotal
      },
      weeklyTransactionChange: {
        count: weeklyTransactionChange,
        direction: weeklyTransactionChange > 0 ? 'increase' : weeklyTransactionChange < 0 ? 'decrease' : 'stable'
      },
      avgExpenseChange: {
        percentage: avgExpenseChange,
        direction: avgExpenseChange > 0 ? 'increase' : avgExpenseChange < 0 ? 'decrease' : 'stable',
        amount: currentMonthAvg - previousMonthAvg
      },
      currentMonth: {
        total: currentMonthTotal,
        count: currentMonthExpenses.length,
        average: currentMonthAvg
      },
      previousMonth: {
        total: previousMonthTotal,
        count: previousMonthExpenses.length,
        average: previousMonthAvg
      },
      thisWeek: {
        count: thisWeekExpenses.length
      },
      previousWeek: {
        count: previousWeekExpenses.length
      }
    };

    res.json(summary);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Error generating dashboard summary', error: error.message });
  }
};

// Helper functions
function getDateRanges(period, now) {
  const ranges = {};
  
  switch (period) {
    case 'week':
      ranges.currentStart = new Date(now);
      ranges.currentStart.setDate(now.getDate() - 7);
      ranges.currentEnd = new Date(now);
      ranges.previousStart = new Date(ranges.currentStart);
      ranges.previousStart.setDate(ranges.currentStart.getDate() - 7);
      ranges.daysInPeriod = 7;
      break;
      
    case 'quarter':
      ranges.currentStart = new Date(now);
      ranges.currentStart.setDate(now.getDate() - 90);
      ranges.currentEnd = new Date(now);
      ranges.previousStart = new Date(ranges.currentStart);
      ranges.previousStart.setDate(ranges.currentStart.getDate() - 90);
      ranges.daysInPeriod = 90;
      break;
      
    case 'year':
      ranges.currentStart = new Date(now);
      ranges.currentStart.setDate(now.getDate() - 365);
      ranges.currentEnd = new Date(now);
      ranges.previousStart = new Date(ranges.currentStart);
      ranges.previousStart.setDate(ranges.currentStart.getDate() - 365);
      ranges.daysInPeriod = 365;
      break;
      
    case 'all':
      ranges.currentStart = new Date('2020-01-01'); // Far back date
      ranges.currentEnd = new Date(now);
      ranges.previousStart = new Date('2019-01-01');
      ranges.daysInPeriod = Math.floor((now - ranges.currentStart) / (1000 * 60 * 60 * 24));
      break;
      
    default: // month
      ranges.currentStart = new Date(now);
      ranges.currentStart.setDate(now.getDate() - 30);
      ranges.currentEnd = new Date(now);
      ranges.previousStart = new Date(ranges.currentStart);
      ranges.previousStart.setDate(ranges.currentStart.getDate() - 30);
      ranges.daysInPeriod = 30;
  }
  
  return ranges;
}

function calculatePercentageChange(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

async function getCategoryBreakdown(expenses) {
  const breakdown = {};
  
  expenses.forEach(expense => {
    const categoryId = expense.category._id.toString();
    if (!breakdown[categoryId]) {
      breakdown[categoryId] = {
        id: categoryId,
        name: expense.category.name,
        icon: expense.category.icon,
        color: expense.category.color,
        count: 0,
        total: 0,
        expenses: []
      };
    }
    breakdown[categoryId].count++;
    breakdown[categoryId].total += expense.amount;
    breakdown[categoryId].expenses.push(expense);
  });

  const total = Object.values(breakdown).reduce((sum, cat) => sum + cat.total, 0);
  
  return Object.values(breakdown).map(cat => ({
    ...cat,
    average: cat.total / cat.count,
    percentage: total > 0 ? (cat.total / total) * 100 : 0,
    trend: calculateCategoryTrend(cat.expenses)
  })).sort((a, b) => b.total - a.total);
}

function calculateCategoryTrend(expenses) {
  if (expenses.length < 2) return { direction: 'stable', icon: '➡️', text: 'Stable' };
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(now.getDate() - 60);
  
  const recentExpenses = expenses.filter(exp => new Date(exp.date) >= thirtyDaysAgo);
  const olderExpenses = expenses.filter(exp => new Date(exp.date) >= sixtyDaysAgo && new Date(exp.date) < thirtyDaysAgo);
  
  const recentTotal = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const olderTotal = olderExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  if (olderTotal === 0 && recentTotal > 0) return { direction: 'increase', icon: '↗️', text: 'Increasing' };
  if (recentTotal === 0 && olderTotal > 0) return { direction: 'decrease', icon: '↘️', text: 'Decreasing' };
  if (olderTotal === 0 && recentTotal === 0) return { direction: 'stable', icon: '➡️', text: 'Stable' };
  
  const change = ((recentTotal - olderTotal) / olderTotal) * 100;
  
  if (change > 10) return { direction: 'increase', icon: '↗️', text: 'Increasing' };
  if (change < -10) return { direction: 'decrease', icon: '↘️', text: 'Decreasing' };
  return { direction: 'stable', icon: '➡️', text: 'Stable' };
}

async function getMonthlyTrends(months) {
  const trends = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthExpenses = await Expense.find({
      date: { $gte: monthStart, $lte: monthEnd }
    });
    
    const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    trends.push({
      month: monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      total,
      count: monthExpenses.length,
      average: monthExpenses.length > 0 ? total / monthExpenses.length : 0
    });
  }
  
  return trends;
}

function generateInsights(totalSpent, categoryBreakdown, spendingChange, transactionCount) {
  const insights = [];
  
  // High spending insight
  if (totalSpent > 50000) { // Adjusted for INR (₹50,000)
    insights.push({
      id: 'high-spending',
      type: 'warning',
      icon: '⚠️',
      title: 'High Spending Alert',
      description: `You've spent ₹${totalSpent.toFixed(2)} this period. Consider reviewing your budget.`,
      action: { text: 'View Expenses', link: '/expenses' }
    });
  }
  
  // Category concentration
  if (categoryBreakdown.length > 0 && categoryBreakdown[0].percentage > 50) {
    insights.push({
      id: 'category-concentration',
      type: 'info',
      icon: '🎯',
      title: 'Category Concentration',
      description: `${categoryBreakdown[0].percentage.toFixed(1)}% of spending is in ${categoryBreakdown[0].name}. Consider diversifying.`
    });
  }
  
  // Spending trend insights
  if (spendingChange > 20) {
    insights.push({
      id: 'spending-increase',
      type: 'warning',
      icon: '📈',
      title: 'Spending Increased',
      description: `Your spending increased by ${spendingChange.toFixed(1)}% compared to the previous period.`
    });
  } else if (spendingChange < -20) {
    insights.push({
      id: 'spending-decrease',
      type: 'success',
      icon: '📉',
      title: 'Great Progress!',
      description: `You reduced spending by ${Math.abs(spendingChange).toFixed(1)}% compared to the previous period.`
    });
  }
  
  // Low activity insight
  if (transactionCount < 5) {
    insights.push({
      id: 'low-activity',
      type: 'info',
      icon: '📝',
      title: 'Low Activity',
      description: 'Consider logging more expenses for better insights.',
      action: { text: 'Add Expense', link: '/expenses' }
    });
  }
  
  return insights;
}

export {
  getAnalytics,
  getDashboardSummary
};
