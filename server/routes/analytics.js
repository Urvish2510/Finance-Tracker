import express from 'express';
import Expense from '../models/Expense.js';
import Deposit from '../models/Deposit.js';
import UserSettings from '../models/UserSettings.js';

const router = express.Router();

// GET /api/analytics/summary
router.get('/summary', async (req, res) => {
	try {
		// Supported query params:
		// 1) month=YYYY-MM (existing behavior)
		// 2) startDate=ISO&endDate=ISO (custom range)
		// 3) period=week|month|quarter|year (rolling windows ending now)
		let { month, startDate, endDate, period } = req.query;
		let rangeStart = null;
		let rangeEnd = null;
		const now = new Date();
		const endOfDay = d => { const e = new Date(d); e.setHours(23,59,59,999); return e; };

		if (startDate && endDate) {
			const s = new Date(startDate);
			const e = endOfDay(new Date(endDate));
			if (isNaN(s) || isNaN(e)) return res.status(400).json({ error: 'Invalid startDate or endDate' });
			if (s > e) return res.status(400).json({ error: 'startDate must be before or equal to endDate' });
			rangeStart = s; rangeEnd = e;
		} else if (month) {
			if (!/^\d{4}-\d{2}$/.test(month)) {
				return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
			}
			const [year, m] = month.split('-').map(Number);
			rangeStart = new Date(year, m - 1, 1);
			rangeEnd = endOfDay(new Date(year, m, 0));
		} else if (period) {
			const p = period.toLowerCase();
			switch (p) {
				case 'week': rangeStart = new Date(now); rangeStart.setDate(now.getDate()-7); break;
				case 'month': rangeStart = new Date(now); rangeStart.setMonth(now.getMonth()-1); break;
				case 'quarter': rangeStart = new Date(now); rangeStart.setMonth(now.getMonth()-3); break;
				case 'year': rangeStart = new Date(now); rangeStart.setFullYear(now.getFullYear()-1); break;
				default: return res.status(400).json({ error: 'Invalid period. Use week|month|quarter|year' });
			}
			rangeEnd = now;
		}

		let dateFilter = {};
		if (rangeStart && rangeEnd) {
			dateFilter = { date: { $gte: rangeStart, $lte: rangeEnd } };
		}

		const [expenses, deposits, settings] = await Promise.all([
			Expense.find(dateFilter).populate('category', 'name icon color'),
			Deposit.find(dateFilter).populate('category', 'name icon color'),
			UserSettings.getOrCreateDefault()
		]);

		const totalExpenses = expenses.reduce((s,e)=>s+e.amount,0);
		const totalIncome = deposits.reduce((s,d)=>s+d.amount,0);
		const balance = totalIncome - totalExpenses;

		const expenseByCategory = {};
		expenses.forEach(exp => {
			const id = exp.category._id.toString();
			if(!expenseByCategory[id]) {
				expenseByCategory[id] = { _id:id, name:exp.category.name, icon:exp.category.icon, color:exp.category.color, total:0, count:0 };
			}
			expenseByCategory[id].total += exp.amount;
			expenseByCategory[id].count += 1;
		});

		res.json({
			range: {
				month: month || null,
				period: period || null,
				startDate: rangeStart ? rangeStart.toISOString() : null,
				endDate: rangeEnd ? rangeEnd.toISOString() : null
			},
			totalExpenses,
			totalIncome,
			balance,
			currency: settings.currency,
			categoryBreakdown: Object.values(expenseByCategory)
		});
	} catch (err) {
		console.error('Analytics summary error', err);
		res.status(500).json({ error: 'Failed to compute analytics summary' });
	}
});

// GET /api/analytics/budget-status
router.get('/budget-status', async (req, res) => {
	try {
		const [expenses, settings] = await Promise.all([
			Expense.find({}, 'amount'),
			UserSettings.getOrCreateDefault()
		]);
		const currentExpenses = expenses.reduce((s,e)=>s+e.amount,0);
		const remainingBudget = settings.budgetLimit - currentExpenses;
		let warningLevel = 'safe';
		const ratio = settings.budgetLimit > 0 ? currentExpenses / settings.budgetLimit : 0;
		if (ratio >= 1) warningLevel = 'over';
		else if (ratio >= 0.9) warningLevel = 'critical';
		else if (ratio >= 0.7) warningLevel = 'warning';
		res.json({
			budgetLimit: settings.budgetLimit,
			currentExpenses,
			remainingBudget,
			isOverBudget: remainingBudget < 0,
			warningLevel
		});
	} catch (err) {
		console.error('Budget status error', err);
		res.status(500).json({ error: 'Failed to compute budget status' });
	}
});

export default router;
