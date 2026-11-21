import { bytesToBase64 } from "../lib/crypto";

/**
 * Fingerprints of the page's own inline scripts. The policy allows exactly these scripts,
 * so any other injected script is refused by the browser.
 */
export async function inlineScriptHashes(html: string): Promise<string[]> {
  const hashes: string[] = [];

  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attributes = match[1] ?? "";
    const body = match[2] ?? "";

    // Files from our own site are allowed by 'self'. JSON-LD is data, and is never run.
    if (/\bsrc\s*=/i.test(attributes)) continue;
    if (/type\s*=\s*["']application\/ld\+json["']/i.test(attributes)) continue;
    if (body.trim() === "") continue;

    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
    hashes.push(`'sha256-${bytesToBase64(new Uint8Array(digest))}'`);
  }

  return hashes;
}

/** The content-security policy: where the pages may load anything from. */
export function contentSecurityPolicy(scriptHashes: string[]): string {
  return [
    "default-src 'self'",
    `script-src 'self' https://challenges.cloudflare.com ${scriptHashes.join(" ")}`.trim(),
    "style-src 'self' https://fonts.googleapis.com",
    "style-src-attr 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' https://res.cloudinary.com",
    "connect-src 'self' https://api.cloudinary.com https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/**
 * Security headers for page responses.
 * `mode` is the CSP_MODE setting: "off" sends no policy, "report-only" sends it without enforcing it.
 */
export function securityHeaders(mode: string | undefined, policy: string): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "Strict-Transport-Security": "max-age=31536000",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin",
  };

  const setting = (mode ?? "").trim().toLowerCase();
  if (setting === "off") return headers;

  headers[setting === "report-only" ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy"] =
    policy;
  return headers;
}