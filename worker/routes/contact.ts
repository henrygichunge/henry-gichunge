import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getDb } from "../db/client";
import {
  countRecentFromClient,
  countRecentTotal,
  insertEnquiry,
  isRecentDuplicate,
} from "../db/enquiries";
import { sameOriginOnly } from "../auth/guards";
import { sha256Hex } from "../lib/crypto";
import { verifyTurnstile } from "../lib/turnstile";
import { badRequest, cleanText, readJsonBody } from "../lib/validate";
import type { AppEnv, Bindings } from "../types";

/** Public routes. Visitors can reach them, so every defence is enforced here on the server. */
const contact = new Hono<AppEnv>();

const EMAIL_PATTERN = /^[A-Za-z0-9._+-]{1,64}@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
const SITE_KEY_PATTERN = /^[A-Za-z0-9_-]{10,100}$/;
const PER_CLIENT_PER_HOUR = 3;
const TOTAL_PER_HOUR = 40;

contact.use("*", sameOriginOnly);

/** Turnstile is used only when both its keys are present and well formed. */
function turnstileKeys(env: Bindings | undefined): { siteKey: string; secret: string } | null {
  const siteKey = (env?.TURNSTILE_SITE_KEY ?? "").trim();
  const secret = (env?.TURNSTILE_SECRET_KEY ?? "").trim();
  if (!SITE_KEY_PATTERN.test(siteKey) || secret.length < 10) return null;
  return { siteKey, secret };
}

contact.get("/config", (c) => {
  const keys = turnstileKeys(c.env);
  c.header("Cache-Control", "public, max-age=60");
  return c.json({
    available: Boolean(c.env?.DB),
    turnstileSiteKey: keys ? keys.siteKey : null,
  });
});

contact.post("/", async (c) => {
  c.header("Cache-Control", "no-store");
  const db = getDb(c);
  const body = await readJsonBody(c.req.raw, 10_000);

  // Honeypot: real visitors never see this field. Pretend success so bots learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return c.json({ ok: true }, 201);
  }

  const name = cleanText(body.name, { label: "Name", max: 100, required: true });
  const email = cleanText(body.email, { label: "Email", max: 254, required: true });
  if (!EMAIL_PATTERN.test(email)) throw badRequest("Please enter a valid email address.");
  const message = cleanText(body.message, {
    label: "Message",
    max: 3000,
    required: true,
    multiline: true,
  });
  if (message.length < 10) {
    throw badRequest("Please write a little more: the message needs at least 10 characters.");
  }

  const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
  const clientHash = await sha256Hex(`contact:${ip}`);

  const [fromClient, total] = await Promise.all([
    countRecentFromClient(db, clientHash),
    countRecentTotal(db),
  ]);
  if (fromClient >= PER_CLIENT_PER_HOUR || total >= TOTAL_PER_HOUR) {
    return c.json(
      {
        error: {
          code: "rate_limited",
          message: "Too many messages have been sent recently. Please try again in an hour.",
        },
      },
      429,
      { "Retry-After": "3600" },
    );
  }

  const keys = turnstileKeys(c.env);
  if (keys) {
    const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    const passed =
      token.length > 0 &&
      token.length <= 2048 &&
      (await verifyTurnstile(
        keys.secret,
        token,
        ip === "unknown" ? undefined : ip,
        new URL(c.req.url).hostname,
      ));
    if (!passed) throw badRequest("The spam check did not pass. Please try again.");
  }

  // The same message from the same connection within a day is quietly ignored.
  if (await isRecentDuplicate(db, clientHash, message)) {
    return c.json({ ok: true }, 201);
  }

  await insertEnquiry(db, { name, email, message, clientHash });
  return c.json({ ok: true }, 201);
});

// Any other method or path under /api/contact is not allowed.
contact.all("*", () => {
  throw new HTTPException(404, { message: "API route not found." });
});

export default contact;