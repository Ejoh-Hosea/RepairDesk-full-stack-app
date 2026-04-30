import { Repair } from "../models/Repair.js";
import { cacheService } from "../cache/cacheService.js";

const CACHE_KEY_REPORTS = "reports:monthly";

export const reportsService = {
  /**
   * Monthly breakdown for the last 12 months.
   * Returns per-month stats + a current-month summary card + all-time totals.
   */
  async getMonthly() {
    const cached = cacheService.get(CACHE_KEY_REPORTS);
    if (cached) return cached;

    // Start of 12 months ago (first day of that month)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    // Start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [monthlyRaw, thisMonthRaw, allTimeRaw] = await Promise.all([
      // ── Last 12 months grouped by YYYY-MM ──────────────────────────────
      Repair.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            repairs: { $sum: 1 },
            revenue: { $sum: "$price" },
            cost: { $sum: "$cost" },
            profit: { $sum: { $subtract: ["$price", "$cost"] } },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // ── This month summary ─────────────────────────────────────────────
      Repair.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        {
          $group: {
            _id: null,
            repairs: { $sum: 1 },
            revenue: { $sum: "$price" },
            cost: { $sum: "$cost" },
            profit: { $sum: { $subtract: ["$price", "$cost"] } },
          },
        },
      ]),

      // ── All-time totals ────────────────────────────────────────────────
      Repair.aggregate([
        {
          $group: {
            _id: null,
            repairs: { $sum: 1 },
            revenue: { $sum: "$price" },
            profit: { $sum: { $subtract: ["$price", "$cost"] } },
          },
        },
      ]),
    ]);

    // Fill every month slot so chart has no gaps
    const monthly = fillMissingMonths(monthlyRaw, 12);

    const thisMonth = thisMonthRaw[0] ?? {
      repairs: 0,
      revenue: 0,
      cost: 0,
      profit: 0,
    };
    const allTime = allTimeRaw[0] ?? { repairs: 0, revenue: 0, profit: 0 };

    const result = {
      monthly,
      thisMonth: {
        repairs: thisMonth.repairs,
        revenue: round(thisMonth.revenue),
        profit: round(thisMonth.profit),
        // Margin % = profit / revenue * 100
        marginPct:
          thisMonth.revenue > 0
            ? Math.round((thisMonth.profit / thisMonth.revenue) * 100)
            : 0,
        avgPerRepair:
          thisMonth.repairs > 0
            ? round(thisMonth.profit / thisMonth.repairs)
            : 0,
      },
      allTime: {
        repairs: allTime.repairs,
        revenue: round(allTime.revenue),
        profit: round(allTime.profit),
      },
    };

    // Cache for 5 minutes — reports don't need to be real-time
    cacheService.set(CACHE_KEY_REPORTS, result, 300);
    return result;
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const round = (n) => Math.round((n ?? 0) * 100) / 100;

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Ensures all N months appear in order even if no repairs that month.
 * Adds a human-readable `label` field (e.g. "Jan 2025") for chart axes.
 */
function fillMissingMonths(raw, months) {
  // Build a lookup map keyed by "YYYY-MM"
  const map = new Map(
    raw.map((r) => [
      `${r._id.year}-${String(r._id.month).padStart(2, "0")}`,
      r,
    ]),
  );

  const result = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-based
    const key = `${year}-${String(month).padStart(2, "0")}`;
    const found = map.get(key);

    result.push({
      key,
      label: `${MONTH_NAMES[month - 1]} ${year}`,
      short: MONTH_NAMES[month - 1], // For narrow chart axes
      repairs: found?.repairs ?? 0,
      revenue: round(found?.revenue ?? 0),
      profit: round(found?.profit ?? 0),
      marginPct:
        found?.revenue > 0
          ? Math.round(((found.profit ?? 0) / found.revenue) * 100)
          : 0,
    });
  }

  return result;
}
