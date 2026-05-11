import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../features/auth/authSlice.js";
import { useTheme } from "../../hooks/useTheme.js";

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = ({ name, size = 20 }) => {
  const icons = {
    dashboard: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    repairs: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    reports: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    users: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    logout: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    sun: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
    moon: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
    plus: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  };
  return icons[name] ?? null;
};

// ─── User menu popover ────────────────────────────────────────────────────────

function UserMenu({ user, onLogout, toggleTheme, isDark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-semibold text-accent uppercase hover:bg-accent/30 transition-colors"
      >
        {user?.username?.[0] ?? "U"}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-52 bg-surface-card border border-surface-border rounded-xl shadow-2xl p-2 animate-slide-up z-50">
          {/* User info */}
          <div className="px-3 py-2 mb-1 border-b border-surface-border">
            <p className="text-sm font-medium text-gray-200">
              {user?.username}
            </p>
            <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => {
              toggleTheme();
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-surface-hover transition-colors"
          >
            <Icon name={isDark ? "sun" : "moon"} size={15} />
            {isDark ? "Light mode" : "Dark mode"}
          </button>

          {/* Sign out */}
          <button
            onClick={() => {
              onLogout();
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-1 border border-red-500/20"
          >
            <Icon name="logout" size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Desktop Navbar ───────────────────────────────────────────────────────────

export default function Navbar({ onAddRepair }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useSelector((s) => s.auth.user);
  const { toggleTheme, isDark } = useTheme();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  const navLinks = [
    { path: "/", label: "Dashboard", icon: "dashboard" },
    { path: "/repairs", label: "Repairs", icon: "repairs" },
    { path: "/reports", label: "Reports", icon: "reports" },
    ...(user?.role === "admin"
      ? [{ path: "/users", label: "Users", icon: "users" }]
      : []),
  ];

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* ── Desktop top navbar ───────────────────────────────────────── */}
      <nav className="hidden md:flex sticky top-0 z-40 bg-surface-card/80 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-2 flex-shrink-0">
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
              <Icon name="plus" size={14} />
              Add Repair
            </button>

            {/* User menu with theme toggle + sign out */}
            <UserMenu
              user={user}
              onLogout={handleLogout}
              toggleTheme={toggleTheme}
              isDark={isDark}
            />
          </div>
        </div>
      </nav>

      {/* ── Mobile top bar — logo + user menu only ───────────────────── */}
      <nav className="md:hidden sticky top-0 z-40 bg-surface-card/90 backdrop-blur-md border-b border-surface-border">
        <div className="h-13 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-accent rounded-md flex items-center justify-center text-black font-bold text-xs">
              R
            </span>
            <span className="font-semibold text-sm text-gray-100 tracking-tight">
              RepairDesk
            </span>
          </div>
          <UserMenu
            user={user}
            onLogout={handleLogout}
            toggleTheme={toggleTheme}
            isDark={isDark}
          />
        </div>
      </nav>

      {/* ── Mobile bottom tab bar ─────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-surface-border safe-area-pb">
        <div className="flex items-center justify-around px-2 h-16">
          {navLinks.map(({ path, label, icon }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
              >
                <span className={active ? "text-accent" : "text-gray-600"}>
                  <Icon name={icon} size={22} />
                </span>
                <span
                  className={`text-xs font-medium ${active ? "text-accent" : "text-gray-600"}`}
                >
                  {label}
                </span>
              </button>
            );
          })}

          {/* FAB — Add Repair — in the bottom bar */}
          <button
            onClick={onAddRepair}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
          >
            <span className="w-10 h-10 bg-accent text-black rounded-full flex items-center justify-center shadow-lg shadow-accent/30 active:scale-90 transition-transform -mt-5">
              <Icon name="plus" size={20} />
            </span>
            <span className="text-xs font-medium text-accent">Add</span>
          </button>
        </div>
      </div>
    </>
  );
}
