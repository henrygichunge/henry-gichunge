import { request } from "./adminData";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

export type UploadResult = { ok: true; url: string } | { ok: false; message: string };

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

/** Shrinks and re-saves the photo as a JPEG. Re-saving also removes hidden data such as location. */
async function shrink(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("That file could not be read as an image.");
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Your browser could not prepare the image.");
  }

  // JPEG has no transparency, so transparent areas become white.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) throw new Error("Your browser could not prepare the image.");
  return blob;
}

/** Uploads one image to Cloudinary and returns its public address. Never throws. */
export async function uploadImage(file: File): Promise<UploadResult> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, message: "Choose a JPEG, PNG or WebP image." };
  }
  if (file.size > MAX_SOURCE_BYTES) {
    return { ok: false, message: "That image is too large. Choose one under 25 MB." };
  }

  let blob: Blob;
  try {
    blob = await shrink(file);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "The image could not be prepared.",
    };
  }

  const signed = await request<SignResponse>("/api/admin/media/sign", { method: "POST" });
  if (!signed.ok) {
    if (signed.status === 401) {
      return { ok: false, message: "Your session has expired. Please sign in again." };
    }
    return { ok: false, message: signed.message };
  }
  const { cloudName, apiKey, timestamp, signature, folder, allowedFormats } = signed.data;

  const form = new FormData();
  form.append("file", blob, "upload.jpg");
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);
  form.append("allowed_formats", allowedFormats);

  let data: CloudinaryResponse | null = null;
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
      { method: "POST", body: form },
    );
    data = (await response.json()) as CloudinaryResponse;
    if (!response.ok) {
      return { ok: false, message: data.error?.message ?? "The upload was refused." };
    }
  } catch {
    return { ok: false, message: "Could not reach the image service." };
  }

  const prefix = `https://res.cloudinary.com/${cloudName}/image/upload/`;
  if (!data || !data.secure_url || !data.secure_url.startsWith(prefix)) {
    return { ok: false, message: "The image service returned an unexpected address." };
  }

  // Ask Cloudinary to serve a smaller, modern format to each visitor.
  return { ok: true, url: data.secure_url.replace("/image/upload/", "/image/upload/f_auto,q_auto/") };
}