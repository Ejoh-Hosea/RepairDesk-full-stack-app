import {
  ACTIVITY_LABELS,
  ACTIVITY_ICONS,
  formatDate,
} from "../../utils/formatters.js";

export default function ActivityFeed({ activity }) {
  if (!activity?.length) {
    return (
      <p className="text-sm text-gray-600 py-4 text-center">No activity yet</p>
    );
  }

  return (
    <div className="space-y-0">
      {activity.map((item, i) => (
        <div
          key={item._id ?? i}
          className="flex gap-3 py-3 border-b border-surface-border/50 last:border-0 animate-fade-in"
        >
          <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-surface-hover border border-surface-border flex items-center justify-center text-xs text-gray-400">
            {ACTIVITY_ICONS[item.action] ?? "•"}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-300 font-medium leading-tight">
              {ACTIVITY_LABELS[item.action] ?? item.action}
            </p>
            <p className="text-xs text-gray-600 truncate mt-0.5">
              {item.metadata?.customerName} — {item.metadata?.phoneModel}
              {item.metadata?.oldStatus && item.metadata?.newStatus && (
                <span className="ml-1">
                  ({item.metadata.oldStatus} → {item.metadata.newStatus})
                </span>
              )}
            </p>
            <p className="text-xs text-gray-700 mt-0.5">
              {formatDate(item.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
