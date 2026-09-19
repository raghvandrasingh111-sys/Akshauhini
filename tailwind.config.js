/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        medikiosk: {
          primary: '#0F5132',
          'primary-dark': '#0A3E29',
          secondary: '#0D9488',
          accent: '#16A34A',
          emergency: '#DC3545',
          'emergency-light': '#FEE2E2',
          surface: '#F8FAFC',
          muted: '#64748B',
          border: '#E2E8F0',
        },
        ayush: {
          primary: '#92400E',
          surface: '#FFFBEB',
          accent: '#D97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        kiosk: '0 4px 24px rgba(15, 81, 50, 0.12)',
        card: '0 2px 12px rgba(15, 23, 42, 0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
