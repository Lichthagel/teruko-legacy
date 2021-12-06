import { defineConfig } from "windicss/helpers";

export default defineConfig({
    
    darkMode: "media", // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                darkpurple: "#151419"
            },
            spacing: {
                "90vh": "90vh"
            }
        },
    },
    plugins: [],
})
