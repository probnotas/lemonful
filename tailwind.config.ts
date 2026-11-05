import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#1d2b7a", light: "#2f3f9e", dark: "#141f5c" },
        coral: { DEFAULT: "#f0365a", dark: "#d42347", light: "#fde4ea" },
        teal: { DEFAULT: "#0f8ca8", dark: "#0b6f86", light: "#e2f4f8" },
        lemon: { DEFAULT: "#fbcd2f", dark: "#f0b90b", light: "#fff6d6" },
        grape: { DEFAULT: "#8b5cf6", light: "#efe8ff" },
        leaf: { DEFAULT: "#22a06b", light: "#e4f6ec" },
        cream: "#fffbf1",
      },
      fontFamily: {
        display: ['"Baloo 2"', "Nunito", "system-ui", "sans-serif"],
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(29,43,122,0.18)",
        pop: "0 4px 0 0 rgba(0,0,0,0.12)",
      },
      borderRadius: { "4xl": "2rem" },
    },
  },
  plugins: [],
} satisfies Config;
