import type { D1Database } from "../types";
import { randomToken, sha256Hex } from "../lib/crypto";

export const SESSION_HOURS = 8;
const WINDOW_MINUTES = 15;
const MAX_FAILURES_PER_CLIENT = 5;
const MAX_FAILURES_TOTAL = 30;
const KEEP_ATTEMPTS_HOURS = 24;

/** How long a locked-out visitor is told to wait. */
export const LOCKOUT_SECONDS = WINDOW_MINUTES * 60;

function isoAt(offsetMs = 0): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

/** Creates a session. Only a hash of the token is stored: the token itself goes to the browser. */
export async function createSession(db: D1Database): Promise<{ token: string; maxAgeSeconds: number }> {
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  await db
    .prepare("INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)")
    .bind(tokenHash, isoAt(SESSION_HOURS * 3_600_000))
    .run();
  await db.prepare("DELETE FROM admin_sessions WHERE expires_at < ?").bind(isoAt()).run();
  return { token, maxAgeSeconds: SESSION_HOURS * 3600 };
}

export async function sessionIsValid(db: D1Database, token: string): Promise<boolean> {
  const tokenHash = await sha256Hex(token);
  const row = await db
    .prepare("SELECT id FROM admin_sessions WHERE token_hash = ? AND expires_at > ?")
    .bind(tokenHash, isoAt())
    .first<{ id: number }>();
  return row !== null;
}

export async function deleteSession(db: D1Database, token: string): Promise<void> {
  const tokenHash = await sha256Hex(token);
  await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(tokenHash).run();
}

/** Identifies a visitor's connection without storing the address itself. */
export function hashClient(ip: string): Promise<string> {
  return sha256Hex(`login-attempts:${ip}`);
}

export async function isLockedOut(db: D1Database, clientHash: string): Promise<boolean> {
  const since = isoAt(-WINDOW_MINUTES * 60_000);
  const [mine, all] = await Promise.all([
    db
      .prepare("SELECT COUNT(*) AS count FROM login_attempts WHERE ip_hash = ? AND attempted_at > ?")
      .bind(clientHash, since)
      .first<{ count: number }>(),
    db
      .prepare("SELECT COUNT(*) AS count FROM login_attempts WHERE attempted_at > ?")
      .bind(since)
      .first<{ count: number }>(),
  ]);
  return (mine?.count ?? 0) >= MAX_FAILURES_PER_CLIENT || (all?.count ?? 0) >= MAX_FAILURES_TOTAL;
}

export async function recordFailure(db: D1Database, clientHash: string): Promise<void> {
  await db
    .prepare("INSERT INTO login_attempts (ip_hash, attempted_at) VALUES (?, ?)")
    .bind(clientHash, isoAt())
    .run();
  await db
    .prepare("DELETE FROM login_attempts WHERE attempted_at < ?")
    .bind(isoAt(-KEEP_ATTEMPTS_HOURS * 3_600_000))
    .run();
}

export async function clearFailures(db: D1Database, clientHash: string): Promise<void> {
  await db.prepare("DELETE FROM login_attempts WHERE ip_hash = ?").bind(clientHash).run();
}