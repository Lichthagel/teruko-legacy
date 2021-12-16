import {defineConfig} from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
    //root: "src",
    plugins: [preact()],
    server: {
        host: true
    },
    resolve: {
        alias: {
            react: "preact/compat",
            "react-dom": "preact/compat"
        }
    }
})