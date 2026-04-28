export default function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="relative bg-surface-card border border-surface-border rounded-xl p-5 overflow-hidden group hover:border-accent/40 transition-colors duration-200">
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />

      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
          {label}
        </span>
        {icon && <span className="text-lg opacity-60">{icon}</span>}
      </div>

      <div
        className={`font-mono text-2xl font-semibold tracking-tight ${accent ? "text-accent" : "text-gray-100"}`}
      >
        {value ?? "—"}
      </div>

      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </div>
  );
}
