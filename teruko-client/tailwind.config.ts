import type { Config } from "tailwindcss";

import forms from "@tailwindcss/forms";
import animatecss from "tailwindcss-animatecss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Readex Pro Variable", "Noto Sans JP Variable", "sans-serif"],
    },
    extend: {
      backgroundImage: {
        "conic-gradient-45": "conic-gradient(from 45deg, var(--tw-gradient-stops))",
      },
      screens: {
        "3xl": "2120px",
      },
    },
    animatedSettings: {
      classes: ["animated", "fadeInUp"],
    },
  },
  plugins: [forms, animatecss],
} satisfies Config;
