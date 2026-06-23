/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        health: {
          green: '#10B981',
          'green-light': '#D1FAE5',
          'green-dark': '#065F46',
          amber: '#F59E0B',
          'amber-light': '#FEF3C7',
          'amber-dark': '#92400E',
          red: '#EF4444',
          'red-light': '#FEE2E2',
          'red-dark': '#991B1B',
          cyan: '#0891B2',
          'cyan-light': '#ECFEFF',
          blue: '#3B82F6',
          purple: '#8B5CF6',
        }
      }
    },
  },
  plugins: [],
}