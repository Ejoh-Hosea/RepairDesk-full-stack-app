import { useState, useEffect } from "react";

export const THEMES = [
  {
    id: "theme-midnight",
    label: "Midnight",
    color: "#161b27",
    accent: "#f59e0b",
  },
  {
    id: "theme-charcoal",
    label: "Charcoal",
    color: "#1a1a1a",
    accent: "#f59e0b",
  },
  { id: "theme-ocean", label: "Ocean", color: "#111827", accent: "#3b82f6" },
  { id: "theme-forest", label: "Forest", color: "#111a11", accent: "#22c55e" },
];

const DEFAULT_THEME = "theme-midnight";
const STORAGE_KEY = "repairdesk-theme";
const ALL_THEME_IDS = THEMES.map((t) => t.id);

export function useTheme() {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME,
  );

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove(...ALL_THEME_IDS);
    html.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (id) => {
    if (ALL_THEME_IDS.includes(id)) setThemeState(id);
  };

  return { theme, setTheme, themes: THEMES };
}
