import { request } from "./adminData";

const MAX_BYTES = 5 * 1024 * 1024;
/** Every real PDF file starts with these bytes: "%PDF-". */
const PDF_MARKER = [0x25, 0x50, 0x44, 0x46, 0x2d];

export type CvUploadResult = { ok: true; url: string } | { ok: false; message: string };

interface SignResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
}

interface CloudinaryResponse {
  secure_url?: string;
  error?: { message?: string };
}

export function getCv() {
  return request<{ url: string }>("/api/admin/cv");
}

export function saveCv(url: string) {
  return request<{ saved: boolean }>("/api/admin/cv", {
    method: "PUT",
    body: JSON.stringify({ url }),
  });
}

async function looksLikePdf(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, PDF_MARKER.length).arrayBuffer());
  return PDF_MARKER.every((byte, index) => head[index] === byte);
}

/** Uploads a PDF to Cloudinary and returns its public address. Never throws. */
export async function uploadCv(file: File): Promise<CvUploadResult> {
  if (file.size === 0) return { ok: false, message: "That file is empty." };
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "That PDF is too large. Choose one under 5 MB." };
  }

  let isPdf = false;
  try {
    isPdf = await looksLikePdf(file);
  } catch {
    return { ok: false, message: "That file could not be read." };
  }
  if (!isPdf) return { ok: false, message: "Choose a PDF file." };

  const signed = await request<SignResponse>("/api/admin/cv/sign", { method: "POST" });
  if (!signed.ok) {
    if (signed.status === 401) {
      return { ok: false, message: "Your session has expired. Please sign in again." };
    }
    return { ok: false, message: signed.message };
  }
  const { cloudName, apiKey, timestamp, signature, folder, allowedFormats } = signed.data;

  const form = new FormData();
  form.append("file", file, "cv.pdf");
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);
  form.append("allowed_formats", allowedFormats);

  let data: CloudinaryResponse | null = null;
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/raw/upload`,
      { method: "POST", body: form },
    );
    data = (await response.json()) as CloudinaryResponse;
    if (!response.ok) {
      return { ok: false, message: data.error?.message ?? "The upload was refused." };
    }
  } catch {
    return { ok: false, message: "Could not reach the file service." };
  }

  const prefix = `https://res.cloudinary.com/${cloudName}/raw/upload/`;
  if (!data || !data.secure_url || !data.secure_url.startsWith(prefix)) {
    return { ok: false, message: "The file service returned an unexpected address." };
  }
  return { ok: true, url: data.secure_url };
}