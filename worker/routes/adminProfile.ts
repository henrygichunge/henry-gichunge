import { Hono } from "hono";
import { getDb } from "../db/client";
import {
  getAdminProfile,
  saveContact,
  saveProfile,
  saveSocials,
  type ContactInput,
  type ProfileInput,
  type SocialInput,
} from "../db/adminProfile";
import {
  badRequest,
  cleanText,
  optionalWebAddress,
  readJsonBody,
  requiredWebAddress,
} from "../lib/validate";
import type { AppEnv } from "../types";

/** Mounted below the admin guard in routes/admin.ts: every route here requires a signed-in admin. */
const adminProfile = new Hono<AppEnv>();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-.\s]+$/;
const MAX_SOCIALS = 10;

adminProfile.get("/profile", async (c) => {
  return c.json(await getAdminProfile(getDb(c)));
});

adminProfile.put("/profile", async (c) => {
  const body = await readJsonBody(c.req.raw);

  const input: ProfileInput = {
    fullName: cleanText(body.fullName, { label: "Full name", max: 120, required: true }),
    intro: cleanText(body.intro, { label: "Introduction", max: 600, required: true, multiline: true }),
    biography: cleanText(body.biography, { label: "Biography", max: 8000, multiline: true }),
    mission: cleanText(body.mission, { label: "Mission", max: 500, multiline: true }),
    portraitUrl: optionalWebAddress(body.portraitUrl, "Portrait address", true),
  };

  await saveProfile(getDb(c), input);
  return c.json({ saved: true });
});

adminProfile.put("/contact", async (c) => {
  const body = await readJsonBody(c.req.raw);

  const email = cleanText(body.email, { label: "Email", max: 254 });
  if (email !== "" && !EMAIL_PATTERN.test(email)) {
    throw badRequest("Email must be a valid email address.");
  }

  const phone = cleanText(body.phone, { label: "Phone", max: 40 });
  if (phone !== "" && !PHONE_PATTERN.test(phone)) {
    throw badRequest("Phone may contain only digits, spaces and + ( ) - . characters.");
  }

  const input: ContactInput = {
    email,
    phone,
    location: cleanText(body.location, { label: "Location", max: 120 }),
  };

  await saveContact(getDb(c), input);
  return c.json({ saved: true });
});

adminProfile.put("/socials", async (c) => {
  const body = await readJsonBody(c.req.raw);

  if (!Array.isArray(body.socials)) throw badRequest("Invalid request.");
  if (body.socials.length > MAX_SOCIALS) {
    throw badRequest(`You can add at most ${MAX_SOCIALS} social links.`);
  }

  const socials: SocialInput[] = (body.socials as unknown[]).map((item, index) => {
    if (typeof item !== "object" || item === null) throw badRequest("Invalid social link.");
    const entry = item as Record<string, unknown>;
    const number = index + 1;
    return {
      label: cleanText(entry.label, { label: `Link ${number} label`, max: 40, required: true }),
      url: requiredWebAddress(entry.url, `Link ${number} address`),
    };
  });

  await saveSocials(getDb(c), socials);
  return c.json({ saved: true });
});

export default adminProfile;