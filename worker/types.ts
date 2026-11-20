/** The parts of Cloudflare D1 that this project uses. The real D1 object matches this shape. */
export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  /** Runs several statements together: all succeed or none are applied. */
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

/**
 * Cloudflare bindings available to the Worker.
 * DB and the secrets are missing when running locally on a phone, so they are optional.
 */
export interface Bindings {
  ENVIRONMENT?: string;
  DB?: D1Database;
  /** Secret: the one email address allowed to sign in. */
  ADMIN_EMAIL?: string;
  /** Secret: pbkdf2-sha256$iterations$salt$hash, made with scripts/hash-password.mjs. */
  ADMIN_PASSWORD_HASH?: string;
  /** Secrets for image and CV uploads: from the Cloudinary console, set in the Cloudflare dashboard. */
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  /** Secrets for the contact form spam check: from the Cloudflare Turnstile widget. Optional. */
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export type AppEnv = {
  Bindings: Bindings;
  Variables: { adminEmail: string };
};