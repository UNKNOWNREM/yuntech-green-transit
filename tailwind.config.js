/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        secondary: '#2196F3',
        danger: '#FF5722',
        warning: '#FFC107',
        info: '#03A9F4',
        success: '#8BC34A',
      },
    },
  },
  plugins: [],
}
