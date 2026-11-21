import { Hono } from "hono";
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

export default health;