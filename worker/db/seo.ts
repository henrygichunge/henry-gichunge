import type { D1Database } from "../types";

export const SEO_PAGES = ["home", "about", "education", "projects", "insights", "cv", "contact"] as const;
export type SeoPageKey = (typeof SEO_PAGES)[number];

export interface PageSeo {
  title: string;
  description: string;
}

export interface SeoSettings {
  pages: Record<SeoPageKey, PageSeo>;
  shareImageUrl: string;
}

export function emptyPages(): Record<SeoPageKey, PageSeo> {
  return {
    home: { title: "", description: "" },
    about: { title: "", description: "" },
    education: { title: "", description: "" },
    projects: { title: "", description: "" },
    insights: { title: "", description: "" },
    cv: { title: "", description: "" },
    contact: { title: "", description: "" },
  };
}

function isPageKey(value: string): value is SeoPageKey {
  return (SEO_PAGES as readonly string[]).includes(value);
}

export async function getSeoSettings(db: D1Database): Promise<SeoSettings> {
  const [rows, setting] = await Promise.all([
    db
      .prepare("SELECT page_key, title, description FROM page_seo")
      .all<{ page_key: string; title: string; description: string }>(),
    db.prepare("SELECT value FROM site_settings WHERE key = 'og_image_url'").first<{ value: string }>(),
  ]);

  const pages = emptyPages();
  for (const row of rows.results) {
    if (isPageKey(row.page_key)) {
      pages[row.page_key] = { title: row.title, description: row.description };
    }
  }
  return { pages, shareImageUrl: setting?.value ?? "" };
}

/** Saves every page's SEO text and the default share image in one all-or-nothing step. */
export async function saveSeoSettings(db: D1Database, input: SeoSettings): Promise<void> {
  const now = new Date().toISOString();

  const statements = SEO_PAGES.map((key) =>
    db
      .prepare(
        "INSERT INTO page_seo (page_key, title, description, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(page_key) DO UPDATE SET title = excluded.title, description = excluded.description, updated_at = excluded.updated_at",
      )
      .bind(key, input.pages[key].title, input.pages[key].description, now),
  );

  statements.push(
    db
      .prepare(
        "INSERT INTO site_settings (key, value, updated_at) VALUES ('og_image_url', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      )
      .bind(input.shareImageUrl, now),
  );

  await db.batch(statements);
}