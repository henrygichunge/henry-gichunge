import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getDb } from "../db/client";
import { getCvUrl, saveCvUrl } from "../db/cv";
import { sha256Hex } from "../lib/crypto";
import { badRequest, cleanText, readJsonBody } from "../lib/validate";
import type { AppEnv, Bindings } from "../types";

/** Mounted below the admin guard (see routes/admin.ts): every route here requires a signed-in admin. */
const adminMedia = new Hono<AppEnv>();

const IMAGE_FOLDER = "henrygichunge";
const IMAGE_FORMATS = "jpg,png,webp";
const CV_FOLDER = "henrygichunge/documents";
const CV_FORMATS = "pdf";
const CLOUD_NAME_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const API_KEY_PATTERN = /^[0-9]{6,30}$/;

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/** Reads the Cloudinary secrets. Refuses (503) when any is missing or malformed. */
function readConfig(env: Bindings | undefined): CloudinaryConfig {
  const cloudName = (env?.CLOUDINARY_CLOUD_NAME ?? "").trim();
  const apiKey = (env?.CLOUDINARY_API_KEY ?? "").trim();
  const apiSecret = (env?.CLOUDINARY_API_SECRET ?? "").trim();

  if (!CLOUD_NAME_PATTERN.test(cloudName) || !API_KEY_PATTERN.test(apiKey) || apiSecret.length < 10) {
    throw new HTTPException(503, { message: "Media uploads are not configured." });
  }
  return { cloudName, apiKey, apiSecret };
}

/**
 * Signs one upload. The API secret never leaves the server: the browser only receives the
 * signature, which covers the fixed folder, the allowed formats and a timestamp.
 */
async function signUpload(config: CloudinaryConfig, folder: string, formats: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  // Fields are listed alphabetically, as Cloudinary requires, with the secret appended.
  const toSign = `allowed_formats=${formats}&folder=${folder}&timestamp=${timestamp}`;
  const signature = await sha256Hex(toSign + config.apiSecret);

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    timestamp,
    signature,
    folder,
    allowedFormats: formats,
  };
}

adminMedia.post("/media/sign", async (c) => {
  return c.json(await signUpload(readConfig(c.env), IMAGE_FOLDER, IMAGE_FORMATS));
});

adminMedia.post("/cv/sign", async (c) => {
  return c.json(await signUpload(readConfig(c.env), CV_FOLDER, CV_FORMATS));
});

adminMedia.get("/cv", async (c) => {
  return c.json({ url: await getCvUrl(getDb(c)) });
});

adminMedia.put("/cv", async (c) => {
  const body = await readJsonBody(c.req.raw);
  const url = cleanText(body.url, { label: "CV address", max: 500 });

  // An empty address removes the CV. Anything else must be a document in your own Cloudinary account.
  let address = "";
  if (url !== "") {
    const config = readConfig(c.env);

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw badRequest("The CV address is not valid.");
    }
    if (
      parsed.origin !== "https://res.cloudinary.com" ||
      !parsed.pathname.startsWith(`/${config.cloudName}/raw/upload/`)
    ) {
      throw badRequest("The CV must be a file uploaded to your own Cloudinary account.");
    }
    address = parsed.toString();
  }

  await saveCvUrl(getDb(c), address);
  return c.json({ saved: true });
});

export default adminMedia;