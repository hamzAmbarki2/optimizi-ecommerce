/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6ff',
          300: '#a5b8ff',
          400: '#8292ff',
          500: '#6366f1',
          600: '#5145e6',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        soft: {
          50: '#fafbff',
          100: '#f4f6ff',
          200: '#e8ecff',
          300: '#d6dcff',
          400: '#bcc4ff',
          500: '#9ca3ff',
          600: '#7c83ff',
          700: '#6366f1',
          800: '#4f46e5',
          900: '#4338ca',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        }
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'soft-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'soft-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-lg': '0 0 30px rgba(99, 102, 241, 0.2)',
      },
      borderRadius: {
        'soft': '12px',
        'soft-lg': '16px',
        'soft-xl': '20px',
        'soft-2xl': '24px',
      },
      backdropBlur: {
        'soft': '8px',
      }
    },
  },
  plugins: [],
};