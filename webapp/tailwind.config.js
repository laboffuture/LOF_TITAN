/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a', // Deep Slate Blue
        surface: '#1e293b',    // Dark surface panels
        primary: {
          start: '#6366f1',    // Violet
          end: '#8b5cf6',      // Indigo
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
      }
    },
  },
  plugins: [],
}
