import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dotenv from "dotenv";
dotenv.config();
export default defineConfig({
    optimizeDeps: {
        include: ["colorthief"]
    },
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    define: {
        global: "window",
        "process.env": process.env,
    },
    build:{
        sourcemap: true
    }
});
