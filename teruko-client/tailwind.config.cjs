module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    fontFamily: {
      sans: ["Readex Pro", "Noto Sans JP", "sans-serif"]
    },
    extend: {
      backgroundImage: {
        'conic-gradient-45': "conic-gradient(from 45deg, var(--tw-gradient-stops))"
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-animatecss")({
      classes: ["animate__animated", "animate__fadeInUp"]
    })
  ],
}
