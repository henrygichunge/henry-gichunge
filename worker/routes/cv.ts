import { Hono } from "hono";
import { getDb } from "../db/client";
import { getCvUrl } from "../db/cv";
import { safeUrl } from "../lib/url";
import type { AppEnv } from "../types";

/** Public: tells the website where the CV file is, if there is one. */
const cv = new Hono<AppEnv>();

cv.get("/", async (c) => {
  const stored = await getCvUrl(getDb(c));
  c.header("Cache-Control", "public, max-age=60");
  return c.json({ url: safeUrl(stored || null, false) });
});

export default cv;