/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        lexend: ['Lexend', 'sans-serif'],
        display: ['Lexend Deca', 'Lexend', 'sans-serif'],
      },
      colors: {
        background: "#0a0a0a",
        primary: {
          DEFAULT: "#f97316", // Orange 500
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#2a2a2a",
          foreground: "#a1a1aa",
        },
        accent: {
          DEFAULT: "#8b5cf6", // Violet 500
          foreground: "#ffffff",
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
