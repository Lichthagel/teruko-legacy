module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    fontFamily: {
      sans: ["Readex Pro Variable", "Noto Sans JP Variable", "sans-serif"]
    },
    extend: {
      backgroundImage: {
        'conic-gradient-45': "conic-gradient(from 45deg, var(--tw-gradient-stops))"
      },
      screens: {
        '3xl': '2120px'
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
