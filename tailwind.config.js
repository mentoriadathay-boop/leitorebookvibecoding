/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'green-dark': '#0F4A28',
        'green-brand': '#1B6B3A',
        'green-light': '#E8F5EE',
        'red-brand': '#B91C1C',
        'red-light': '#FEF2F2',
        'gold': '#C9A84C',
        'gold-light': '#FDF6E3',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
