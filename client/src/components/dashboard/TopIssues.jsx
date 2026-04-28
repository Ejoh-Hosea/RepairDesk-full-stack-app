export default function TopIssues({ issues }) {
  if (!issues?.length) {
    return (
      <p className="text-sm text-gray-600 py-4 text-center">No data yet</p>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((item, i) => (
        <div key={item.issue ?? i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-300 truncate max-w-[200px]">
              {item.issue}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className="font-mono text-xs text-gray-500">
                {item.count}x
              </span>
              <span className="font-mono text-xs text-accent font-medium">
                {item.percentage}%
              </span>
            </div>
          </div>
          <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
