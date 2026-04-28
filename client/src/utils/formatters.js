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

export const formatDateShort = (dateStr) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(dateStr),
  );

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
