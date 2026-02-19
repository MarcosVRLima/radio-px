/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-orange': 'rgb(255, 140, 0)',
        'theme-bg': '#0a0a0ae6',
        'theme-darker': '#050505'
      }
    },
  },
  plugins: [],
}