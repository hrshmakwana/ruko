import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Amplify serves these straight from S3+CloudFront; keep the bundle honest.
    target: "es2020",
    sourcemap: false,
  },
});
