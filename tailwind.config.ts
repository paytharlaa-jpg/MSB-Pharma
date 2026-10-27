import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            DEFAULT: "#1b4db3",
            dark: "#143e94",
            navy: "#0f2d6b",
            ink: "#091c42",
            light: "#edf3fd",
            hover: "#153e94",
            accent: "#2563eb",
          },
          green: {
            DEFAULT: "#3a991d",
            light: "#edf8eb",
            hover: "#2e7b17",
            vivid: "#48bd24",
            dark: "#236311",
          },
          teal: {
            DEFAULT: "#1b4db3",
            dark: "#143e94",
            light: "#edf3fd",
          },
          slate: {
            DEFAULT: "#64748B",
            dark: "#1e293b",
            light: "#f8fafc",
            border: "#E2E8F0",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-space-grotesk)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
