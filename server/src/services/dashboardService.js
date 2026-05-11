import { Repair } from "../models/Repair.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { cacheService, CACHE_KEYS } from "../cache/cacheService.js";

// Timezone for date grouping — set SERVER_TZ in your .env or ECS environment.
// Defaults to America/New_York (Montreal/Eastern).
// Without this, the server (running UTC) would count "today" wrong for local users.
const TZ = process.env.SERVER_TZ || "America/New_York";

/**
 * Returns the UTC Date representing midnight of "today" in the shop's timezone.
 * e.g. In UTC-4, midnight local = 04:00 UTC.
 */
const startOfTodayInTZ = () => {
  const now = new Date();
  // Format today's date string in the target timezone
  const localDateStr = now.toLocaleDateString("en-CA", { timeZone: TZ }); // 'YYYY-MM-DD'
  // Parse that date as UTC midnight, then adjust for timezone offset
  const [year, month, day] = localDateStr.split("-").map(Number);
  // Build a date at midnight in the shop's timezone using Intl
  const midnight = new Date(`${localDateStr}T00:00:00`);
  // Get the offset between UTC and the target timezone at that moment
  const utcDate = new Date(
    Date.UTC(year, month - 1, day, 0, 0, 0) -
      getTimezoneOffsetMs(TZ, new Date(Date.UTC(year, month - 1, day))),
  );
  return utcDate;
};

/**
 * Returns timezone offset in milliseconds for a given timezone at a given date.
 */
const getTimezoneOffsetMs = (tz, date) => {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = date.toLocaleString("en-US", { timeZone: tz });
  return new Date(utcStr) - new Date(tzStr);
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
   */
  async getStats() {
    const cached = cacheService.get(CACHE_KEYS.DASHBOARD_STATS);
    if (cached) return cached;

    const today = startOfTodayInTZ();

    const [todayStats, pendingCount, issueFrequency] = await Promise.all([
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

      Repair.countDocuments({
        status: { $in: ["received", "in-progress"] },
      }),

      Repair.aggregate([
        { $group: { _id: "$issue", count: { $sum: 1 } } },
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
   * Last 7 days trends — timezone-aware grouping.
   * Uses MongoDB $dateToString with timezone so days align with the shop's local time.
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
            // timezone parameter ensures days are grouped by LOCAL date, not UTC date
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: TZ,
            },
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

    const result = fillMissingDays(trends, 7);
    cacheService.set(CACHE_KEYS.DASHBOARD_TRENDS, result, 60);
    return result;
  },

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

function fillMissingDays(trends, days) {
  const map = new Map(trends.map((t) => [t.date, t]));
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Use local date string in the shop's timezone for consistent labels
    const dateStr = d.toLocaleDateString("en-CA", { timeZone: TZ });
    result.push(
      map.get(dateStr) || { date: dateStr, repairs: 0, revenue: 0, profit: 0 },
    );
  }

  return result;
}
