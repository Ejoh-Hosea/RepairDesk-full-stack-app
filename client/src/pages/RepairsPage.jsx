import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRepairs,
  setFilters,
  clearFilters,
  setPage,
  selectPaginatedRepairs,
} from "../features/repairs/repairsSlice.js";
import RepairTable from "../components/repairs/RepairTable.jsx";

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

function Pagination({ currentPage, totalPages, totalCount, pageSize, onPage }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const add = (n) => {
    if (n >= 1 && n <= totalPages && !pages.includes(n)) pages.push(n);
  };
  add(1);
  add(currentPage - 1);
  add(currentPage);
  add(currentPage + 1);
  add(totalPages);
  pages.sort((a, b) => a - b);

  const withGaps = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) withGaps.push("…");
    withGaps.push(p);
  });

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-surface-border">
      <p className="text-xs text-gray-600">
        Showing{" "}
        <span className="text-gray-400 font-medium">
          {from}–{to}
        </span>{" "}
        of <span className="text-gray-400 font-medium">{totalCount}</span>{" "}
        repairs
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
        >
          ‹
        </button>

        {withGaps.map((item, i) =>
          item === "…" ? (
            <span
              key={`gap-${i}`}
              className="w-8 h-8 flex items-center justify-center text-gray-600 text-xs"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPage(item)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                item === currentPage
                  ? "bg-accent text-black"
                  : "text-gray-500 hover:text-gray-300 hover:bg-surface-hover"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          onClick={() => onPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default function RepairsPage() {
  const dispatch = useDispatch();
  const { loading, error, filters } = useSelector((s) => s.repairs);
  const { repairs, totalCount, currentPage, pageSize, totalPages } =
    useSelector(selectPaginatedRepairs);

  useEffect(() => {
    dispatch(fetchRepairs({ limit: 500 }));
  }, [dispatch]);

  const hasActiveFilters =
    filters.status !== "" ||
    filters.search !== "" ||
    filters.datePreset !== "all";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Repairs</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {totalCount} repair{totalCount !== 1 ? "s" : ""}
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

      <div className="bg-surface-card border border-surface-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none">
              🔍
            </span>
            <input
              className="w-full bg-surface border border-surface-border rounded-lg pl-9 pr-8 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent/60 transition-colors"
              placeholder="Search customer, phone model or issue…"
              value={filters.search}
              onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
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
          <select
            className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-accent/60 transition-colors min-w-[140px]"
            value={filters.status}
            onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
          >
            {STATUS_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-600 mr-1">Period:</span>
          {DATE_PRESETS.map((p) => {
            const active = filters.datePreset === p.value;
            return (
              <button
                key={p.value}
                onClick={() => dispatch(setFilters({ datePreset: p.value }))}
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

      <div className="bg-surface-card border border-surface-border rounded-xl p-4 sm:p-6">
        {error ? (
          <p className="text-sm text-red-400 text-center py-8">{error}</p>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <RepairTable repairs={repairs} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPage={(p) => dispatch(setPage(p))}
            />
          </>
        )}
      </div>
    </div>
  );
}
