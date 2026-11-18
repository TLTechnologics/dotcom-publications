/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dotcom Publications — Maroon x Pastel Yellow Palette
        maroon: {
          DEFAULT: '#651C32',
          primary: '#651C32',
          dark: '#431322',
          light: '#8B4055',
          deep: '#360F1B',
          50: '#FBF5F6',
          100: '#F5E6EA',
          200: '#E8C5CE',
          300: '#D599A9',
          400: '#B8657B',
          500: '#8B4055',
          600: '#651C32',
          700: '#531729',
          800: '#431322',
          900: '#300D18',
        },
        pastel: {
          DEFAULT: '#F6E7A8',
          primary: '#F6E7A8',
          light: '#FFF6D9',
          soft: '#FBEFC4',
          hover: '#EED986',
        },
        neutral: {
          bg: '#FAF8F3',
          surface: '#FFFFFF',
          text: '#292326',
          secondary: '#82777A',
          border: '#EAE3DE',
        },
        semantic: {
          success: '#477A58',
          warning: '#C58B35',
          error: '#B94B4B',
          info: '#557A9C',
        },
        // Backward-compatible tokens mapped to the new palette
        paper: {
          50: '#FFFFFF',
          100: '#FAF8F3',
          200: '#FFF6D9',
          300: '#FBEFC4',
          400: '#EAE3DE',
        },
        charcoal: {
          900: '#292326',
          800: '#292326',
          700: '#4A4145',
          600: '#62585C',
          500: '#82777A',
          400: '#A4999C',
          300: '#C7BFC2',
          200: '#EAE3DE',
          100: '#F5F1EE',
        },
        editorial: {
          burgundy: {
            DEFAULT: '#651C32',
            50: '#FFF6D9',
            100: '#FBEFC4',
            200: '#F6E7A8',
            600: '#8B4055',
            700: '#651C32',
            800: '#431322',
            900: '#300D18',
          },
          ink: '#292326',
          sand: '#FAF8F3',
          parchment: '#FFF6D9',
          gold: '#F6E7A8',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(41, 35, 38, 0.04), 0 1px 2px -1px rgba(41, 35, 38, 0.03)',
        'elevated': '0 4px 12px -2px rgba(101, 28, 50, 0.08), 0 2px 6px -2px rgba(41, 35, 38, 0.04)',
        'card': '0 10px 20px -3px rgba(101, 28, 50, 0.05), 0 4px 6px -2px rgba(41, 35, 38, 0.03)',
        'maroon': '0 4px 14px 0 rgba(101, 28, 50, 0.25)',
        'pastel': '0 4px 14px 0 rgba(246, 231, 168, 0.45)',
      }
    },
  },
  plugins: [],
}
