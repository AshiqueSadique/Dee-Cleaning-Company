/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#1a1a1a',
        terra: {
          DEFAULT: '#b85c3c',
          deep: '#8e4128',
        },
        paper: {
          DEFAULT: '#f6f1e7',
          deep: '#ede4d2',
        },
        gold: '#c9a35a',
        muted: '#5a5147',
        line: '#c9bea6',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Manrope', 'sans-serif'],
        thai: ['Sarabun', 'sans-serif'],
      },
      fontSize: {
        'hero': 'clamp(48px, 10vw, 120px)',
      },
    },
  },
  plugins: [],
};
