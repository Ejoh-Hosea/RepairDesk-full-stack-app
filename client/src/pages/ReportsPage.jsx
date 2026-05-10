import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMonthlyReport } from "../features/reports/reportsSlice.js";
import { formatCurrency } from "../utils/formatters.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const downloadPDF = async (report) => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const now = new Date();
  const generatedOn = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.setFillColor(15, 17, 23);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("ReviveMobile", 14, 14);
  doc.setTextColor(156, 163, 175);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Monthly Revenue & Profit Report", 14, 21);
  doc.text(`Generated: ${generatedOn}`, 196, 21, { align: "right" });

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("This Month Summary", 14, 40);

  const { thisMonth, allTime } = report;
  autoTable(doc, {
    startY: 44,
    head: [["Metric", "Value"]],
    body: [
      ["Repairs completed", String(thisMonth.repairs)],
      ["Revenue", formatCurrency(thisMonth.revenue)],
      ["Profit", formatCurrency(thisMonth.profit)],
      ["Profit margin", `${thisMonth.marginPct}%`],
      ["Avg profit / job", formatCurrency(thisMonth.avgPerRepair)],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 } },
    margin: { left: 14, right: 14 },
  });

  const afterSummary = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Monthly Breakdown — Last 12 Months", 14, afterSummary);

  autoTable(doc, {
    startY: afterSummary + 4,
    head: [["Month", "Repairs", "Revenue", "Profit", "Margin"]],
    body: [...report.monthly]
      .reverse()
      .map((m) => [
        m.label,
        String(m.repairs),
        formatCurrency(m.revenue),
        formatCurrency(m.profit),
        `${m.marginPct}%`,
      ]),
    theme: "striped",
    headStyles: {
      fillColor: [30, 30, 40],
      textColor: [245, 158, 11],
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 14, right: 14 },
  });

  const afterTable = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("All-Time Totals", 14, afterTable);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(
    `${allTime.repairs} repairs · Revenue: ${formatCurrency(allTime.revenue)} · Profit: ${formatCurrency(allTime.profit)}`,
    14,
    afterTable + 6,
  );

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`ReviveMobile Report · Page ${i} of ${pageCount}`, 105, 290, {
      align: "center",
    });
  }

  doc.save(
    `repairdesk-report-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}.pdf`,
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl px-4 py-3 text-xs shadow-2xl">
      <p className="text-gray-400 font-medium mb-2">{label}</p>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          className="flex items-center justify-between gap-6 mb-1"
        >
          <span
            style={{ color: p.color }}
            className="flex items-center gap-1.5"
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: p.color }}
            />
            {p.name}
          </span>
          <span className="font-mono font-medium text-gray-200">
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
      {payload[0] && payload[1] && (
        <div className="mt-2 pt-2 border-t border-surface-border text-gray-500 flex justify-between">
          <span>Margin</span>
          <span className="font-mono text-gray-300">
            {payload[0].value > 0
              ? Math.round((payload[1].value / payload[0].value) * 100)
              : 0}
            %
          </span>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, sub, highlight }) => (
  <div
    className={`bg-surface-card border rounded-xl p-5 ${highlight ? "border-accent/40" : "border-surface-border"}`}
  >
    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
      {label}
    </p>
    <p
      className={`font-mono text-2xl font-semibold ${highlight ? "text-accent" : "text-gray-100"}`}
    >
      {value}
    </p>
    {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
  </div>
);

const isCurrentMonth = (key) => {
  const now = new Date();
  return (
    key ===
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
};

export default function ReportsPage() {
  const dispatch = useDispatch();
  const { monthly: report, loading, error } = useSelector((s) => s.reports);

  useEffect(() => {
    dispatch(fetchMonthlyReport());
  }, [dispatch]);

  if (loading)
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return <p className="text-sm text-red-400 text-center py-16">{error}</p>;
  if (!report) return null;

  const { monthly, thisMonth, allTime } = report;
  const bestMonth = [...monthly].sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Reports</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Monthly revenue and profit breakdown
          </p>
        </div>
        <button
          onClick={() => downloadPDF(report)}
          className="flex items-center gap-2 px-4 py-2 bg-surface-card border border-surface-border text-sm text-gray-300 font-medium rounded-lg hover:border-accent/50 hover:text-accent transition-all active:scale-95"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF
        </button>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
          This Month
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            label="Repairs"
            value={thisMonth.repairs}
            sub="jobs completed"
          />
          <SummaryCard
            label="Revenue"
            value={formatCurrency(thisMonth.revenue)}
            sub="total charged"
            highlight
          />
          <SummaryCard
            label="Profit"
            value={formatCurrency(thisMonth.profit)}
            sub={`${thisMonth.marginPct}% margin`}
            highlight
          />
          <SummaryCard
            label="Avg Profit/Job"
            value={formatCurrency(thisMonth.avgPerRepair)}
            sub="per repair"
          />
        </div>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-gray-300">
            Revenue vs Profit — Last 12 Months
          </h2>
          {bestMonth?.revenue > 0 && (
            <span className="text-xs text-gray-600">
              Best month:{" "}
              <span className="text-gray-400">{bestMonth.label}</span> ·{" "}
              {formatCurrency(bestMonth.revenue)}
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={monthly}
            margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
            barGap={2}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#252d3d"
              vertical={false}
            />
            <XAxis
              dataKey="short"
              tick={{ fill: "#4b5563", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#4b5563", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
              }
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              formatter={(value) => (
                <span style={{ color: "#6b7280" }}>{value}</span>
              )}
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="#f59e0b"
              radius={[3, 3, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="profit"
              name="Profit"
              fill="#22c55e"
              radius={[3, 3, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="text-sm font-medium text-gray-300">
            Monthly Breakdown
          </h2>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {["Month", "Repairs", "Revenue", "Profit", "Margin %"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider px-5 py-3"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {[...monthly].reverse().map((row) => {
                const current = isCurrentMonth(row.key);
                return (
                  <tr
                    key={row.key}
                    className={`transition-colors ${current ? "bg-accent/5" : "hover:bg-surface-hover/30"}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${current ? "text-accent" : "text-gray-200"}`}
                        >
                          {row.label}
                        </span>
                        {current && (
                          <span className="text-xs px-1.5 py-0.5 bg-accent/15 text-accent rounded-md border border-accent/25">
                            current
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-400">
                      {row.repairs}
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-200">
                      {formatCurrency(row.revenue)}
                    </td>
                    <td
                      className={`px-5 py-3 font-mono font-medium ${row.profit >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {formatCurrency(row.profit)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden max-w-[80px]">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${Math.min(row.marginPct, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs text-gray-400 w-8 text-right">
                          {row.marginPct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-surface-border/50">
          {[...monthly].reverse().map((row) => {
            const current = isCurrentMonth(row.key);
            return (
              <div
                key={row.key}
                className={`px-4 py-4 ${current ? "bg-accent/5" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${current ? "text-accent" : "text-gray-200"}`}
                    >
                      {row.label}
                    </span>
                    {current && (
                      <span className="text-xs px-1.5 py-0.5 bg-accent/15 text-accent rounded-md border border-accent/25">
                        current
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600">
                    {row.repairs} repairs
                  </span>
                </div>
                <div className="flex gap-4 text-xs font-mono">
                  <div>
                    <p className="text-gray-600 mb-0.5">Revenue</p>
                    <p className="text-gray-200">
                      {formatCurrency(row.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-0.5">Profit</p>
                    <p
                      className={
                        row.profit >= 0 ? "text-green-400" : "text-red-400"
                      }
                    >
                      {formatCurrency(row.profit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-0.5">Margin</p>
                    <p className="text-gray-300">{row.marginPct}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-surface-border bg-surface/50 hidden md:flex items-center gap-8">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            All Time
          </span>
          <span className="font-mono text-sm text-gray-400">
            {allTime.repairs} repairs
          </span>
          <span className="font-mono text-sm text-gray-200">
            {formatCurrency(allTime.revenue)}
          </span>
          <span className="font-mono text-sm font-medium text-green-400">
            {formatCurrency(allTime.profit)}
          </span>
        </div>
      </div>
    </div>
  );
}
