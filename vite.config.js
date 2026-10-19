import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function manualChunkForPackage(id) {
  if (!id.includes("node_modules")) return undefined;

  // Only split heavy, route-level libraries. Do NOT manually chunk React or
  // react-dependent packages — that creates circular chunk imports and breaks
  // production (e.g. @react-oauth/google: "Cannot read createContext").
  if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
  if (id.includes("xlsx")) return "vendor-xlsx";
  if (
    id.includes("country-state-city/lib/assets/state") ||
    id.includes("country-state-city/lib/state")
  ) {
    return "vendor-geo-state";
  }
  if (id.includes("country-state-city")) return "vendor-geo-country";
  if (id.includes("nigeria-state-lga-data")) return "vendor-geo-nigeria";

  return undefined;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");
  const apiTarget = (env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN;

  return {
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    plugins: [
      react(),
      tailwindcss(),
      ...(sentryAuthToken
        ? [
            sentryVitePlugin({
              org: env.SENTRY_ORG || "bejite",
              project: env.SENTRY_PROJECT || "bejite-frontend",
              url: env.SENTRY_URL || "https://app.glitchtip.com/",
              authToken: sentryAuthToken,
            }),
          ]
        : []),
    ],
    build: {
      sourcemap: !!sentryAuthToken,
      rollupOptions: {
        output: {
          manualChunks(id) {
            return manualChunkForPackage(id);
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
    server: {
      proxy: {
        "/p/": {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/p\//, "/share/post/"),
        },
        "/j/": {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/j\//, "/share/job/"),
        },
        "/a/": {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/a\//, "/share/ad/"),
        },
      },
    },
  };
});
