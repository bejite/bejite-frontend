/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'nunito-regular': ['NunitoRegular', 'sans-serif'],
        'nunito-semi': ['NunitoSemi', 'sans-serif'],
        'nunito-bold': ['NunitoBold', 'sans-serif'],
      }
    },
  },
  plugins: []
};
