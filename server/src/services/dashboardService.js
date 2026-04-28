import { Repair } from "../models/Repair.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { cacheService, CACHE_KEYS } from "../cache/cacheService.js";

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const dashboardService = {
  /**
   * Main dashboard stats — cached for 60s.
   * Runs parallel aggregations for max speed.
   */
  async getStats() {
    const cached = cacheService.get(CACHE_KEYS.DASHBOARD_STATS);
    if (cached) return cached;

    const today = startOfToday();

    const [todayStats, pendingCount, issueFrequency] = await Promise.all([
      // Today's repairs: count + revenue + profit
      Repair.aggregate([
        { $match: { createdAt: { $gte: today } } },
        {
          $group: {
            _id: null,
            totalRepairs: { $sum: 1 },
            totalRevenue: { $sum: "$price" },
            totalProfit: { $sum: { $subtract: ["$price", "$cost"] } },
          },
        },
      ]),

      // Pending = received + in-progress
      Repair.countDocuments({
        status: { $in: ["received", "in-progress"] },
      }),

      // Most common issues (top 5) with percentages
      Repair.aggregate([
        {
          $group: {
            _id: "$issue",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const stats = todayStats[0] || {
      totalRepairs: 0,
      totalRevenue: 0,
      totalProfit: 0,
    };
    const totalIssues = issueFrequency.reduce((sum, i) => sum + i.count, 0);

    const result = {
      today: {
        repairs: stats.totalRepairs,
        revenue: Math.round(stats.totalRevenue * 100) / 100,
        profit: Math.round(stats.totalProfit * 100) / 100,
      },
      pending: pendingCount,
      topIssues: issueFrequency.map((i) => ({
        issue: i._id,
        count: i.count,
        percentage:
          totalIssues > 0 ? Math.round((i.count / totalIssues) * 100) : 0,
      })),
    };

    cacheService.set(CACHE_KEYS.DASHBOARD_STATS, result, 60);
    return result;
  },

  /**
   * Last 7 days trends — repairs per day + revenue per day.
   * Uses $dateToString to group by calendar day.
   */
  async getTrends() {
    const cached = cacheService.get(CACHE_KEYS.DASHBOARD_TRENDS);
    if (cached) return cached;

    const sevenDaysAgo = daysAgo(7);

    const trends = await Repair.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          repairs: { $sum: 1 },
          revenue: { $sum: "$price" },
          profit: { $sum: { $subtract: ["$price", "$cost"] } },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          repairs: 1,
          revenue: { $round: ["$revenue", 2] },
          profit: { $round: ["$profit", 2] },
          _id: 0,
        },
      },
    ]);

    // Fill in days with no repairs so the chart has no gaps
    const result = fillMissingDays(trends, 7);

    cacheService.set(CACHE_KEYS.DASHBOARD_TRENDS, result, 60);
    return result;
  },

  /**
   * Recent activity feed — last 20 events, no caching (always fresh).
   */
  async getActivity(limit = 20) {
    const cached = cacheService.get(CACHE_KEYS.DASHBOARD_ACTIVITY);
    if (cached) return cached;

    const activity = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    cacheService.set(CACHE_KEYS.DASHBOARD_ACTIVITY, activity, 30);
    return activity;
  },
};

/**
 * Ensures every day in the last N days appears in the chart data,
 * even if no repairs occurred that day (prevents chart gaps).
 */
function fillMissingDays(trends, days) {
  const map = new Map(trends.map((t) => [t.date, t]));
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    result.push(
      map.get(dateStr) || { date: dateStr, repairs: 0, revenue: 0, profit: 0 },
    );
  }

  return result;
}
