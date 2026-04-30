import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMonthlyReport } from "../features/reports/reportsSlice.js";
import { formatCurrency } from "../utils/formatters.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

// ─── Custom tooltip for the bar chart ────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl px-4 py-3 text-xs shadow-2xl">
      <p className="text-gray-400 font-medium mb-2">{label}</p>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          className="flex items-center justify-between gap-6 mb-1"
        >
          <span
            style={{ color: p.color }}
            className="flex items-center gap-1.5"
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: p.color }}
            />
            {p.name}
          </span>
          <span className="font-mono font-medium text-gray-200">
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
      {payload[0] && payload[1] && (
        <div className="mt-2 pt-2 border-t border-surface-border text-gray-500 flex justify-between">
          <span>Margin</span>
          <span className="font-mono text-gray-300">
            {payload[0].value > 0
              ? Math.round((payload[1].value / payload[0].value) * 100)
              : 0}
            %
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Summary card ─────────────────────────────────────────────────────────────

const SummaryCard = ({ label, value, sub, highlight }) => (
  <div
    className={`bg-surface-card border rounded-xl p-5 ${highlight ? "border-accent/40" : "border-surface-border"}`}
  >
    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
      {label}
    </p>
    <p
      className={`font-mono text-2xl font-semibold ${highlight ? "text-accent" : "text-gray-100"}`}
    >
      {value}
    </p>
    {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
  </div>
);

// ─── Monthly table row ────────────────────────────────────────────────────────

const isCurrentMonth = (key) => {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return key === current;
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const dispatch = useDispatch();
  const { monthly: report, loading, error } = useSelector((s) => s.reports);

  useEffect(() => {
    dispatch(fetchMonthlyReport());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400 text-center py-16">{error}</p>;
  }

  if (!report) return null;

  const { monthly, thisMonth, allTime } = report;

  // Best month by revenue
  const bestMonth = [...monthly].sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-gray-100">Reports</h1>
        <p className="text-sm text-gray-600 mt-0.5">
          Monthly revenue and profit breakdown
        </p>
      </div>

      {/* ── This month summary cards ─────────────────────────────── */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
          This Month
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            label="Repairs"
            value={thisMonth.repairs}
            sub="jobs completed"
          />
          <SummaryCard
            label="Revenue"
            value={formatCurrency(thisMonth.revenue)}
            sub="total charged"
            highlight
          />
          <SummaryCard
            label="Profit"
            value={formatCurrency(thisMonth.profit)}
            sub={`${thisMonth.marginPct}% margin`}
            highlight
          />
          <SummaryCard
            label="Avg Profit / Job"
            value={formatCurrency(thisMonth.avgPerRepair)}
            sub="per repair"
          />
        </div>
      </div>

      {/* ── Bar chart — last 12 months ───────────────────────────── */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-gray-300">
            Revenue vs Profit — Last 12 Months
          </h2>
          {bestMonth?.revenue > 0 && (
            <span className="text-xs text-gray-600">
              Best month:{" "}
              <span className="text-gray-400">{bestMonth.label}</span> ·{" "}
              {formatCurrency(bestMonth.revenue)}
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={monthly}
            margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
            barGap={2}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#252d3d"
              vertical={false}
            />
            <XAxis
              dataKey="short"
              tick={{ fill: "#4b5563", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#4b5563", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
              }
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#6b7280", paddingTop: 12 }}
              formatter={(value) => (
                <span style={{ color: "#6b7280" }}>{value}</span>
              )}
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="#f59e0b"
              radius={[3, 3, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="profit"
              name="Profit"
              fill="#22c55e"
              radius={[3, 3, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Monthly breakdown table ──────────────────────────────── */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="text-sm font-medium text-gray-300">
            Monthly Breakdown
          </h2>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {["Month", "Repairs", "Revenue", "Profit", "Margin %"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider px-5 py-3"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {[...monthly].reverse().map((row) => {
                const current = isCurrentMonth(row.key);
                return (
                  <tr
                    key={row.key}
                    className={`transition-colors ${current ? "bg-accent/5" : "hover:bg-surface-hover/30"}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${current ? "text-accent" : "text-gray-200"}`}
                        >
                          {row.label}
                        </span>
                        {current && (
                          <span className="text-xs px-1.5 py-0.5 bg-accent/15 text-accent rounded-md border border-accent/25">
                            current
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-400">
                      {row.repairs}
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-200">
                      {formatCurrency(row.revenue)}
                    </td>
                    <td
                      className={`px-5 py-3 font-mono font-medium ${row.profit >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {formatCurrency(row.profit)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden max-w-[80px]">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(row.marginPct, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs text-gray-400 w-8 text-right">
                          {row.marginPct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-surface-border/50">
          {[...monthly].reverse().map((row) => {
            const current = isCurrentMonth(row.key);
            return (
              <div
                key={row.key}
                className={`px-4 py-4 ${current ? "bg-accent/5" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${current ? "text-accent" : "text-gray-200"}`}
                    >
                      {row.label}
                    </span>
                    {current && (
                      <span className="text-xs px-1.5 py-0.5 bg-accent/15 text-accent rounded-md border border-accent/25">
                        current
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600">
                    {row.repairs} repairs
                  </span>
                </div>
                <div className="flex gap-4 text-xs font-mono">
                  <div>
                    <p className="text-gray-600 mb-0.5">Revenue</p>
                    <p className="text-gray-200">
                      {formatCurrency(row.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-0.5">Profit</p>
                    <p
                      className={
                        row.profit >= 0 ? "text-green-400" : "text-red-400"
                      }
                    >
                      {formatCurrency(row.profit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-0.5">Margin</p>
                    <p className="text-gray-300">{row.marginPct}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* All-time footer */}
        <div className="px-5 py-4 border-t border-surface-border bg-surface/50 hidden md:flex items-center gap-8">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            All Time
          </span>
          <span className="font-mono text-sm text-gray-400">
            {allTime.repairs} repairs
          </span>
          <span className="font-mono text-sm text-gray-200">
            {formatCurrency(allTime.revenue)}
          </span>
          <span className="font-mono text-sm font-medium text-green-400">
            {formatCurrency(allTime.profit)}
          </span>
        </div>
      </div>
    </div>
  );
}
