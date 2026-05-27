import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "icon-180.png", "icon.svg"],
      manifest: {
        name: "Kelane",
        short_name: "Kelane",
        description: "Your personal recipe manager and meal planner",
        theme_color: "#150404",
        background_color: "#150404",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow",
          },
        ],
      },
      workbox: {
        // The web-llm bundle is very large — raise the limit so the build doesn't error.
        // Large JS chunks won't be precached but will be cached on first runtime access.
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MiB
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/",
        navigateFallbackDenylist: [/^\/api/, /^\/proxy/],
        runtimeCaching: [
          {
            // Cache recipe images from the web
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|webp|gif|svg)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Cache font files
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "fonts" },
          },
          {
            // OpenFoodFacts nutrition lookups — short cache
            urlPattern: /^https:\/\/world\.openfoodfacts\.org\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "nutrition",
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split the massive web-llm bundle into its own chunk
          "web-llm": ["@mlc-ai/web-llm"],
          "vendor-react": ["react", "react-dom", "react-router"],
        },
      },
    },
  },
});
