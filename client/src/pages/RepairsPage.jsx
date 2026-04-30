import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRepairs,
  setFilters,
  clearFilters,
  selectFilteredRepairs,
} from "../features/repairs/repairsSlice.js";
import RepairTable from "../components/repairs/RepairTable.jsx";

// ─── Date preset chips ───────────────────────────────────────────────────────

const DATE_PRESETS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
  { value: "last_month", label: "Last month" },
];

const STATUS_OPTS = [
  { value: "", label: "All statuses" },
  { value: "received", label: "Received" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

// ─── Main page ───────────────────────────────────────────────────────────────

export default function RepairsPage() {
  const dispatch = useDispatch();
  const { loading, error, filters } = useSelector((s) => s.repairs);
  const repairs = useSelector(selectFilteredRepairs);
  const totalLoaded = useSelector((s) => s.repairs.items.length);

  useEffect(() => {
    dispatch(fetchRepairs({ limit: 500 }));
  }, [dispatch]);

  const handleSearch = (e) => dispatch(setFilters({ search: e.target.value }));
  const handleStatus = (e) => dispatch(setFilters({ status: e.target.value }));
  const handleDatePreset = (preset) =>
    dispatch(setFilters({ datePreset: preset }));

  const hasActiveFilters =
    filters.status !== "" ||
    filters.search !== "" ||
    filters.datePreset !== "all";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Repairs</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {repairs.length === totalLoaded
              ? `${repairs.length} repairs`
              : `${repairs.length} of ${totalLoaded} repairs`}
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => dispatch(clearFilters())}
            className="text-xs text-gray-500 hover:text-accent transition-colors flex items-center gap-1.5"
          >
            <span>✕</span> Clear filters
          </button>
        )}
      </div>

      {/* ── Filter bar ───────────────────────────────────────────── */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-4 space-y-3">
        {/* Row 1 — Search + Status */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none">
              🔍
            </span>
            <input
              className="w-full bg-surface border border-surface-border rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent/60 transition-colors"
              placeholder="Search customer, phone model or issue…"
              value={filters.search}
              onChange={handleSearch}
            />
            {filters.search && (
              <button
                onClick={() => dispatch(setFilters({ search: "" }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status dropdown */}
          <select
            className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-accent/60 transition-colors min-w-[140px]"
            value={filters.status}
            onChange={handleStatus}
          >
            {STATUS_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2 — Date preset chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-600 mr-1">Period:</span>
          {DATE_PRESETS.map((p) => {
            const active = filters.datePreset === p.value;
            return (
              <button
                key={p.value}
                onClick={() => handleDatePreset(p.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 border ${
                  active
                    ? "bg-accent text-black border-accent"
                    : "bg-surface border-surface-border text-gray-500 hover:text-gray-300 hover:border-accent/30"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────── */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-4 sm:p-6">
        {error ? (
          <p className="text-sm text-red-400 text-center py-8">{error}</p>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <RepairTable repairs={repairs} />
        )}
      </div>
    </div>
  );
}
