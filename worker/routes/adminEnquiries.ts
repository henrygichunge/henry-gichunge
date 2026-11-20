import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getDb } from "../db/client";
import {
  deleteArchivedEnquiry,
  getEnquiryStatus,
  listEnquiries,
  setEnquiryStatus,
  type EnquiryStatus,
} from "../db/enquiries";
import { badRequest, readJsonBody } from "../lib/validate";
import type { AppEnv } from "../types";

/** Mounted below the admin guard (see routes/admin.ts): every route here requires a signed-in admin. */
const adminEnquiries = new Hono<AppEnv>();

const STATUS_VALUES: readonly string[] = ["new", "read", "archived"];

function parseId(raw: string): number {
  if (!/^\d{1,9}$/.test(raw)) throw new HTTPException(404, { message: "Message not found." });
  return Number(raw);
}

adminEnquiries.get("/enquiries", async (c) => {
  return c.json({ items: await listEnquiries(getDb(c)) });
});

adminEnquiries.put("/enquiries/:id/status", async (c) => {
  const db = getDb(c);
  const id = parseId(c.req.param("id"));
  if ((await getEnquiryStatus(db, id)) === null) {
    throw new HTTPException(404, { message: "Message not found." });
  }

  const body = await readJsonBody(c.req.raw);
  if (typeof body.status !== "string" || !STATUS_VALUES.includes(body.status)) {
    throw badRequest("Choose a valid status.");
  }

  await setEnquiryStatus(db, id, body.status as EnquiryStatus);
  return c.json({ saved: true });
});

adminEnquiries.delete("/enquiries/:id", async (c) => {
  const db = getDb(c);
  const id = parseId(c.req.param("id"));
  const status = await getEnquiryStatus(db, id);
  if (status === null) throw new HTTPException(404, { message: "Message not found." });
  if (status !== "archived") {
    throw new HTTPException(409, {
      message: "Only archived messages can be deleted. Archive it first.",
    });
  }

  await deleteArchivedEnquiry(db, id);
  return c.json({ deleted: true });
});

export default adminEnquiries;