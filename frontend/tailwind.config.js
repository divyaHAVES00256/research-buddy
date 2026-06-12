// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind to scan all JSX files so it knows which classes to include
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  darkMode: "class",

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      colors: {
        background: "#0f1117",
        sidebar: "#1a1d27",
        surface: "#1e2130",
        border: "#2a2d3e",
        accent: {
          DEFAULT: "#6c63ff",
          hover: "#5a52d5",      
          glow: "#6c63ff40",     
        },
        "text-primary": "#e2e8f0",
        "text-secondary": "#94a3b8",
        success: "#10b981",
        error: "#ef4444",
      },

      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 8px #6c63ff40" },
          "50%": { boxShadow: "0 0 20px #6c63ff80" },
        },
      },

      animation: {
        "fade-in-up": "fadeInUp 0.35s ease-out forwards",
        "glow-pulse": "glowPulse 1.5s ease-in-out infinite",
      },
    },
  },

  plugins: [],
};