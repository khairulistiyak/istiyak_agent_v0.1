/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ["Outfit", "Inter", "sans-serif"],
      },
      colors: {
        cyber: {
          dark: "#08090a",      // Extremely dark workspace background
          card: "#0d0e12",      // Sidebar / drawer background
          "card-border": "rgba(255, 255, 255, 0.05)", // Very subtle border
          primary: "rgba(255, 255, 255, 0.95)",   // High contrast white
          secondary: "rgba(255, 255, 255, 0.4)", // Translucent grey
          accent: "rgba(255, 255, 255, 0.2)",    // Subtle accent border
          "text-primary": "#f3f4f6",
          "text-secondary": "#a1a1aa",
          "text-muted": "#52525b",
        }
      },
      backdropBlur: {
        xs: "2px",
      }
    },
  },
  plugins: [],
}
