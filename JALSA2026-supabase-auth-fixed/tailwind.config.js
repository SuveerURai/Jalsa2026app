/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Gold / Flame accent
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        gold: {
          light: '#FDE047',
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          glow: 'rgba(245, 158, 11, 0.25)',
        },
        dark: {
          bg: '#050505',
          card: '#0F0F12',
          border: '#23232A',
          hover: '#1B1B22',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'red-glow': '0 0 25px -5px rgba(239, 68, 68, 0.3)',
        'green-glow': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
};
