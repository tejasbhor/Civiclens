import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    // Dev: proxy to live API so prod CORS (which excludes localhost) doesn't apply
    proxy: {
      "/api": { target: "https://api.civiclens.space", changeOrigin: true },
      "/civiclens-media": { target: "https://api.civiclens.space", changeOrigin: true },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
