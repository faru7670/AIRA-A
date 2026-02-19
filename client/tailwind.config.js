/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        panel: '#0f172abf'
      },
      boxShadow: {
        glass: '0 8px 32px rgba(31, 38, 135, 0.37)'
      }
    }
  },
  plugins: []
};
