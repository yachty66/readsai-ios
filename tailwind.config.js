/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // You can use your existing colors from Colors.ts
        light: {
          text: "#11181C",
          background: "#fff",
          tint: "#0a7ea4",
        },
        dark: {
          text: "#ECEDEE",
          background: "#151718",
          tint: "#fff",
        },
      },
    },
  },
  plugins: [],
};