/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta "Vibe Coding Mágico"
        magic: '#5B2A6E',        // Roxo Magia — primária
        'magic-dark': '#3E1B4D', // Roxo Noite — hover/pressed da primária
        'magic-light': '#B47FC2',// derivado claro p/ texto/ícone em fundo escuro
        blossom: '#C2298A',      // Rosa Feitiço — secundária
        'blossom-light': '#E0459E', // Rosa Encanto
        stargold: {
          50: '#FFFAF0', 100: '#FFF3D6', 200: '#FFE7AD', 300: '#FFDB84',
          400: '#FFD966', 500: '#F5B942', 600: '#E0A020', 700: '#B87F0F',
          800: '#8F6309', 900: '#6B4A06',
        },
        cream: '#FFF6E0',        // Creme Dourado
        lilac: '#F7EEFB',        // Lilás Alva — fundo alternativo
        'lilac-baby': '#F2E4FA', // Lilás Bebê — cards de destaque
        'pink-baby': '#FCE4F1',  // Rosa Bebê — cards de categoria
        lavender: '#EDE7F6',     // Lavanda Suave — listas/painéis
        ink: '#2E1338',          // Roxo Quase-Preto — texto principal
        'ink-muted': '#7A6584',  // Roxo Acinzentado — texto secundário
        success: {
          50: '#EEF8F1', 100: '#DCF1E1', 200: '#BEE4C9', 300: '#9FD7B0',
          400: '#7FBF8F', 500: '#5FA372', 600: '#4A8560', 700: '#386B4C',
          800: '#2C5A3F', 900: '#1F4530',
        },
        coral: {
          50: '#FDF2EE', 100: '#FBE3DA', 200: '#F7CBB8', 300: '#F5B99E',
          400: '#F2A488', 500: '#E8845F', 600: '#D9663F', 700: '#B84F2E',
          800: '#8F3C23', 900: '#6B2C19',
        },
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
