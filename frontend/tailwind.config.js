/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dotcom Publications — Modern Minimalist Pastel Yellow x Architectural Charcoal
        pastel: {
          DEFAULT: '#EED97A',
          primary: '#EED97A',
          light: '#FAF2BA',
          soft: '#FDF7D5',
          hover: '#F5E288',
          deep: '#D6C05E',
        },
        maroon: {
          DEFAULT: '#181716',
          primary: '#181716',
          dark: '#121110',
          light: '#2E2B27',
          deep: '#0D0C0B',
          50: '#FAF9F5',
          100: '#F5F2EB',
          200: '#E8E4DC',
          300: '#D5D0C5',
          400: '#A39D94',
          500: '#736B5E',
          600: '#3D3934',
          700: '#2E2B27',
          800: '#1E1D1B',
          900: '#181716',
        },
        neutral: {
          bg: '#FAF9F5',
          surface: '#FFFFFF',
          text: '#181716',
          secondary: '#736B5E',
          border: '#E8E4DC',
        },
        semantic: {
          success: '#3A754E',
          warning: '#C58B35',
          error: '#D34545',
          info: '#4B7396',
        },
        // Backward-compatible tokens mapped to the new palette
        paper: {
          50: '#FFFFFF',
          100: '#FAF9F5',
          200: '#FAF2BA',
          300: '#FDF7D5',
          400: '#E8E4DC',
        },
        charcoal: {
          900: '#181716',
          800: '#1E1D1B',
          700: '#2E2B27',
          600: '#3D3934',
          500: '#736B5E',
          400: '#A39D94',
          300: '#D5D0C5',
          200: '#E8E4DC',
          100: '#F5F2EB',
        },
        editorial: {
          burgundy: {
            DEFAULT: '#181716',
            50: '#FAF2BA',
            100: '#FDF7D5',
            200: '#EED97A',
            600: '#3D3934',
            700: '#2E2B27',
            800: '#1E1D1B',
            900: '#181716',
          },
          ink: '#181716',
          sand: '#FAF9F5',
          parchment: '#FAF2BA',
          gold: '#EED97A',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(24, 23, 22, 0.04), 0 1px 2px -1px rgba(24, 23, 22, 0.03)',
        'elevated': '0 4px 14px -2px rgba(24, 23, 22, 0.08), 0 2px 6px -2px rgba(24, 23, 22, 0.04)',
        'card': '0 10px 24px -4px rgba(24, 23, 22, 0.06), 0 4px 8px -2px rgba(24, 23, 22, 0.03)',
        'maroon': '0 4px 14px 0 rgba(238, 217, 122, 0.35)',
        'pastel': '0 4px 14px 0 rgba(238, 217, 122, 0.45)',
      }
    },
  },
  plugins: [],
}
