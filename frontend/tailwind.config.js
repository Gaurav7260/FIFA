/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stadium: {
          light: '#F8FAFC', // slate-50
          card: 'rgba(255, 255, 255, 0.85)', // light glass card
          border: 'rgba(0, 0, 0, 0.08)',
          accent: '#A8E10C', // FIFA Bright Green
          brand: '#6A0572', // FIFA Purple
          teal: '#00A896', // FIFA Teal
          gold: '#F59E0B' // Warning yellow
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
