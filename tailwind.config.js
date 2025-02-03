/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          light: {
            text: "#000000",
            background: "#FFFFFF",
            tint: "#000000",
          },
          dark: {
            text: "#FFFFFF",
            background: "#000000",
            tint: "#FFFFFF",
          },
        },
      },
    },
    plugins: [],
  };