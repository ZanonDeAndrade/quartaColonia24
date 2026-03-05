const preset = require("@repo/theme/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../packages/ui/**/*.{css,ts,tsx,js,jsx}",
    "../packages/theme/**/*.{css,ts,tsx,js,jsx}",
    "../packages/api/**/*.{ts,tsx,js,jsx}",
  ],
};
