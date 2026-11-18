import { HTTPException } from "hono/http-exception";

/** A 400 error whose message is safe to show to the admin. */
export function badRequest(message: string): HTTPException {
  return new HTTPException(400, { message });
}

/** Reads a small JSON object from a request, refusing anything else. */
export async function readJsonBody(
  request: Request,
  maxChars = 20_000,
): Promise<Record<string, unknown>> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) {
    throw new HTTPException(415, { message: "Unsupported request." });
  }

  const text = await request.text();
  if (text.length > maxChars) {
    throw new HTTPException(413, { message: "Request too large." });
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw badRequest("Invalid request.");
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw badRequest("Invalid request.");
  }
  return data as Record<string, unknown>;
}

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export interface TextRules {
  label: string;
  max: number;
  required?: boolean;
  multiline?: boolean;
}

/** Trims text and checks its type, length, line breaks and control characters. */
export function cleanText(value: unknown, rules: TextRules): string {
  if (typeof value !== "string") throw badRequest(`${rules.label} must be text.`);

  const result = value.replace(/\r\n/g, "\n").trim();
  if (!rules.multiline && result.includes("\n")) {
    throw badRequest(`${rules.label} must be on one line.`);
  }
  if (CONTROL_CHARACTERS.test(result)) {
    throw badRequest(`${rules.label} contains characters that are not allowed.`);
  }
  if (rules.required && result.length === 0) throw badRequest(`${rules.label} is required.`);
  if (result.length > rules.max) {
    throw badRequest(`${rules.label} must be at most ${rules.max} characters.`);
  }
  return result;
}

/** An empty string, an https/http address, or (when allowed) a site path such as /images/a.png. */
export function optionalWebAddress(value: unknown, label: string, allowSitePath: boolean): string {
  const text = cleanText(value, { label, max: 500 });
  if (text === "") return "";
  if (allowSitePath && text.startsWith("/") && !text.startsWith("//")) return text;

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw badRequest(`${label} must be a full web address starting with https://.`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw badRequest(`${label} must be a full web address starting with https://.`);
  }
  return url.toString();
}

export function requiredWebAddress(value: unknown, label: string): string {
  const address = optionalWebAddress(value, label, false);
  if (address === "") throw badRequest(`${label} is required.`);
  return address;
}