import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getDb } from "../db/client";
import {
  createProject,
  deleteArchivedProject,
  getAdminProject,
  getProjectBasics,
  getProjectIdBySlug,
  listAdminProjects,
  reorderProjects,
  setProjectState,
  updateProject,
  type ContentState,
  type ProjectInput,
  type ProjectStatus,
} from "../db/adminProjects";
import {
  badRequest,
  cleanText,
  optionalWebAddress,
  readJsonBody,
  requiredWebAddress,
} from "../lib/validate";
import type { AppEnv } from "../types";

/** Mounted below the admin guard (see routes/admin.ts): every route here requires a signed-in admin. */
const adminProjects = new Hono<AppEnv>();

const STATUS_VALUES: readonly string[] = ["operational", "in_development", "planned", "status_to_confirm"];
const STATE_VALUES: readonly string[] = ["draft", "published", "archived"];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_FOCUS_AREAS = 12;
const MAX_LINKS = 8;
const MAX_PROJECTS = 100;

function parseId(raw: string): number {
  if (!/^\d{1,9}$/.test(raw)) throw new HTTPException(404, { message: "Project not found." });
  return Number(raw);
}

function pickStatus(value: unknown): ProjectStatus {
  if (typeof value === "string" && STATUS_VALUES.includes(value)) return value as ProjectStatus;
  throw badRequest("Choose a valid status.");
}

function pickState(value: unknown): ContentState {
  if (typeof value === "string" && STATE_VALUES.includes(value)) return value as ContentState;
  throw badRequest("Choose a valid visibility.");
}

function parseInput(body: Record<string, unknown>): ProjectInput {
  if (!Array.isArray(body.focusAreas) || !Array.isArray(body.links)) {
    throw badRequest("Invalid request.");
  }
  if (body.focusAreas.length > MAX_FOCUS_AREAS) {
    throw badRequest(`You can add at most ${MAX_FOCUS_AREAS} focus areas.`);
  }
  if (body.links.length > MAX_LINKS) {
    throw badRequest(`You can add at most ${MAX_LINKS} links.`);
  }

  const focusAreas = (body.focusAreas as unknown[]).map((item, index) =>
    cleanText(item, { label: `Focus area ${index + 1}`, max: 80, required: true }),
  );
  const seen = new Set<string>();
  for (const label of focusAreas) {
    const key = label.toLowerCase();
    if (seen.has(key)) throw badRequest("Focus areas must all be different from each other.");
    seen.add(key);
  }

  const links = (body.links as unknown[]).map((item, index) => {
    if (typeof item !== "object" || item === null) throw badRequest("Invalid link.");
    const entry = item as Record<string, unknown>;
    const number = index + 1;
    return {
      label: cleanText(entry.label, { label: `Link ${number} label`, max: 40, required: true }),
      url: requiredWebAddress(entry.url, `Link ${number} address`),
    };
  });

  return {
    name: cleanText(body.name, { label: "Name", max: 80, required: true }),
    category: cleanText(body.category, { label: "Category", max: 60, required: true }),
    status: pickStatus(body.status),
    summary: cleanText(body.summary, { label: "Summary", max: 500, required: true, multiline: true }),
    overview: cleanText(body.overview, { label: "Overview", max: 2000, multiline: true }),
    statusNote: cleanText(body.statusNote, { label: "Status note", max: 500, multiline: true }),
    imageUrl: optionalWebAddress(body.imageUrl, "Image address", true),
    focusAreas,
    links,
  };
}

adminProjects.get("/projects", async (c) => {
  return c.json({ projects: await listAdminProjects(getDb(c)) });
});

adminProjects.post("/projects", async (c) => {
  const db = getDb(c);
  const body = await readJsonBody(c.req.raw);

  const slug = cleanText(body.slug, { label: "Slug", max: 60, required: true });
  if (!SLUG_PATTERN.test(slug)) {
    throw badRequest("Slug may contain only lowercase letters, numbers and single dashes.");
  }
  const input = parseInput(body);

  if ((await listAdminProjects(db)).length >= MAX_PROJECTS) {
    throw badRequest(`You can have at most ${MAX_PROJECTS} projects.`);
  }
  if ((await getProjectIdBySlug(db, slug)) !== null) {
    throw new HTTPException(409, { message: "A project with that slug already exists." });
  }

  await createProject(db, slug, input);
  const id = await getProjectIdBySlug(db, slug);
  return c.json({ id }, 201);
});

// Registered before "/projects/:id" so that "order" is not mistaken for an id.
adminProjects.put("/projects/order", async (c) => {
  const body = await readJsonBody(c.req.raw);

  if (!Array.isArray(body.ids) || body.ids.length === 0 || body.ids.length > MAX_PROJECTS) {
    throw badRequest("Invalid request.");
  }
  const ids = (body.ids as unknown[]).map((value) => {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
      throw badRequest("Invalid request.");
    }
    return value;
  });
  if (new Set(ids).size !== ids.length) throw badRequest("Invalid request.");

  await reorderProjects(getDb(c), ids);
  return c.json({ saved: true });
});

adminProjects.get("/projects/:id", async (c) => {
  const project = await getAdminProject(getDb(c), parseId(c.req.param("id")));
  if (!project) throw new HTTPException(404, { message: "Project not found." });
  return c.json(project);
});

adminProjects.put("/projects/:id", async (c) => {
  const db = getDb(c);
  const basics = await getProjectBasics(db, parseId(c.req.param("id")));
  if (!basics) throw new HTTPException(404, { message: "Project not found." });

  const input = parseInput(await readJsonBody(c.req.raw));
  await updateProject(db, basics.slug, input);
  return c.json({ saved: true });
});

adminProjects.put("/projects/:id/state", async (c) => {
  const db = getDb(c);
  const id = parseId(c.req.param("id"));
  if (!(await getProjectBasics(db, id))) {
    throw new HTTPException(404, { message: "Project not found." });
  }

  const body = await readJsonBody(c.req.raw);
  await setProjectState(db, id, pickState(body.state));
  return c.json({ saved: true });
});

adminProjects.delete("/projects/:id", async (c) => {
  const db = getDb(c);
  const id = parseId(c.req.param("id"));
  const basics = await getProjectBasics(db, id);
  if (!basics) throw new HTTPException(404, { message: "Project not found." });
  if (basics.state !== "archived") {
    throw new HTTPException(409, {
      message: "Only archived projects can be deleted. Archive it first.",
    });
  }

  await deleteArchivedProject(db, id);
  return c.json({ deleted: true });
});

export default adminProjects;