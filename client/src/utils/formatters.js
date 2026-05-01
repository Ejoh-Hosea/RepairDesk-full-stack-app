export const formatCurrency = (val) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    val ?? 0,
  );

export const formatDate = (dateStr) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));

// FIX: "2025-01-15" parsed with new Date() treats it as UTC midnight.
// In UTC-5 that becomes Jan 14 at 7pm — one day behind.
// Parsing parts manually forces local timezone interpretation.
export const formatDateShort = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = String(dateStr).split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
};

export const STATUS_LABELS = {
  received: "Received",
  "in-progress": "In Progress",
  done: "Done",
};

export const STATUS_STYLES = {
  received: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  "in-progress": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  done: "bg-green-500/15 text-green-400 border-green-500/30",
};

export const STATUS_DOT = {
  received: "bg-slate-400",
  "in-progress": "bg-amber-400 animate-pulse-soft",
  done: "bg-green-400",
};

export const ACTIVITY_LABELS = {
  repair_created: "New repair created",
  repair_updated: "Repair updated",
  repair_status_changed: "Status changed",
  repair_deleted: "Repair deleted",
};

export const ACTIVITY_ICONS = {
  repair_created: "＋",
  repair_updated: "✎",
  repair_status_changed: "⟳",
  repair_deleted: "✕",
};
