/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E6F8FF',
          100: '#B3EDFF',
          400: '#38BDF8',
          500: '#00F2FE',
          600: '#00C6FF',
          700: '#0284C7',
          900: '#0C4A6E',
        },
        dark: {
          950: '#07090E',
          900: '#0B0F17',
          850: '#0E1422',
          800: '#141C2E',
          750: '#1B253B',
          700: '#23304A',
        },
        electric: {
          blue: '#3B82F6',
          indigo: '#6366F1',
          violet: '#8B5CF6',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 242, 254, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.3)',
        'glow-subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at top center, rgba(0, 242, 254, 0.08) 0%, rgba(11, 15, 23, 0) 70%)',
        'hero-glow': 'radial-gradient(600px circle at 50% 200px, rgba(0, 242, 254, 0.12), transparent 80%)',
      }
    },
  },
  plugins: [],
}
