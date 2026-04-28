import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRepairs,
  setFilters,
  selectFilteredRepairs,
} from "../features/repairs/repairsSlice.js";
import RepairTable from "../components/repairs/RepairTable.jsx";

const STATUS_OPTS = [
  { value: "", label: "All Statuses" },
  { value: "received", label: "Received" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export default function RepairsPage() {
  const dispatch = useDispatch();
  const { loading, error, filters } = useSelector((s) => s.repairs);
  const repairs = useSelector(selectFilteredRepairs);

  // Load all repairs on mount
  useEffect(() => {
    dispatch(fetchRepairs({ limit: 100 }));
  }, [dispatch]);

  const handleSearch = (e) => dispatch(setFilters({ search: e.target.value }));
  const handleStatus = (e) => dispatch(setFilters({ status: e.target.value }));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Repairs</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {repairs.length} result{repairs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
            🔍
          </span>
          <input
            className="w-full bg-surface-card border border-surface-border rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent/60 transition-colors"
            placeholder="Search by customer, phone model or issue…"
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
        <select
          className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-accent/60 transition-colors"
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

      {/* Content */}
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
