import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getDb } from "../db/client";
import {
  countTimeline,
  createTimelineItem,
  deleteArchivedTimelineItem,
  getSkillGroups,
  getTimelineBasics,
  getTimelineItem,
  listTimeline,
  reorderTimeline,
  saveSkillGroups,
  setTimelineState,
  updateTimelineItem,
  type SkillGroupInput,
  type TimelineInput,
  type TimelineKind,
} from "../db/adminBackground";
import type { ContentState } from "../db/adminProjects";
import { badRequest, cleanText, readJsonBody } from "../lib/validate";
import type { AppEnv } from "../types";

/** Mounted below the admin guard (see routes/admin.ts): every route here requires a signed-in admin. */
const adminBackground = new Hono<AppEnv>();

const KIND_VALUES: readonly string[] = ["experience", "education"];
const STATE_VALUES: readonly string[] = ["draft", "published", "archived"];
const MAX_PER_KIND = 30;
const MAX_GROUPS = 8;
const MAX_SKILLS = 15;

function parseId(raw: string): number {
  if (!/^\d{1,9}$/.test(raw)) throw new HTTPException(404, { message: "Entry not found." });
  return Number(raw);
}

function pickKind(value: unknown): TimelineKind {
  if (typeof value === "string" && KIND_VALUES.includes(value)) return value as TimelineKind;
  throw badRequest("Choose experience or education.");
}

function pickState(value: unknown): ContentState {
  if (typeof value === "string" && STATE_VALUES.includes(value)) return value as ContentState;
  throw badRequest("Choose a valid visibility.");
}

function parseTimeline(body: Record<string, unknown>): TimelineInput {
  return {
    title: cleanText(body.title, { label: "Title", max: 100, required: true }),
    organisation: cleanText(body.organisation, { label: "Organisation", max: 100 }),
    period: cleanText(body.period, { label: "Period", max: 60 }),
    description: cleanText(body.description, { label: "Description", max: 1000, multiline: true }),
  };
}

adminBackground.get("/timeline", async (c) => {
  return c.json({ items: await listTimeline(getDb(c)) });
});

adminBackground.post("/timeline", async (c) => {
  const db = getDb(c);
  const body = await readJsonBody(c.req.raw);
  const kind = pickKind(body.kind);
  const input = parseTimeline(body);

  if ((await countTimeline(db, kind)) >= MAX_PER_KIND) {
    throw badRequest(`You can have at most ${MAX_PER_KIND} entries in this section.`);
  }

  const id = await createTimelineItem(db, kind, input);
  if (id === null) throw new Error("The new entry could not be found after saving.");
  return c.json({ id }, 201);
});

// Registered before "/timeline/:id" so that "order" is not mistaken for an id.
adminBackground.put("/timeline/order", async (c) => {
  const body = await readJsonBody(c.req.raw);
  const kind = pickKind(body.kind);

  if (!Array.isArray(body.ids) || body.ids.length === 0 || body.ids.length > MAX_PER_KIND) {
    throw badRequest("Invalid request.");
  }
  const ids = (body.ids as unknown[]).map((value) => {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
      throw badRequest("Invalid request.");
    }
    return value;
  });
  if (new Set(ids).size !== ids.length) throw badRequest("Invalid request.");

  await reorderTimeline(getDb(c), kind, ids);
  return c.json({ saved: true });
});

adminBackground.get("/timeline/:id", async (c) => {
  const item = await getTimelineItem(getDb(c), parseId(c.req.param("id")));
  if (!item) throw new HTTPException(404, { message: "Entry not found." });
  return c.json(item);
});

adminBackground.put("/timeline/:id", async (c) => {
  const db = getDb(c);
  const id = parseId(c.req.param("id"));
  if (!(await getTimelineBasics(db, id))) {
    throw new HTTPException(404, { message: "Entry not found." });
  }

  const input = parseTimeline(await readJsonBody(c.req.raw));
  await updateTimelineItem(db, id, input);
  return c.json({ saved: true });
});

adminBackground.put("/timeline/:id/state", async (c) => {
  const db = getDb(c);
  const id = parseId(c.req.param("id"));
  if (!(await getTimelineBasics(db, id))) {
    throw new HTTPException(404, { message: "Entry not found." });
  }

  const body = await readJsonBody(c.req.raw);
  await setTimelineState(db, id, pickState(body.state));
  return c.json({ saved: true });
});

adminBackground.delete("/timeline/:id", async (c) => {
  const db = getDb(c);
  const id = parseId(c.req.param("id"));
  const basics = await getTimelineBasics(db, id);
  if (!basics) throw new HTTPException(404, { message: "Entry not found." });
  if (basics.state !== "archived") {
    throw new HTTPException(409, {
      message: "Only archived entries can be deleted. Archive it first.",
    });
  }

  await deleteArchivedTimelineItem(db, id);
  return c.json({ deleted: true });
});

adminBackground.get("/skills", async (c) => {
  return c.json({ groups: await getSkillGroups(getDb(c)) });
});

adminBackground.put("/skills", async (c) => {
  const body = await readJsonBody(c.req.raw);

  if (!Array.isArray(body.groups)) throw badRequest("Invalid request.");
  if (body.groups.length > MAX_GROUPS) {
    throw badRequest(`You can have at most ${MAX_GROUPS} skill groups.`);
  }

  const seenGroups = new Set<string>();
  const groups: SkillGroupInput[] = (body.groups as unknown[]).map((raw, groupIndex) => {
    if (typeof raw !== "object" || raw === null) throw badRequest("Invalid skill group.");
    const entry = raw as Record<string, unknown>;
    const number = groupIndex + 1;

    const title = cleanText(entry.title, { label: `Group ${number} title`, max: 40, required: true });
    const groupKey = title.toLowerCase();
    if (seenGroups.has(groupKey)) throw badRequest("Group titles must all be different from each other.");
    seenGroups.add(groupKey);

    if (!Array.isArray(entry.items)) throw badRequest("Invalid skill group.");
    if (entry.items.length > MAX_SKILLS) {
      throw badRequest(`Group ${number} can have at most ${MAX_SKILLS} skills.`);
    }

    const seenSkills = new Set<string>();
    const items = (entry.items as unknown[]).map((item, skillIndex) => {
      const name = cleanText(item, {
        label: `Group ${number} skill ${skillIndex + 1}`,
        max: 40,
        required: true,
      });
      const skillKey = name.toLowerCase();
      if (seenSkills.has(skillKey)) {
        throw badRequest(`Group ${number} has the same skill more than once.`);
      }
      seenSkills.add(skillKey);
      return name;
    });

    return { title, items };
  });

  await saveSkillGroups(getDb(c), groups);
  return c.json({ saved: true });
});

export default adminBackground;