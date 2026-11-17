import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { getRequestListener } from "@hono/node-server";
import app from "./worker/index";

/**
 * Local development only: serves the Hono API at /api/* inside `npm run dev`.
 * In production, Cloudflare runs the same Worker code (see wrangler.jsonc).
 */
function honoDevApi(): Plugin {
  const listener = getRequestListener(app.fetch);
  return {
    name: "hono-dev-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && /^\/api(\/|\?|$)/.test(req.url)) {
          void listener(req, res);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), honoDevApi()],
});