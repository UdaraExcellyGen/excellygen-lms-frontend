/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary color system
        primary: {
          DEFAULT: '#52007C',
          light: '#7A00B8',
        },
        secondary: {
          DEFAULT: '#BF4BF6',
          light: '#D68BF9',
          lighter: '#F6E6FF',
        },
        background: {
          DEFAULT: '#F6E6FF',
          dark: '#1B0A3F',
        },

        'brand-indigo': '#52007C',
        'brand-indigo-light': '#EBE5F9', // Light tint for the background

        'brand-persian-indigo': '#34137C',
        'brand-persian-indigo-light': '#EAE7F5',

        'brand-federal-blue': '#03045e',
        'brand-federal-blue-light': '#E6E6F2',

        'brand-medium-blue': '#0609C6',
        'brand-medium-blue-light': '#E6E7FA',

        'brand-phlox': '#BF4BF6',
        'brand-phlox-light': '#F8EAFE',
        
        // Extended color palette
        'russian-violet': '#1B0A3F',
        'indigo': '#52007C',
        'phlox': '#BF4BF6',
        'french-violet': '#7A00B8',
        'persian-indigo': '#34137C',
        'heliotrope': '#D68BF9',
        'pale-purple': '#F6E6FF',
        
        // Secondary Colors
        'federal-blue': '#03045e',
        'gunmetal': '#292f36',
        'paynes-gray': '#586574',
        'deep-sky-blue': '#00BFFF',
        'pale-azure': '#70DBFF',
        
        // Status colors
        status: {
          success: '#10B981',  // Success green
          error: '#EF4444',    // Error red
          warning: '#D97706',  // Warning yellow
        },
      },
      fontFamily: {
        // Primary fonts
        'sans': ['Nunito Sans', 'system-ui', 'sans-serif'],
        'display': ['Unbounded', 'sans-serif'],
        
        // Additional fonts
        'unbounded': ['Unbounded', 'sans-serif'],
        'nunito': ['Nunito Sans', 'sans-serif'],
        'oswald': ['Oswald', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        modalEnter: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)'
          },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        'shimmer': 'shimmer 8s linear infinite',
        'modalEnter': 'modalEnter 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      borderWidth: {
        '3': '3px',
        '5': '5px',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      height: {
        '128': '32rem',
        'screen-75': '75vh',
        'screen-85': '85vh',
      },
      minHeight: {
        '40': '10rem',
        '80': '20rem',
      },
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '65': '0.65',
        '85': '0.85',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(90deg, #52007C, #BF4BF6)',
        'gradient-secondary': 'linear-gradient(90deg, #F6E6FF, #D68BF9)',
      },
      ringWidth: {
        '3': '3px',
        '5': '5px',
      },
      ringColor: {
        'primary': '#52007C',
        'secondary': '#BF4BF6',
      },
      textDecorationThickness: {
        '3': '3px',
        '5': '5px',
      },
    },
  },
  plugins: [],
  variants: {
    extend: {
      backgroundColor: ['active', 'disabled'],
      textColor: ['active', 'disabled'],
      opacity: ['disabled'],
      cursor: ['disabled'],
    }
  }
}