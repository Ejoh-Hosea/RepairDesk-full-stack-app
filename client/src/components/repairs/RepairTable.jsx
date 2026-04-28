import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  updateRepair,
  deleteRepair,
} from "../../features/repairs/repairsSlice.js";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import RepairForm from "./RepairForm.jsx";
import { formatCurrency, formatDate } from "../../utils/formatters.js";

export default function RepairTable({ repairs }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (data) => {
    setLoading(true);
    await dispatch(updateRepair({ id: editing._id, data }));
    setLoading(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    setLoading(true);
    await dispatch(deleteRepair(deleting._id));
    setLoading(false);
    setDeleting(null);
  };

  // Quick status cycle without opening modal
  const cycleStatus = async (repair) => {
    const cycle = {
      received: "in-progress",
      "in-progress": "done",
      done: "received",
    };
    dispatch(
      updateRepair({ id: repair._id, data: { status: cycle[repair.status] } }),
    );
  };

  if (repairs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        <div className="text-4xl mb-3">🔧</div>
        <p className="text-sm">No repairs found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              {[
                "Customer",
                "Phone Model",
                "Issue",
                "Cost",
                "Price",
                "Profit",
                "Status",
                "Date",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider px-4 py-3 first:pl-0 last:pr-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/50">
            {repairs.map((r) => (
              <tr
                key={r._id}
                className="hover:bg-surface-hover/30 transition-colors group"
              >
                <td className="px-4 py-3 first:pl-0 font-medium text-gray-200 whitespace-nowrap">
                  {r.customerName}
                </td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {r.phoneModel}
                </td>
                <td className="px-4 py-3 text-gray-400 max-w-[160px] truncate">
                  {r.issue}
                </td>
                <td className="px-4 py-3 font-mono text-gray-400">
                  {formatCurrency(r.cost)}
                </td>
                <td className="px-4 py-3 font-mono text-gray-300">
                  {formatCurrency(r.price)}
                </td>
                <td
                  className={`px-4 py-3 font-mono font-medium ${r.price - r.cost >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {formatCurrency(r.price - r.cost)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => cycleStatus(r)}
                    title="Click to advance status"
                  >
                    <Badge status={r.status} />
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                  {formatDate(r.createdAt)}
                </td>
                <td className="px-4 py-3 last:pr-0">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(r)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleting(r)}
                    >
                      Del
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {repairs.map((r) => (
          <div
            key={r._id}
            className="bg-surface-card border border-surface-border rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-200 text-sm">
                  {r.customerName}
                </p>
                <p className="text-xs text-gray-500">{r.phoneModel}</p>
              </div>
              <Badge status={r.status} />
            </div>
            <p className="text-xs text-gray-500 mb-3">{r.issue}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-3 text-xs font-mono">
                <span className="text-gray-500">{formatCurrency(r.cost)}</span>
                <span className="text-gray-300">{formatCurrency(r.price)}</span>
                <span
                  className={`font-medium ${r.price - r.cost >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {formatCurrency(r.price - r.cost)}
                </span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setDeleting(r)}
                >
                  Del
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Repair"
      >
        {editing && (
          <RepairForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            loading={loading}
          />
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete Repair"
      >
        <p className="text-sm text-gray-400 mb-5">
          Delete repair for{" "}
          <span className="text-gray-200 font-medium">
            {deleting?.customerName}
          </span>{" "}
          — {deleting?.phoneModel}? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button
            variant="danger"
            loading={loading}
            onClick={handleDelete}
            className="flex-1"
          >
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
