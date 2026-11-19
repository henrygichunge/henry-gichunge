import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { getDb } from "../db/client";
import { safeEqualText, verifyPassword } from "../lib/crypto";
import { SESSION_COOKIE, requireAdmin, sameOriginOnly } from "../auth/guards";
import {
  LOCKOUT_SECONDS,
  clearFailures,
  createSession,
  deleteSession,
  hashClient,
  isLockedOut,
  recordFailure,
} from "../auth/store";
import adminProfile from "./adminProfile";
import adminProjects from "./adminProjects";
import type { AppEnv } from "../types";

const admin = new Hono<AppEnv>();

admin.use("*", async (c, next) => {
  await next();
  c.header("Cache-Control", "no-store");
});
admin.use("*", sameOriginOnly);

async function readCredentials(request: Request): Promise<{ email: string; password: string }> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) {
    throw new HTTPException(415, { message: "Unsupported request." });
  }

  const text = await request.text();
  if (text.length > 2000) {
    throw new HTTPException(413, { message: "Request too large." });
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new HTTPException(400, { message: "Invalid request." });
  }
  if (typeof data !== "object" || data === null) {
    throw new HTTPException(400, { message: "Invalid request." });
  }

  const { email, password } = data as Record<string, unknown>;
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.length === 0 ||
    email.length > 320 ||
    password.length === 0 ||
    password.length > 200
  ) {
    throw new HTTPException(400, { message: "Invalid request." });
  }

  return { email: email.trim().toLowerCase(), password };
}

admin.post("/login", async (c) => {
  const configuredEmail = (c.env?.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const storedHash = c.env?.ADMIN_PASSWORD_HASH;
  if (!configuredEmail || !storedHash) {
    throw new HTTPException(503, { message: "Admin login is not configured." });
  }

  const db = getDb(c);
  const { email, password } = await readCredentials(c.req.raw);

  const clientHash = await hashClient(c.req.header("CF-Connecting-IP") ?? "unknown");
  if (await isLockedOut(db, clientHash)) {
    return c.json(
      { error: { code: "rate_limited", message: "Too many attempts. Please try again later." } },
      429,
      { "Retry-After": String(LOCKOUT_SECONDS) },
    );
  }

  // Both checks always run, so a wrong email cannot be told apart from a wrong password.
  const emailOk = await safeEqualText(email, configuredEmail);
  const passwordOk = await verifyPassword(password, storedHash);

  if (!(emailOk && passwordOk)) {
    await recordFailure(db, clientHash);
    return c.json(
      { error: { code: "invalid_credentials", message: "Incorrect email or password." } },
      401,
    );
  }

  const { token, maxAgeSeconds } = await createSession(db);
  await clearFailures(db, clientHash);

  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
    maxAge: maxAgeSeconds,
  });

  return c.json({ email: configuredEmail });
});

admin.post("/logout", async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token && token.length <= 200 && c.env?.DB) {
    await deleteSession(c.env.DB, token);
  }
  deleteCookie(c, SESSION_COOKIE, { path: "/", secure: true });
  return c.json({ ok: true });
});

// RULE: every admin route must be registered BELOW this line, so it is always protected.
admin.use("*", requireAdmin);

admin.get("/me", (c) => c.json({ email: c.get("adminEmail") }));

admin.route("/", adminProfile);
admin.route("/", adminProjects);

export default admin;