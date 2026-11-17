import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../types";

const health = new Hono<AppEnv>();

health.get("/", (c) => {
  c.header("Cache-Control", "no-store");
  return c.json({
    status: "ok",
    service: "henrygichunge-api",
    environment: c.env?.ENVIRONMENT ?? "local",
    time: new Date().toISOString(),
  });
});

health.get("/db", async (c) => {
  const db = c.env?.DB;
  if (!db) {
    throw new HTTPException(503, {
      message: "Database is not available in this environment.",
    });
  }

  const row = await db
    .prepare("SELECT COUNT(*) AS count FROM projects WHERE state = 'published'")
    .first<{ count: number }>();

  c.header("Cache-Control", "no-store");
  return c.json({
    status: "ok",
    database: "connected",
    publishedProjects: row?.count ?? 0,
  });
});

export default health;