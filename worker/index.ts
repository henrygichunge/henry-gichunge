import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";
import health from "./routes/health";
import projects from "./routes/projects";
import articles from "./routes/articles";
import cv from "./routes/cv";
import contact from "./routes/contact";
import admin from "./routes/admin";
import content from "./routes/content";
import { servePage } from "./seo/page";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use("/api/*", secureHeaders());

app.route("/api/health", health);
app.route("/api/projects", projects);
app.route("/api/articles", articles);
app.route("/api/cv", cv);
app.route("/api/contact", contact);
app.route("/api/admin", admin);
app.route("/api", content);

function errorResponse(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
  });
}

// Anything under /api that no route above handled is a JSON 404, never a web page.
app.all("/api/*", () => errorResponse(404, "not_found", "API route not found."));

// Every other address is a page of the website.
app.get("*", (c) => servePage(c));

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