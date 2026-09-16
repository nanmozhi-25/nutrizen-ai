/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zen: {
          cream: '#FAF9F5',
          charcoal: '#090D0A',
          cardDark: '#121814',
          cardLight: '#FFFFFF',
          borderDark: '#1F2922',
          borderLight: '#E5E7EB',
          emerald: '#059669',
          emeraldDark: '#064E3B',
          teal: '#0D9488',
          tealDark: '#0F766E',
          blue: '#2563EB',
          indigo: '#4F46E5',
          violet: '#7C3AED',
          violetDark: '#4C1D95'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
