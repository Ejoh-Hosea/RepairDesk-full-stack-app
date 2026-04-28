import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  createUser,
  updateUserRole,
  resetUserPassword,
  deleteUser,
  clearActionError,
} from "../features/users/usersSlice.js";
import Modal from "../components/ui/Modal.jsx";
import Button from "../components/ui/Button.jsx";
import { formatDate } from "../utils/formatters.js";

// ─── Sub-components ──────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${
        role === "admin"
          ? "bg-accent/15 text-amber-300 border-accent/30"
          : "bg-surface-hover text-gray-400 border-surface-border"
      }`}
    >
      {role === "admin" ? "⬡" : "◯"} {role}
    </span>
  );
}

function Avatar({ username }) {
  return (
    <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-sm font-semibold text-accent uppercase flex-shrink-0">
      {username?.[0] ?? "?"}
    </div>
  );
}

// ─── Create User Form ─────────────────────────────────────────────────────────

function CreateUserForm({ onSubmit, onCancel, loading, error }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "technician",
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.username.trim() || form.username.length < 3)
      errs.username = "At least 3 characters";
    if (!form.password || form.password.length < 6)
      errs.password = "At least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const inputClass = (field) =>
    `w-full bg-surface border ${errors[field] ? "border-red-500/60" : "border-surface-border"} rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent/60 transition-colors`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Username
        </label>
        <input
          className={inputClass("username")}
          placeholder="e.g. sarah_tech"
          value={form.username}
          onChange={set("username")}
          autoComplete="off"
        />
        {errors.username && (
          <p className="mt-1 text-xs text-red-400">{errors.username}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Password
        </label>
        <input
          type="password"
          className={inputClass("password")}
          placeholder="Minimum 6 characters"
          value={form.password}
          onChange={set("password")}
          autoComplete="new-password"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-400">{errors.password}</p>
        )}
        <p className="mt-1 text-xs text-gray-600">
          Share this with the user — they can't change it themselves yet.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Role
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["technician", "admin"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: r }))}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                form.role === r
                  ? "border-accent/60 bg-accent/10 text-accent"
                  : "border-surface-border bg-surface text-gray-500 hover:border-accent/30 hover:text-gray-300"
              }`}
            >
              <div className="text-lg mb-0.5">
                {r === "technician" ? "🔧" : "⚙️"}
              </div>
              <div className="capitalize">{r}</div>
              <div className="text-xs font-normal mt-0.5 opacity-70">
                {r === "technician" ? "Repairs only" : "Full access"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" loading={loading} className="flex-1">
          Create User
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── Reset Password Form ──────────────────────────────────────────────────────

function ResetPasswordForm({ user, onSubmit, onCancel, loading, error }) {
  const [newPassword, setNewPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setLocalError("At least 6 characters");
      return;
    }
    setLocalError("");
    onSubmit(newPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-400">
        Reset password for{" "}
        <span className="text-gray-200 font-medium">{user.username}</span>.
        They'll need to use the new password on their next login.
      </p>

      {(error || localError) && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
          {error || localError}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          New Password
        </label>
        <input
          type="password"
          className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent/60 transition-colors"
          placeholder="Minimum 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoFocus
          autoComplete="new-password"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" loading={loading} className="flex-1">
          Set New Password
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const dispatch = useDispatch();
  const {
    items: users,
    loading,
    error,
    actionError,
  } = useSelector((s) => s.users);
  const currentUser = useSelector((s) => s.auth.user);

  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Auto-clear success message after 3s
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const closeCreate = () => {
    setShowCreate(false);
    dispatch(clearActionError());
  };
  const closeReset = () => {
    setResetTarget(null);
    dispatch(clearActionError());
  };
  const closeDelete = () => {
    setDeleteTarget(null);
    dispatch(clearActionError());
  };

  const handleCreate = async (data) => {
    setActionLoading(true);
    const result = await dispatch(createUser(data));
    setActionLoading(false);
    if (!result.error) {
      closeCreate();
      setSuccessMsg(`User "${data.username}" created successfully`);
    }
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === "admin" ? "technician" : "admin";
    await dispatch(updateUserRole({ id: user._id, role: newRole }));
  };

  const handleResetPassword = async (newPassword) => {
    setActionLoading(true);
    const result = await dispatch(
      resetUserPassword({ id: resetTarget._id, newPassword }),
    );
    setActionLoading(false);
    if (!result.error) {
      closeReset();
      setSuccessMsg(`Password reset for "${resetTarget.username}"`);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    const result = await dispatch(deleteUser(deleteTarget._id));
    setActionLoading(false);
    if (!result.error) {
      closeDelete();
      setSuccessMsg(`User "${deleteTarget.username}" deleted`);
    }
  };

  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Users</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {users.length} account{users.length !== 1 ? "s" : ""} · {adminCount}{" "}
            admin{adminCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <span className="text-base leading-none">+</span>
          Add User
        </Button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-400 animate-slide-up">
          <span>✓</span> {successMsg}
        </div>
      )}

      {/* User list */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-400 text-center py-10">{error}</p>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-sm">No users yet. Add one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border/50">
            {users.map((user) => {
              const isCurrentUser =
                String(user._id) === String(currentUser?.id);
              return (
                <div
                  key={user._id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-surface-hover/30 transition-colors group"
                >
                  <Avatar username={user.username} />

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-200 text-sm">
                        {user.username}
                      </span>
                      {isCurrentUser && (
                        <span className="text-xs text-gray-600 font-mono">
                          (you)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Joined {formatDate(user.createdAt)}
                    </p>
                  </div>

                  {/* Role badge — clickable to toggle (except your own) */}
                  <div className="flex-shrink-0">
                    {isCurrentUser ? (
                      <RoleBadge role={user.role} />
                    ) : (
                      <button
                        onClick={() => handleRoleToggle(user)}
                        title={`Click to change to ${user.role === "admin" ? "technician" : "admin"}`}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <RoleBadge role={user.role} />
                      </button>
                    )}
                  </div>

                  {/* Actions — only visible on hover */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setResetTarget(user)}
                    >
                      Reset pwd
                    </Button>
                    {!isCurrentUser && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteTarget(user)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-surface-card border border-surface-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">🔧</span>
            <span className="text-sm font-medium text-gray-300">
              Technician
            </span>
            <RoleBadge role="technician" />
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Can view dashboard, create repairs, update status and fields. Cannot
            manage users or access admin settings.
          </p>
        </div>
        <div className="bg-surface-card border border-surface-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">⚙️</span>
            <span className="text-sm font-medium text-gray-300">Admin</span>
            <RoleBadge role="admin" />
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Full access — everything a technician can do, plus creating users,
            resetting passwords, changing roles, and deleting accounts.
          </p>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}

      <Modal isOpen={showCreate} onClose={closeCreate} title="Add New User">
        <CreateUserForm
          onSubmit={handleCreate}
          onCancel={closeCreate}
          loading={actionLoading}
          error={actionError}
        />
      </Modal>

      <Modal isOpen={!!resetTarget} onClose={closeReset} title="Reset Password">
        {resetTarget && (
          <ResetPasswordForm
            user={resetTarget}
            onSubmit={handleResetPassword}
            onCancel={closeReset}
            loading={actionLoading}
            error={actionError}
          />
        )}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={closeDelete} title="Delete User">
        <p className="text-sm text-gray-400 mb-5">
          Permanently delete{" "}
          <span className="text-gray-200 font-medium">
            {deleteTarget?.username}
          </span>
          ? They will be logged out immediately and cannot sign back in.
        </p>
        {actionError && (
          <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            {actionError}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="danger"
            loading={actionLoading}
            onClick={handleDelete}
            className="flex-1"
          >
            Delete User
          </Button>
          <Button variant="secondary" onClick={closeDelete}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
