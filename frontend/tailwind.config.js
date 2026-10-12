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
        forest: {
          50: '#f0f7f3',
          100: '#dceee3',
          200: '#bcdfcb',
          300: '#91c9ad',
          400: '#62ad8b',
          500: '#3e916e',
          600: '#2d7456',
          700: '#245C43', // Master Forest Green
          800: '#1e4b37',
          900: '#1a3e2e',
          950: '#0e231b',
        },
        leaf: {
          50: '#f3f9f3',
          100: '#e3f3e4',
          200: '#c8e6ca',
          300: '#9ed3a2',
          400: '#69A86B', // Secondary Leaf Green
          500: '#4e9952',
          600: '#3a7c3e',
          700: '#306233',
          800: '#2a4f2c',
          900: '#244226',
        },
        botanical: {
          bg: '#F7F8F2', // Soft off-white
          darkBg: '#121714',
          card: '#FFFFFF',
          darkCard: '#1A211D',
          border: '#E3E7DE',
          darkBorder: '#27332C',
          text: '#2D3748',
          darkText: '#E2E8F0',
          muted: '#6B7A70',
          darkMuted: '#94A39B',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(36, 92, 67, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px -2px rgba(36, 92, 67, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 25px -5px rgba(36, 92, 67, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
