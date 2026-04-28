import {
  STATUS_LABELS,
  STATUS_STYLES,
  STATUS_DOT,
} from "../../utils/formatters.js";

export default function Badge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${STATUS_STYLES[status] ?? ""}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] ?? "bg-gray-400"}`}
      />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
