import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

export default defineConfig({
  // root: "src",
  plugins: [preact()],
  server: {
    host: true,
  },
  resolve: {
    alias: {
      "react": "preact/compat",
      "react-dom": "preact/compat",
    },
  },
});
