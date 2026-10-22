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
            DEFAULT: "#00488F",
            dark: "#09335E",
            navy: "#0B1F33",
            ink: "#071827",
            light: "#EBF3FC",
            hover: "#003A73",
          },
          green: {
            DEFAULT: "#16A34A",
            light: "#ECFDF5",
            hover: "#15803D",
            vivid: "#22C55E",
          },
          teal: {
            DEFAULT: "#16B8A6",
            dark: "#0E8E83",
            light: "#F0FDFA",
          },
          slate: {
            DEFAULT: "#64748B",
            dark: "#334155",
            light: "#F8FAFC",
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
