import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(process.cwd(), "frontend"),
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": `http://127.0.0.1:${process.env.HRM_API_PORT || 3002}`,
    },
  },
  build: {
    outDir: resolve(process.cwd(), "dist"),
    emptyOutDir: true,
  },
});
