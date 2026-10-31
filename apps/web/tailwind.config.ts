import type { Config } from "tailwindcss";

/**
 * Design system 「和モダン」 Editorial Warm.
 * Semua warna memakai CSS variable (lihat app/globals.css) supaya tema terang
 * dan gelap berganti tanpa menulis ulang kelas di komponen.
 * Aturan pemakaian ada di docs/DESIGN-SYSTEM.md.
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
        /* ---- permukaan ---- */
        paper: "rgb(var(--paper) / <alpha-value>)",
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--surface-muted) / <alpha-value>)",
        "surface-inset": "rgb(var(--surface-inset) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        "border-strong": "rgb(var(--border-strong) / <alpha-value>)",

        /* ---- teks ---- */
        fg: "rgb(var(--fg) / <alpha-value>)",
        "fg-muted": "rgb(var(--fg-muted) / <alpha-value>)",
        "fg-subtle": "rgb(var(--fg-subtle) / <alpha-value>)",

        /* ---- aksen brand ---- */
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-strong": "rgb(var(--accent-strong) / <alpha-value>)",
        "accent-soft": "rgb(var(--accent-soft) / <alpha-value>)",
        "accent-contrast": "rgb(var(--accent-contrast) / <alpha-value>)",

        /* ---- level JLPT aktif ---- */
        level: "rgb(var(--level) / <alpha-value>)",
        "level-soft": "rgb(var(--level-soft) / <alpha-value>)",
        "level-contrast": "rgb(var(--level-contrast) / <alpha-value>)",

        /* ---- status ---- */
        danger: "rgb(var(--danger) / <alpha-value>)",
        "danger-soft": "rgb(var(--danger-soft) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        "success-soft": "rgb(var(--success-soft) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        "warning-soft": "rgb(var(--warning-soft) / <alpha-value>)",

        /* ---- skala lama (kompatibilitas) ---- */
        sakura: {
          50: "#fdf5f8",
          100: "#fbe6ee",
          200: "#f6cbd9",
          300: "#efa7bf",
          400: "#e07f9f",
          500: "#c9638a",
          600: "#b04a6b",
          700: "#8f3a55",
        },
        matcha: {
          50: "#f4f7ec",
          100: "#e7efd7",
          200: "#cfe0b0",
          300: "#b0cb84",
          400: "#8fb25c",
          500: "#6f9142",
          600: "#557230",
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
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Newsreader",
          "Iowan Old Style",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        jp: ['"Noto Sans JP"', '"Hiragino Sans"', '"Yu Gothic"', "Meiryo", "sans-serif"],
        "jp-serif": [
          '"Noto Serif JP"',
          '"Yu Mincho"',
          '"Hiragino Mincho ProN"',
          '"MS PMincho"',
          "serif",
        ],
      },
      fontSize: {
        display: ["clamp(2.25rem, 1.55rem + 2.9vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        h1: ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.021em" }],
        h2: ["1.3125rem", { lineHeight: "1.75rem", letterSpacing: "-0.014em" }],
        h3: ["1rem", { lineHeight: "1.5rem", letterSpacing: "-0.006em" }],
        body: ["0.9375rem", { lineHeight: "1.5rem" }],
        caption: ["0.75rem", { lineHeight: "1.0625rem" }],
      },
      boxShadow: {
        soft: "0 1px 2px rgb(26 24 21 / 0.04), 0 1px 1px rgb(26 24 21 / 0.03)",
        lifted: "0 2px 4px rgb(26 24 21 / 0.04), 0 10px 28px -10px rgb(26 24 21 / 0.14)",
        overlay: "0 28px 70px -20px rgb(26 24 21 / 0.32), 0 2px 8px rgb(26 24 21 / 0.06)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.97)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "sheet-up": {
          from: { transform: "translateY(14px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 320ms cubic-bezier(0.22, 1, 0.36, 1) both",
        pop: "pop 180ms ease-out both",
        "sheet-up": "sheet-up 220ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      transitionTimingFunction: {
        emphasized: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
