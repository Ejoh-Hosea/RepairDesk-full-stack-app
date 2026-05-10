import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../features/auth/authSlice.js";
import { useTheme } from "../../hooks/useTheme.js";

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
        <div className="flex items-center gap-2 mr-2">
          <span className="w-6 h-6 bg-accent rounded-md flex items-center justify-center text-black font-bold text-xs">
            R
          </span>
          <span className="font-semibold text-sm text-gray-100 tracking-tight">
            ReviveMobile
          </span>
        </div>

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
          <button
            onClick={onAddRepair}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-black text-sm font-semibold rounded-lg hover:bg-amber-400 active:scale-95 transition-all"
          >
            <span className="text-base leading-none">+</span>
            Add Repair
          </button>

          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-surface-hover transition-colors text-base"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-surface-border">
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
