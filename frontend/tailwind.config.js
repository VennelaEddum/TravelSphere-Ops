/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#142B4A',
        secondary: '#0F9D9A',
        accent: '#EAF4FA',
        travelsphere: {
          navy: '#142B4A',
          dark: '#0C1B30',
          teal: '#0F9D9A',
          tealHover: '#0C8481',
          sky: '#EAF4FA',
          bg: '#F5F7FA',
          card: '#FFFFFF',
          textDark: '#142B4A',
          textMuted: '#64748B',
        },
        sanchari: {
          navy: '#142B4A',
          dark: '#0C1B30',
          teal: '#0F9D9A',
          tealHover: '#0C8481',
          sky: '#EAF4FA',
          bg: '#F5F7FA',
          card: '#FFFFFF',
          textDark: '#142B4A',
          textMuted: '#64748B',
        },
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#334E68',
          700: '#243B53',
          800: '#1A365D',
          900: '#142B4A', // TravelSphere Ops Primary Deep Navy
          950: '#0C1B30', // Deepest Navy
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0F9D9A', // TravelSphere Ops Secondary Teal
          700: '#0D8481',
          800: '#0A6C69',
          900: '#07514F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
