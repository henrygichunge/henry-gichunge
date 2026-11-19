import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { sha256Hex } from "../lib/crypto";
import type { AppEnv } from "../types";

/** Mounted below the admin guard (see routes/admin.ts): every route here requires a signed-in admin. */
const adminMedia = new Hono<AppEnv>();

const FOLDER = "henrygichunge";
const ALLOWED_FORMATS = "jpg,png,webp";
const CLOUD_NAME_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const API_KEY_PATTERN = /^[0-9]{6,30}$/;

/**
 * Signs one image upload. The API secret never leaves the server: the browser only receives
 * the signature, which covers the fixed folder, the allowed formats and a timestamp.
 */
adminMedia.post("/media/sign", async (c) => {
  const cloudName = (c.env?.CLOUDINARY_CLOUD_NAME ?? "").trim();
  const apiKey = (c.env?.CLOUDINARY_API_KEY ?? "").trim();
  const apiSecret = (c.env?.CLOUDINARY_API_SECRET ?? "").trim();

  if (!CLOUD_NAME_PATTERN.test(cloudName) || !API_KEY_PATTERN.test(apiKey) || apiSecret.length < 10) {
    throw new HTTPException(503, { message: "Media uploads are not configured." });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  // Fields are listed alphabetically, as Cloudinary requires, with the secret appended.
  const toSign = `allowed_formats=${ALLOWED_FORMATS}&folder=${FOLDER}&timestamp=${timestamp}`;
  const signature = await sha256Hex(toSign + apiSecret);

  return c.json({
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder: FOLDER,
    allowedFormats: ALLOWED_FORMATS,
  });
});

export default adminMedia;