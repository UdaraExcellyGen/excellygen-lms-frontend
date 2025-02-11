/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'russian-violet': '#1B0A3F',
        'indigo': '#52007C',
        'phlox': '#BF4BF6',
        'french-violet': '#7A00B8',
        'heliotrope': '#D68BF9',
        'pale-purple': '#F6E6FF',
        
        // Secondary Colors
        'federal-blue': '#03045e',
        'gunmetal': '#292f36',
        'paynes-gray': '#586574',
        'deep-sky-blue': '#00BFFF',
        'pale-azure': '#70DBFF',
      },
      fontFamily: {
        'unbounded': ['Unbounded', 'sans-serif'],
        'nunito': ['Nunito Sans', 'sans-serif'],
        'oswald': ['Oswald', 'sans-serif'],  
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      },
      animation: {
        'shimmer': 'shimmer 8s linear infinite'
      }
    },
  },
  plugins: [],
};