/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#0071e3',
          gray: '#86868b',
          dark: '#1d1d1f',
          light: '#f5f5f7',
          card: '#ffffff',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'apple': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'apple-lg': '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'apple-xl': '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};