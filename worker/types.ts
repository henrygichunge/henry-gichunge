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
}

/**
 * Cloudflare bindings available to the Worker.
 * DB is missing when running locally on a phone, so it is optional.
 */
export interface Bindings {
  ENVIRONMENT?: string;
  DB?: D1Database;
}

export type AppEnv = { Bindings: Bindings };