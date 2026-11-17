import type { D1Database } from "../types";
import type { SiteResponse, SocialLinkItem } from "../../shared/api";
import { safeUrl } from "../lib/url";

interface ProfileRow {
  display_name: string;
  full_name: string;
  tagline: string;
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

/** Splits text into paragraphs at blank lines. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/** Returns null when the profile row has not been created yet. */
export async function getSiteData(db: D1Database): Promise<SiteResponse | null> {
  const [profileRow, settingsResult, socialsResult] = await Promise.all([
    db
      .prepare(
        "SELECT display_name, full_name, tagline, intro, biography, mission, portrait_url FROM site_profile WHERE id = 1",
      )
      .first<ProfileRow>(),
    db
      .prepare(
        "SELECT key, value FROM site_settings WHERE key IN ('contact_email', 'contact_phone', 'contact_location')",
      )
      .all<SettingRow>(),
    db
      .prepare("SELECT label, url FROM social_links WHERE state = 'published' ORDER BY sort_order, id")
      .all<SocialRow>(),
  ]);

  if (!profileRow) return null;

  const settings = new Map<string, string>(
    settingsResult.results.map((row): [string, string] => [row.key, row.value]),
  );

  const socials: SocialLinkItem[] = [];
  for (const row of socialsResult.results) {
    const url = safeUrl(row.url, false);
    if (url) socials.push({ label: row.label, url });
  }

  return {
    profile: {
      displayName: profileRow.display_name,
      fullName: profileRow.full_name,
      tagline: profileRow.tagline,
      intro: profileRow.intro,
      biography: paragraphs(profileRow.biography),
      mission: profileRow.mission,
      portraitUrl: safeUrl(profileRow.portrait_url, true),
    },
    contact: {
      email: settings.get("contact_email") ?? "",
      phone: settings.get("contact_phone") ?? "",
      location: settings.get("contact_location") ?? "",
    },
    socials,
  };
}