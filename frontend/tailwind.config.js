export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Google Sans', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Google Blue
        gblue: {
          50:  '#e8f0fe',
          100: '#d2e3fc',
          200: '#aecbfa',
          400: '#669df6',
          500: '#4285f4',
          600: '#1A73E8',
          700: '#1557b0',
          800: '#0d47a1',
        },
        // Google Green
        ggreen: {
          50:  '#e6f4ea',
          100: '#ceead6',
          500: '#34a853',
          600: '#1E8E3E',
          700: '#137333',
        },
        // Google Red
        gred: {
          500: '#ea4335',
          600: '#d93025',
        },
        // Google Yellow
        gyellow: {
          500: '#fbbc04',
          600: '#f29900',
        },
        // Surface colors
        surface: '#f1f3f4',
        'surface-dark': '#202124',
      },
      boxShadow: {
        'gc': '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        'gc-md': '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
        'gc-lg': '0 2px 6px 2px rgba(60,64,67,0.15), 0 1px 2px 0 rgba(60,64,67,0.3)',
      },
    },
  },
  plugins: [],
}