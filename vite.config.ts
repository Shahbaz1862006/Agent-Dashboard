import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "./",
  plugins: [vue()],
  server: {
    host: true,
    port: Number(process.env.PORT) || 5000,
    strictPort: true,
    allowedHosts: true,
    hmr: process.env.HMR_CLIENT_PORT
      ? { clientPort: Number(process.env.HMR_CLIENT_PORT) }
      : true,
    proxy: {
      "/api": {
        target: process.env.VITE_MOCK_API_TARGET || "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
