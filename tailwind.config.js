/** @type {import('tailwindcss').Config} */
export default {
  content: ['./*.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: { DEFAULT: '#0750B5', bright: '#287BFF', deep: '#053A85' },
        night: '#06152E',
        ink: '#070A12',
        ice: '#F5F7FF',
        silver: '#C5D0E0',
        mist: '#EEF2FA',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        satoshi: ['Satoshi', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      screens: { xs: '420px' },
      letterSpacing: { tightest: '-0.055em' },
    },
  },
  plugins: [],
};
