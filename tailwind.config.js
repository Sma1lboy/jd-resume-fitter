/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./source/**/*.{html,js,ts,jsx,tsx}', './views/**/*.html'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: 'hsl(16 85% 54%)', // Fox orange/red color for focus rings
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 47.4% 11.2%)',
        primary: {
          DEFAULT: 'hsl(16 85% 54%)', // Fox orange/red
          foreground: 'hsl(0 0% 100%)', // White text
          50: 'hsl(16 85% 95%)',
          100: 'hsl(16 85% 90%)',
          200: 'hsl(16 85% 80%)',
          300: 'hsl(16 85% 70%)',
          400: 'hsl(16 85% 60%)',
          500: 'hsl(16 85% 54%)', // Same as DEFAULT
          600: 'hsl(16 85% 45%)',
          700: 'hsl(16 85% 35%)',
          800: 'hsl(16 85% 25%)',
          900: 'hsl(16 85% 15%)',
          950: 'hsl(16 85% 10%)',
        },
        secondary: {
          DEFAULT: 'hsl(45 89% 57%)', // Golden yellow (#f4c430)
          foreground: 'hsl(0 0% 0%)', // Black text
          50: 'hsl(45 89% 95%)',
          100: 'hsl(45 89% 90%)',
          200: 'hsl(45 89% 80%)',
          300: 'hsl(45 89% 70%)',
          400: 'hsl(45 89% 65%)',
          500: 'hsl(45 89% 57%)', // Same as DEFAULT
          600: 'hsl(45 89% 50%)',
          700: 'hsl(45 89% 40%)',
          800: 'hsl(45 89% 30%)',
          900: 'hsl(45 89% 20%)',
          950: 'hsl(45 89% 10%)',
        },
        muted: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: 'hsl(215.4 16.3% 46.9%)',
        },
        codefox: {
          orange: '#f05a28', // Fox orange/red (primary)
          gold: '#f4c430', // Golden yellow (secondary)
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      fontFamily: {
        sans: [
          '"Google Sans"',
          'Nunito',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'fade-out': 'fade-out 0.2s ease-in-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-out': 'slide-out 0.2s ease-in',
        'zoom-in': 'zoom-in 0.3s ease-out',
        'zoom-out': 'zoom-out 0.2s ease-in',
        'in': 'in 0.3s ease-out',
        'out': 'out 0.2s ease-in',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(10px)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-out': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(10px)' },
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'zoom-out': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.95)' },
        },
        'in': {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'out': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(10px) scale(0.95)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
