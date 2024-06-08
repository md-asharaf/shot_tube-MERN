import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    // server: {
    //     proxy: {
    //         "/api/v1": `http://localhost:${process.env.PORT}`,
    //     },
    // },
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
