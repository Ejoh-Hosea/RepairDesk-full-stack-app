import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../features/auth/authSlice.js";
import { useTheme } from "../../hooks/useTheme.js";

// ─── Theme picker popover ─────────────────────────────────────────────────────

function ThemePicker() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Change theme"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-surface-hover transition-colors"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="13.5" cy="6.5" r="1.5" />
          <circle cx="17.5" cy="10.5" r="1.5" />
          <circle cx="8.5" cy="7.5" r="1.5" />
          <circle cx="6.5" cy="12.5" r="1.5" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute right-0 top-9 w-48 bg-surface-card border border-surface-border rounded-xl shadow-2xl p-2 animate-slide-up z-50">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider px-2 pt-1 pb-2">
            Theme
          </p>
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                theme === t.id
                  ? "bg-surface-hover text-gray-200"
                  : "text-gray-500 hover:text-gray-300 hover:bg-surface-hover"
              }`}
            >
              {/* Swatch */}
              <span
                className="w-6 h-6 rounded-md border border-surface-border flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: t.color }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: t.accent }}
                />
              </span>
              <span>{t.label}</span>
              {theme === t.id && (
                <span className="ml-auto text-accent text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar({ onAddRepair }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useSelector((s) => s.auth.user);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  const navLinks = [
    { path: "/", label: "Dashboard" },
    { path: "/repairs", label: "Repairs" },
    { path: "/reports", label: "Reports" },
    ...(user?.role === "admin" ? [{ path: "/users", label: "Users" }] : []),
  ];

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-40 bg-surface-card/80 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <span className="w-6 h-6 bg-accent rounded-md flex items-center justify-center text-black font-bold text-xs">
            R
          </span>
          <span className="font-semibold text-sm text-gray-100 tracking-tight">
            RepairDesk
          </span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ path, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive(path)
                  ? "bg-accent/15 text-accent"
                  : "text-gray-500 hover:text-gray-300 hover:bg-surface-hover"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Add Repair */}
          <button
            onClick={onAddRepair}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-black text-sm font-semibold rounded-lg hover:bg-amber-400 active:scale-95 transition-all"
          >
            <span className="text-base leading-none">+</span>
            Add Repair
          </button>

          {/* Theme picker */}
          <ThemePicker />

          {/* User info */}
          <div className="flex items-center gap-2 pl-1 border-l border-surface-border">
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-semibold text-accent uppercase">
              {user?.username?.[0] ?? "U"}
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xs text-gray-300">{user?.username}</span>
              <span className="text-xs text-gray-600">{user?.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors ml-1"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
