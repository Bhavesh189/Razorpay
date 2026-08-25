/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        infinity: {
          primary: "#4f46e5",       // Royal Indigo
          primaryHover: "#4338ca",  // Dark Indigo
          primaryLight: "#eef2ff",  // Soft Indigo Tint
          secondary: "#7c3aed",     // Cosmic Violet
          secondaryLight: "#f5f3ff",
          cyan: "#06b6d4",          // Electric Cyan Accent
          cyanLight: "#ecfeff",
          gold: "#f59e0b",          // Amber Gold
          ratingGreen: "#10b981",   // Emerald Green
          bgLight: "#f8fafc",       // Crisp Off-White
          cardBg: "#ffffff",
          border: "#e2e8f0",
          textPrimary: "#0f172a",   // Deep Slate
          textSecondary: "#475569",
          textMuted: "#94a3b8",
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'infinity': '0 4px 20px -2px rgba(79, 70, 229, 0.08)',
        'infinity-hover': '0 10px 30px -5px rgba(79, 70, 229, 0.16)',
        'infinity-glow': '0 0 25px rgba(99, 102, 241, 0.35)',
        'dropdown': '0 10px 40px -10px rgba(15, 23, 42, 0.2)',
      },
      screens: {
        'xs': '400px',
        '2xl': '1536px',
        '3xl': '1800px',
      }
    },
  },
  plugins: [],
}
