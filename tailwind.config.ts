import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f0f11',
          1: '#16161a',
          2: '#1c1c21',
          3: '#232329',
        },
        border: {
          DEFAULT: '#2a2a32',
          muted: '#1f1f26',
        },
        accent: {
          DEFAULT: '#4f8ef7',
          hover: '#3d7cf5',
          muted: 'rgb(79 142 247 / 0.12)',
        },
        text: {
          DEFAULT: '#e2e8f0',
          muted: '#94a3b8',
          subtle: '#64748b',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
