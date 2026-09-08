/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        overclock: {
          orange: '#FF5500',
          'orange-glow': '#FF7722',
          red: '#FF1144',
          cyan: '#00F0FF',
          green: '#00FF66',
          yellow: '#FFDD00',
          dark: {
            950: '#07080C',
            900: '#0B0D14',
            850: '#10131F',
            800: '#161B2C',
            700: '#1F263E',
            600: '#2D3757',
            500: '#46537D',
          },
          light: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          }
        }
      },
      fontFamily: {
        display: ['Orbitron', 'Rajdhani', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 240, 255, 0.45)',
        'glow-orange': '0 0 25px rgba(255, 85, 0, 0.45)',
        'glow-red': '0 0 25px rgba(255, 17, 68, 0.45)',
        'glow-green': '0 0 25px rgba(0, 255, 102, 0.45)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        'flash-green': {
          '0%': { backgroundColor: 'rgba(0, 255, 102, 0.7)' },
          '100%': { backgroundColor: 'transparent' }
        },
        'flash-red': {
          '0%': { backgroundColor: 'rgba(255, 17, 68, 0.7)' },
          '100%': { backgroundColor: 'transparent' }
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-green': 'flash-green 1s ease-out forwards',
        'flash-red': 'flash-red 1s ease-out forwards',
      }
    },
  },
  plugins: [],
}
