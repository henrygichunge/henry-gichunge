import type { D1Database } from "../types";

const KEY = "cv_url";

/** Returns the saved CV address, or an empty string when there is none. */
export async function getCvUrl(db: D1Database): Promise<string> {
  const row = await db
    .prepare("SELECT value FROM site_settings WHERE key = ?")
    .bind(KEY)
    .first<{ value: string }>();
  return row?.value ?? "";
}

/** Saves the CV address. An empty string removes the CV from the website. */
export async function saveCvUrl(db: D1Database, url: string): Promise<void> {
  await db
    .prepare(
      "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
    )
    .bind(KEY, url, new Date().toISOString())
    .run();
}