/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FDFCF7',
          100: '#FAF8F2',
          200: '#F4EFE6',
          300: '#E9E2D5',
          400: '#D5CCBD',
        },
        charcoal: {
          900: '#141413',
          800: '#1F1E1D',
          700: '#2E2D2B',
          600: '#484643',
          500: '#696763',
          400: '#94918B',
          300: '#BCB8B1',
          200: '#E0DDD7',
          100: '#EFECE6',
        },
        editorial: {
          burgundy: {
            DEFAULT: '#821D30',
            50: '#FDF2F4',
            100: '#FCE7EB',
            200: '#F7C9D2',
            600: '#9A2239',
            700: '#821D30',
            800: '#681525',
            900: '#4E0E1B',
          },
          ink: '#111827',
          sand: '#F7F5F0',
          parchment: '#EFECE4',
          gold: '#C59B27'
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.03), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
