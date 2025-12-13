import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#0A0F1A",
          surface: "#141D2B"
        },
        text: {
          primary: "#E0E7FF",
          secondary: "#93A3C0"
        },
        accent: {
          critical: "#FF4D4F",
          warning: "#FFC107",
          success: "#36D180",
          knowledge: "#4A90E2"
        }
      },
      boxShadow: {
        glow: "0 0 20px rgba(74, 144, 226, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;

