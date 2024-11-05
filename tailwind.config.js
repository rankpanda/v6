/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#11190c',
          white: '#F3F1EE'
        },
        secondary: {
          lime: '#e6ff00',
          dark: '#0a0f07',
          gray: '#444638',
          olive: '#787664',
          light: '#F3F1EE',
          beige: '#E5E2DC'
        }
      },
      fontFamily: {
        moonwalk: ['Moon Walk', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif']
      },
      backgroundColor: {
        base: '#F3F1EE'
      }
    },
  },
  plugins: [],
};