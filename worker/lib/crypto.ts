const encoder = new TextEncoder();

/** The Workers runtime refuses PBKDF2 above this many iterations. */
export const MAX_PBKDF2_ITERATIONS = 100_000;
const MIN_PBKDF2_ITERATIONS = 10_000;
const DUMMY_ITERATIONS = 50_000;
const DUMMY_SALT = new Uint8Array(16);

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(text: string) {
  try {
    const binary = atob(text);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** A random, URL-safe token with 256 bits of randomness by default. */
export function randomToken(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256Bytes(text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(text)));
}

export async function sha256Hex(text: string): Promise<string> {
  const bytes = await sha256Bytes(text);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Compares two byte arrays without stopping at the first difference. */
function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

/** Compares two strings in constant time, whatever their lengths. */
export async function safeEqualText(a: string, b: string): Promise<boolean> {
  const [hashA, hashB] = await Promise.all([sha256Bytes(a), sha256Bytes(b)]);
  return bytesEqual(hashA, hashB);
}

async function derive(password: string, salt: BufferSource, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

/**
 * Checks a password against a stored "pbkdf2-sha256$iterations$salt$hash" string.
 * A missing or malformed stored value still does the same amount of work, then returns false.
 */
export async function verifyPassword(password: string, stored: string | undefined): Promise<boolean> {
  const parts = (stored ?? "").split("$");
  const iterations = Number(parts[1]);
  const salt = parts[2] ? base64ToBytes(parts[2]) : null;
  const expected = parts[3] ? base64ToBytes(parts[3]) : null;

  const valid =
    parts.length === 4 &&
    parts[0] === "pbkdf2-sha256" &&
    Number.isInteger(iterations) &&
    iterations >= MIN_PBKDF2_ITERATIONS &&
    iterations <= MAX_PBKDF2_ITERATIONS &&
    salt !== null &&
    salt.length >= 16 &&
    expected !== null &&
    expected.length === 32;

  if (!valid || !salt || !expected) {
    await derive(password, DUMMY_SALT, DUMMY_ITERATIONS);
    return false;
  }

  const actual = await derive(password, salt, iterations);
  return bytesEqual(actual, expected);
}