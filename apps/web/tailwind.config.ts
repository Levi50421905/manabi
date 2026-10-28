import type { Config } from "tailwindcss";

/**
 * Warna netral memakai CSS variable (--ink-*, --paper, --surface) supaya
 * dark mode bisa berganti tanpa menulis ulang setiap kelas di komponen.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--paper) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        sakura: {
          50: "#fff5f8",
          100: "#fde5ee",
          200: "#fbc9db",
          300: "#f6a0bd",
          400: "#ef7fa4",
          500: "#e05e8b",
          600: "#c94f7c",
          700: "#a63d64",
        },
        matcha: {
          50: "#f4f9ec",
          100: "#e6f2d3",
          200: "#cde5ab",
          300: "#aed47c",
          400: "#8cbd52",
          500: "#6e9f3a",
          600: "#547c2b",
        },
        ink: {
          50: "rgb(var(--ink-50) / <alpha-value>)",
          100: "rgb(var(--ink-100) / <alpha-value>)",
          200: "rgb(var(--ink-200) / <alpha-value>)",
          300: "rgb(var(--ink-300) / <alpha-value>)",
          400: "rgb(var(--ink-400) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        ja: ['"Noto Sans JP"', '"Hiragino Sans"', '"Yu Gothic"', "Meiryo", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 300ms ease-out both",
        pop: "pop 180ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
