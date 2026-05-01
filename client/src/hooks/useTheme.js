import { useState, useEffect } from "react";

export const THEMES = [
  {
    id: "theme-dark",
    label: "Dark",
    color: "#161b27",
    accent: "#f59e0b",
    icon: "🌙",
  },
  {
    id: "theme-light",
    label: "Light",
    color: "#ffffff",
    accent: "#d97706",
    icon: "☀️",
  },
];

const DEFAULT_THEME = "theme-dark";
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

  const toggleTheme = () => {
    setTheme(theme === "theme-dark" ? "theme-light" : "theme-dark");
  };

  const isDark = theme === "theme-dark";

  return { theme, setTheme, toggleTheme, isDark, themes: THEMES };
}
