export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        warm: {
          50: "#fef7f0",
          100: "#fdedd5",
          200: "#fad9a8",
          300: "#f6be74",
          400: "#f19a3e",
          500: "#e87d1e",
          600: "#ca6016",
          700: "#a74915",
          800: "#873b18",
          900: "#6e3218",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
}
