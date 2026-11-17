import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppEnv, D1Database } from "../types";

/** Returns the D1 database, or a clean 503 when it is not bound (for example on a phone). */
export function getDb(c: Context<AppEnv>): D1Database {
  const db = c.env?.DB;
  if (!db) {
    throw new HTTPException(503, {
      message: "Database is not available in this environment.",
    });
  }
  return db;
}