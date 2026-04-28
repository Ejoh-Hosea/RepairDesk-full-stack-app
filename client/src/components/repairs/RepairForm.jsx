import { useState } from "react";
import Button from "../ui/Button.jsx";

const INITIAL = {
  customerName: "",
  phoneModel: "",
  issue: "",
  cost: "",
  price: "",
  status: "received",
  notes: "",
};

export default function RepairForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial ?? INITIAL);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = "Required";
    if (!form.phoneModel.trim()) errs.phoneModel = "Required";
    if (!form.issue.trim()) errs.issue = "Required";
    if (form.cost === "" || isNaN(form.cost) || Number(form.cost) < 0)
      errs.cost = "Valid number ≥ 0";
    if (form.price === "" || isNaN(form.price) || Number(form.price) < 0)
      errs.price = "Valid number ≥ 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, cost: Number(form.cost), price: Number(form.price) });
  };

  const inputClass = (field) =>
    `w-full bg-surface border ${errors[field] ? "border-red-500/60" : "border-surface-border"} rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent/60 transition-colors`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Customer Name
          </label>
          <input
            className={inputClass("customerName")}
            placeholder="John Doe"
            value={form.customerName}
            onChange={set("customerName")}
          />
          {errors.customerName && (
            <p className="mt-1 text-xs text-red-400">{errors.customerName}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Phone Model
          </label>
          <input
            className={inputClass("phoneModel")}
            placeholder="iPhone 15 Pro"
            value={form.phoneModel}
            onChange={set("phoneModel")}
          />
          {errors.phoneModel && (
            <p className="mt-1 text-xs text-red-400">{errors.phoneModel}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Issue
        </label>
        <input
          className={inputClass("issue")}
          placeholder="Cracked screen, battery replacement…"
          value={form.issue}
          onChange={set("issue")}
        />
        {errors.issue && (
          <p className="mt-1 text-xs text-red-400">{errors.issue}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Cost (parts)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-sm text-gray-600">
              $
            </span>
            <input
              className={`${inputClass("cost")} pl-6`}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.cost}
              onChange={set("cost")}
            />
          </div>
          {errors.cost && (
            <p className="mt-1 text-xs text-red-400">{errors.cost}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Price (charged)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-sm text-gray-600">
              $
            </span>
            <input
              className={`${inputClass("price")} pl-6`}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={set("price")}
            />
          </div>
          {errors.price && (
            <p className="mt-1 text-xs text-red-400">{errors.price}</p>
          )}
        </div>
      </div>

      {/* Profit preview */}
      {form.cost !== "" &&
        form.price !== "" &&
        !isNaN(form.cost) &&
        !isNaN(form.price) && (
          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-lg border border-surface-border">
            <span className="text-xs text-gray-500">Profit:</span>
            <span
              className={`font-mono text-sm font-medium ${Number(form.price) - Number(form.cost) >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              ${(Number(form.price) - Number(form.cost)).toFixed(2)}
            </span>
          </div>
        )}

      {initial && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Status
          </label>
          <select
            className={inputClass("status")}
            value={form.status}
            onChange={set("status")}
          >
            <option value="received">Received</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Notes <span className="text-gray-600">(optional)</span>
        </label>
        <textarea
          className={`${inputClass("notes")} resize-none`}
          rows={2}
          placeholder="Any additional notes…"
          value={form.notes}
          onChange={set("notes")}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" loading={loading} className="flex-1">
          {initial ? "Save Changes" : "Create Repair"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
