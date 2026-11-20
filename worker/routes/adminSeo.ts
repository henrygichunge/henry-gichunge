import { Hono } from "hono";
import { getDb } from "../db/client";
import { SEO_PAGES, emptyPages, getSeoSettings, saveSeoSettings, type SeoPageKey } from "../db/seo";
import { badRequest, cleanText, optionalWebAddress, readJsonBody } from "../lib/validate";
import type { AppEnv } from "../types";

/** Mounted below the admin guard (see routes/admin.ts): every route here requires a signed-in admin. */
const adminSeo = new Hono<AppEnv>();

const LABELS: Record<SeoPageKey, string> = {
  home: "Home page",
  about: "About page",
  education: "Education page",
  projects: "Projects page",
  insights: "Insights page",
  cv: "CV page",
  contact: "Contact page",
};

adminSeo.get("/seo", async (c) => {
  return c.json(await getSeoSettings(getDb(c)));
});

adminSeo.put("/seo", async (c) => {
  const body = await readJsonBody(c.req.raw, 20_000);

  if (typeof body.pages !== "object" || body.pages === null || Array.isArray(body.pages)) {
    throw badRequest("Invalid request.");
  }
  const raw = body.pages as Record<string, unknown>;

  const pages = emptyPages();
  for (const key of SEO_PAGES) {
    const entry = raw[key];
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      throw badRequest("Invalid request.");
    }
    const values = entry as Record<string, unknown>;
    pages[key] = {
      title: cleanText(values.title, { label: `${LABELS[key]} title`, max: 70 }),
      description: cleanText(values.description, { label: `${LABELS[key]} description`, max: 160 }),
    };
  }

  const shareImageUrl = optionalWebAddress(body.shareImageUrl, "Share image address", true);

  await saveSeoSettings(getDb(c), { pages, shareImageUrl });
  return c.json({ saved: true });
});

export default adminSeo;