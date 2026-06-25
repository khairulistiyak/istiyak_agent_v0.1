/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: 'var(--cyber-dark, #07080d)',
          card: 'var(--cyber-card, rgba(18, 20, 28, 0.85))',
          cardBorder: 'var(--cyber-card-border, rgba(255, 255, 255, 0.08))',
          glow: 'var(--cyber-glow, rgba(6, 182, 212, 0.15))',
          primary: 'var(--cyber-primary, #06b6d4)',
          secondary: 'var(--cyber-secondary, #8b5cf6)',
          accent: 'var(--cyber-accent, #10b981)',
          textPrimary: 'var(--cyber-text-primary, #f3f4f6)',
          textSecondary: 'var(--cyber-text-secondary, #a1a1aa)',
          textMuted: 'var(--cyber-text-muted, #52525b)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

