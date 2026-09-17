import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Amplify serves these straight from S3+CloudFront; keep the bundle honest.
    target: "es2020",
    sourcemap: false,
    rollupOptions: {
      // Two real pages rather than a client-side router: the landing page does
      // not ship the app bundle, and /check needs no SPA rewrite rule to work.
      input: {
        landing: resolve(import.meta.dirname, "index.html"),
        check: resolve(import.meta.dirname, "check/index.html"),
      },
    },
  },
});
