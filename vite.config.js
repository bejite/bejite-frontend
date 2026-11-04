import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import shareHandler from "./api/share.js";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function sharePreviewDevPlugin(apiTarget) {
  const crawlerUaRe =
    /whatsapp|facebookexternalhit|facebot|meta-externalagent|twitterbot|linkedinbot|slackbot|slack-imgproxy|telegrambot|discordbot|pinterest|skypeuripreview|vkshare|redditbot|embedly|iframely/i;

  return {
    name: "bejite-share-preview-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const parsed = new URL(req.url || "/", "http://localhost");
          const { pathname } = parsed;
          const ua = String(req.headers["user-agent"] || "");

          let type = null;
          let id = null;
          let from = "";

          const shortMatch = pathname.match(/^\/(p|j|a|v)\/([^/]+)\/?$/);
          if (shortMatch) {
            const prefix = shortMatch[1];
            id = decodeURIComponent(shortMatch[2]);
            type =
              prefix === "v"
                ? "pitch"
                : prefix === "p"
                  ? "post"
                  : prefix === "j"
                    ? "job"
                    : "ad";
          } else if (
            (pathname === "/pitch" || pathname === "/pitches") &&
            parsed.searchParams.get("id") &&
            crawlerUaRe.test(ua)
          ) {
            type = "pitch";
            id = parsed.searchParams.get("id");
            from = pathname === "/pitches" ? "pitches" : "pitch";
          } else if (pathname === "/api/share") {
            type = parsed.searchParams.get("type") || "pitch";
            id = parsed.searchParams.get("id");
            from = parsed.searchParams.get("from") || "";
          }

          if (!type || !id) {
            next();
            return;
          }

          req.query = { type, id, from };
          await shareHandler(req, res, { apiBase: apiTarget });
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

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
      sharePreviewDevPlugin(apiTarget),
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
  };
});
