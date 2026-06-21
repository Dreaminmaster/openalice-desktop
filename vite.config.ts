import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Tauri requires a specific port for the dev server
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    target: "modern",
  },
});
