import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { getDb } from "../db/client";
import { sessionIsValid } from "./store";
import type { AppEnv } from "../types";

export const SESSION_COOKIE = "__Host-hg_admin";

/** Refuses the request unless it carries a valid admin session. Fails closed if login is not configured. */
export async function requireAdmin(c: Context<AppEnv>, next: Next) {
  const email = (c.env?.ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (!email || !c.env?.ADMIN_PASSWORD_HASH) {
    throw new HTTPException(503, { message: "Admin access is not configured." });
  }

  const token = getCookie(c, SESSION_COOKIE);
  if (!token || token.length > 200 || !(await sessionIsValid(getDb(c), token))) {
    throw new HTTPException(401, { message: "Sign in required." });
  }

  c.set("adminEmail", email);
  await next();
}

/** Refuses any request that changes data unless it comes from this site itself. */
export async function sameOriginOnly(c: Context<AppEnv>, next: Next) {
  const method = c.req.method;
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const origin = c.req.header("Origin");
    if (!origin || origin !== new URL(c.req.url).origin) {
      throw new HTTPException(403, { message: "Request not allowed." });
    }
  }
  await next();
}