import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-2": "var(--color-surface-2)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        "accent-light": "var(--color-accent-light)",
        "accent-glow": "var(--color-accent-glow)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        "text-faint": "var(--color-text-faint)",
        ai: "var(--color-ai)",
      },
      fontFamily: {
        display: ["Pixelify Sans", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        ui: "14px",
        body: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
