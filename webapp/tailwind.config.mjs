/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // or 'media' if you want auto system dark mode
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        // optional custom colors, fonts, blur etc.
      },
    },
    plugins: [],
  }
  