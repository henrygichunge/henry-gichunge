import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";
import health from "./routes/health";
import projects from "./routes/projects";
import articles from "./routes/articles";
import content from "./routes/content";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use("/api/*", secureHeaders());

app.route("/api/health", health);
app.route("/api/projects", projects);
app.route("/api/articles", articles);
app.route("/api", content);

function errorResponse(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
  });
}

app.notFound(() => errorResponse(404, "not_found", "API route not found."));

app.onError((err) => {
  if (err instanceof HTTPException) {
    return errorResponse(err.status, "http_error", err.message);
  }
  // Details stay in server logs. Visitors only see a generic message.
  console.error("Unhandled API error:", err);
  return errorResponse(500, "internal_error", "Something went wrong.");
});

export default app;