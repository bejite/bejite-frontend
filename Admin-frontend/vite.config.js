import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-react",
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)([\\/]|$)/,
            },
            {
              name: "vendor-redux",
              test: /node_modules[\\/](@reduxjs|react-redux|redux)([\\/]|$)/,
            },
            {
              name: "vendor-recharts",
              test: /node_modules[\\/](recharts|victory-vendor|d3-|internmap|delaunator|robust-predicates)([\\/]|$)/,
            },
            {
              name: "vendor-motion",
              test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)([\\/]|$)/,
            },
            {
              name: "vendor-geo",
              test: /node_modules[\\/](country-state-city|libphonenumber-js)([\\/]|$)/,
            },
            {
              name: "vendor-emoji",
              test: /node_modules[\\/]emoji-picker-react([\\/]|$)/,
            },
            {
              name: "vendor-ui",
              test: /node_modules[\\/](lucide-react|react-toastify|react-hot-toast|react-icons|@react-oauth)([\\/]|$)/,
            },
          ],
        },
      },
    },
  },
});
