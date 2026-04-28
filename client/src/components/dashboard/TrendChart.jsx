import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatDateShort, formatCurrency } from "../../utils/formatters.js";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}:{" "}
          {p.dataKey === "repairs" ? p.value : formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function TrendChart({ data, type = "revenue" }) {
  const isRevenue = type === "revenue";
  const dataKey = isRevenue ? "revenue" : "repairs";
  const color = isRevenue ? "#f59e0b" : "#60a5fa";
  const name = isRevenue ? "Revenue" : "Repairs";

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#252d3d"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          tick={{ fill: "#4b5563", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#4b5563", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={isRevenue ? (v) => `$${v}` : undefined}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${type})`}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
