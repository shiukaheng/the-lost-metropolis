module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      serif: ["Noto Serif TC", "serif"]
    },
    extend: {
      screens: {
        // Make "md" only available if the screen is in landscape
        'md': {'raw': '(min-width: 768px) and (min-width: 1024px)'},
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
