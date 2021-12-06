import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import graphql from "@rollup/plugin-graphql";
import WindiCSS from "vite-plugin-windicss";

export default defineConfig({
    //root: "src",
    plugins: [react(), graphql(), WindiCSS()]
})