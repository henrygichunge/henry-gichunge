import type { D1Database } from "../types";

interface ProfileRow {
  full_name: string;
  intro: string;
  biography: string;
  mission: string;
  portrait_url: string | null;
}

interface SettingRow {
  key: string;
  value: string;
}

interface SocialRow {
  label: string;
  url: string;
}

export interface ProfileInput {
  fullName: string;
  intro: string;
  biography: string;
  mission: string;
  portraitUrl: string;
}

export interface ContactInput {
  email: string;
  phone: string;
  location: string;
}

export interface SocialInput {
  label: string;
  url: string;
}

export interface AdminProfileData {
  profile: ProfileInput;
  contact: ContactInput;
  socials: SocialInput[];
}

const UPSERT_SETTING =
  "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at";

const UPSERT_PROFILE =
  "INSERT INTO site_profile (id, display_name, full_name, tagline, intro, biography, mission, portrait_url, updated_at) VALUES (1, 'Henry Gichunge', ?, 'Ideas. Education. Innovation.', ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET full_name = excluded.full_name, intro = excluded.intro, biography = excluded.biography, mission = excluded.mission, portrait_url = excluded.portrait_url, updated_at = excluded.updated_at";

/** Returns raw, editable values (the biography keeps its blank-line paragraph breaks). */
export async function getAdminProfile(db: D1Database): Promise<AdminProfileData> {
  const [row, settingsResult, socialsResult] = await Promise.all([
    db
      .prepare("SELECT full_name, intro, biography, mission, portrait_url FROM site_profile WHERE id = 1")
      .first<ProfileRow>(),
    db
      .prepare(
        "SELECT key, value FROM site_settings WHERE key IN ('contact_email', 'contact_phone', 'contact_location')",
      )
      .all<SettingRow>(),
    db.prepare("SELECT label, url FROM social_links ORDER BY sort_order, id").all<SocialRow>(),
  ]);

  const settings = new Map<string, string>(
    settingsResult.results.map((r): [string, string] => [r.key, r.value]),
  );

  return {
    profile: {
      fullName: row?.full_name ?? "",
      intro: row?.intro ?? "",
      biography: row?.biography ?? "",
      mission: row?.mission ?? "",
      portraitUrl: row?.portrait_url ?? "",
    },
    contact: {
      email: settings.get("contact_email") ?? "",
      phone: settings.get("contact_phone") ?? "",
      location: settings.get("contact_location") ?? "",
    },
    socials: socialsResult.results.map((r) => ({ label: r.label, url: r.url })),
  };
}

export async function saveProfile(db: D1Database, input: ProfileInput): Promise<void> {
  await db
    .prepare(UPSERT_PROFILE)
    .bind(
      input.fullName,
      input.intro,
      input.biography,
      input.mission,
      input.portraitUrl || null,
      new Date().toISOString(),
    )
    .run();
}

export async function saveContact(db: D1Database, input: ContactInput): Promise<void> {
  const now = new Date().toISOString();
  await db.batch([
    db.prepare(UPSERT_SETTING).bind("contact_email", input.email, now),
    db.prepare(UPSERT_SETTING).bind("contact_phone", input.phone, now),
    db.prepare(UPSERT_SETTING).bind("contact_location", input.location, now),
  ]);
}

/** Replaces the whole list of social links in one all-or-nothing step. */
export async function saveSocials(db: D1Database, socials: SocialInput[]): Promise<void> {
  const statements = [db.prepare("DELETE FROM social_links")];
  socials.forEach((social, index) => {
    statements.push(
      db
        .prepare(
          "INSERT INTO social_links (label, url, sort_order, state) VALUES (?, ?, ?, 'published')",
        )
        .bind(social.label, social.url, index),
    );
  });
  await db.batch(statements);
}