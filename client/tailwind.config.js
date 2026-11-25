/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f5f2',
          100: '#dde9e2',
          200: '#bed4c7',
          300: '#95b7a5',
          400: '#69947f',
          500: '#46745f',
          600: '#345c4a',
          700: '#2a4a3c',
          800: '#234638', // Deep Forest Green
          900: '#1d352c',
          950: '#0f1f19',
        },
        sage: {
          50: '#f6f8f5',
          100: '#ebf0e9',
          200: '#d7e1d3',
          300: '#becfb7',
          400: '#a8b8a0', // Muted Sage
          500: '#8ca183',
          600: '#6f8367',
          700: '#586852',
          800: '#475442',
          900: '#3c4638',
        },
        sand: {
          50: '#faf7f3',
          100: '#f4ede4',
          200: '#e7d8c5', // Warm Sand
          300: '#dac3a6',
          400: '#cbac84',
          500: '#bf9868',
          600: '#b18456',
          700: '#946c46',
          800: '#79583c',
          900: '#634934',
        },
        warmbg: '#F8F7F2', // Warm Off-White
        charcoal: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#434343',
          900: '#252525', // Charcoal
          950: '#161616',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
