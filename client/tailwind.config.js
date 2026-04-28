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
        // Base surfaces
        surface: {
          DEFAULT: "#0f1117",
          card: "#161b27",
          hover: "#1c2333",
          border: "#252d3d",
        },
        // Brand accent — electric amber
        accent: {
          DEFAULT: "#f59e0b",
          dim: "#b45309",
          glow: "rgba(245,158,11,0.15)",
        },
        // Status palette
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
