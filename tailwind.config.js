/** @type {import('tailwindcss').Config} */
module.exports = {
  // content: ["./public/**/*.html", "./views/**/*.html"],
  content: ["./public/**/*.ejs", "./views/**/*.ejs"], // all .ejs files
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};

