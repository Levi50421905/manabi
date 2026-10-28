import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#fffdfb",
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
          50: "#f6f6f8",
          100: "#e9e9ee",
          200: "#d5d5dd",
          300: "#b4b4c1",
          400: "#8b8b9c",
          500: "#6b6b7d",
          600: "#545463",
          700: "#40404d",
          800: "#2b2b35",
          900: "#1b1b21",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        ja: ['"Noto Sans JP"', '"Hiragino Sans"', '"Yu Gothic"', "Meiryo", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pop": {
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
