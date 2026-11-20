import type { D1Database } from "../types";

export type EnquiryStatus = "new" | "read" | "archived";

export interface EnquiryRow {
  id: number;
  name: string;
  email: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
}

interface Row {
  id: number;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

function isoAgo(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

export async function countRecentFromClient(db: D1Database, clientHash: string): Promise<number> {
  const row = await db
    .prepare("SELECT COUNT(*) AS count FROM contact_enquiries WHERE ip_hash = ? AND created_at > ?")
    .bind(clientHash, isoAgo(HOUR_MS))
    .first<{ count: number }>();
  return row?.count ?? 0;
}

export async function countRecentTotal(db: D1Database): Promise<number> {
  const row = await db
    .prepare("SELECT COUNT(*) AS count FROM contact_enquiries WHERE created_at > ?")
    .bind(isoAgo(HOUR_MS))
    .first<{ count: number }>();
  return row?.count ?? 0;
}

export async function isRecentDuplicate(
  db: D1Database,
  clientHash: string,
  message: string,
): Promise<boolean> {
  const row = await db
    .prepare(
      "SELECT id FROM contact_enquiries WHERE ip_hash = ? AND message = ? AND created_at > ? LIMIT 1",
    )
    .bind(clientHash, message, isoAgo(DAY_MS))
    .first<{ id: number }>();
  return row !== null;
}

export async function insertEnquiry(
  db: D1Database,
  input: { name: string; email: string; message: string; clientHash: string },
): Promise<void> {
  await db
    .prepare("INSERT INTO contact_enquiries (name, email, message, ip_hash) VALUES (?, ?, ?, ?)")
    .bind(input.name, input.email, input.message, input.clientHash)
    .run();
}

/** The most recent 200 messages, newest first. */
export async function listEnquiries(db: D1Database): Promise<EnquiryRow[]> {
  const result = await db
    .prepare(
      "SELECT id, name, email, message, status, created_at FROM contact_enquiries ORDER BY created_at DESC, id DESC LIMIT 200",
    )
    .all<Row>();

  return result.results.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    status: row.status as EnquiryStatus,
    createdAt: row.created_at,
  }));
}

export async function getEnquiryStatus(db: D1Database, id: number): Promise<EnquiryStatus | null> {
  const row = await db
    .prepare("SELECT status FROM contact_enquiries WHERE id = ?")
    .bind(id)
    .first<{ status: string }>();
  return row ? (row.status as EnquiryStatus) : null;
}

export async function setEnquiryStatus(
  db: D1Database,
  id: number,
  status: EnquiryStatus,
): Promise<void> {
  await db
    .prepare("UPDATE contact_enquiries SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, new Date().toISOString(), id)
    .run();
}

/** Deletes a message only if it is archived: the check is part of the SQL itself. */
export async function deleteArchivedEnquiry(db: D1Database, id: number): Promise<void> {
  await db.prepare("DELETE FROM contact_enquiries WHERE id = ? AND status = 'archived'").bind(id).run();
}