/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#0F0F11",
        gold: "#FFD700",
        indigo: "#4B0082",
      },
    },
  },
  plugins: [],
}
