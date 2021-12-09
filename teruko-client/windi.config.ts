import { defineConfig } from "windicss/helpers";
import scrollSnap from "windicss/plugin/scroll-snap";

export default defineConfig({
    darkMode: "media", // or 'media' or 'class'
    plugins: [scrollSnap],
});
