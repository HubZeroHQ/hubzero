// tailwind.config.js
import typography from '@tailwindcss/typography';
import lineClamp from '@tailwindcss/line-clamp';
import scrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // add this if you use /src
  ],
  theme: {
    extend: {},
  },
  plugins: [
    typography,
    lineClamp,
    scrollbar,
  ],
};
