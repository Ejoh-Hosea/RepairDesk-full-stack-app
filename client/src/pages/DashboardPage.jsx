import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardStats,
  fetchTrends,
  fetchActivity,
} from "../features/dashboard/dashboardSlice.js";
import StatCard from "../components/ui/StatCard.jsx";
import TrendChart from "../components/dashboard/TrendChart.jsx";
import ActivityFeed from "../components/dashboard/ActivityFeed.jsx";
import TopIssues from "../components/dashboard/TopIssues.jsx";
import { formatCurrency } from "../utils/formatters.js";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { stats, trends, activity, loading } = useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchTrends());
    dispatch(fetchActivity());
  }, [dispatch]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-0.5">
          {new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }).format(new Date())}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Repairs Today"
          value={loading ? "…" : (stats?.today?.repairs ?? 0)}
          icon="🔧"
        />
        <StatCard
          label="Pending"
          value={loading ? "…" : (stats?.pending ?? 0)}
          sub="received + in-progress"
          icon="⏳"
        />
        <StatCard
          label="Revenue Today"
          value={loading ? "…" : formatCurrency(stats?.today?.revenue)}
          accent
          icon="💰"
        />
        <StatCard
          label="Profit Today"
          value={loading ? "…" : formatCurrency(stats?.today?.profit)}
          sub="price − cost"
          icon="📈"
          accent
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-400 mb-4">
            Revenue — Last 7 Days
          </h2>
          <TrendChart data={trends} type="revenue" />
        </div>
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-400 mb-4">
            Repairs — Last 7 Days
          </h2>
          <TrendChart data={trends} type="repairs" />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top issues — spans 1 col */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-400 mb-4">
            Most Common Issues
          </h2>
          <TopIssues issues={stats?.topIssues} />
        </div>

        {/* Activity feed — spans 2 cols */}
        <div className="lg:col-span-2 bg-surface-card border border-surface-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-400 mb-2">
            Recent Activity
          </h2>
          <ActivityFeed activity={activity} />
        </div>
      </div>
    </div>
  );
}
