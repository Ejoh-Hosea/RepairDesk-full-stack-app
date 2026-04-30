/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        // All surface + accent colors point to CSS variables.
        // Switching a theme = swapping CSS variable values on <html>.
        // Zero component changes needed.
        surface: {
          DEFAULT: "var(--surface)",
          card: "var(--surface-card)",
          hover: "var(--surface-hover)",
          border: "var(--surface-border)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          dim: "var(--accent-dim)",
          glow: "var(--accent-glow)",
        },
        status: {
          received: "#64748b",
          "received-bg": "rgba(100,116,139,0.15)",
          inprogress: "#f59e0b",
          "inprogress-bg": "rgba(245,158,11,0.15)",
          done: "#22c55e",
          "done-bg": "rgba(34,197,94,0.15)",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        pulseSoft: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
      },
    },
  },
  plugins: [],
};
