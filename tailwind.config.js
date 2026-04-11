/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        card: '#111111',
        border: '#1e1e1e',
        'card-hover': '#181818',
        orange: {
          DEFAULT: '#f97316',
          dark: '#ea580c',
          light: '#fb923c',
          muted: 'rgba(249,115,22,0.15)',
        },
        indigo: {
          DEFAULT: '#6366f1',
          muted: 'rgba(99,102,241,0.15)',
        },
        green: {
          DEFAULT: '#22c55e',
          muted: 'rgba(34,197,94,0.15)',
        },
        red: {
          DEFAULT: '#ef4444',
          muted: 'rgba(239,68,68,0.15)',
        },
        yellow: {
          DEFAULT: '#eab308',
          muted: 'rgba(234,179,8,0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-once': 'pulse 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
