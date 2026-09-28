import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  clearScreen: false,
  server: {
    host: process.env.TAURI_DEV_HOST || "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    watch: {
      ignored: ["**/src-tauri/**", "**/UnityProject/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
