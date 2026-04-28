import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, clearError } from "../features/auth/authSlice.js";
import Button from "../components/ui/Button.jsx";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ username: "", password: "" });

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      {/* Background grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #f59e0b 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 border border-accent/30 rounded-2xl mb-4">
            <span className="text-accent font-bold text-xl">R</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-100">RepairDesk</h1>
          <p className="text-sm text-gray-600 mt-1">
            Sign in to your dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
          {error && (
            <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Username
              </label>
              <input
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent/60 transition-colors"
                placeholder="admin"
                autoComplete="username"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent/60 transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required
              />
            </div>
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-700 mt-4">
          RepairDesk v1.0 — Phone Repair Management
        </p>
      </div>
    </div>
  );
}
