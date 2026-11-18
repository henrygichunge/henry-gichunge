import type { D1Database, D1PreparedStatement } from "../types";

export type ProjectStatus = "operational" | "in_development" | "planned" | "status_to_confirm";
export type ContentState = "draft" | "published" | "archived";

export interface AdminProjectRow {
  id: number;
  slug: string;
  name: string;
  category: string;
  status: ProjectStatus;
  state: ContentState;
  sortOrder: number;
}

export interface LinkInput {
  label: string;
  url: string;
}

export interface ProjectInput {
  name: string;
  category: string;
  status: ProjectStatus;
  summary: string;
  overview: string;
  statusNote: string;
  imageUrl: string;
  focusAreas: string[];
  links: LinkInput[];
}

export interface AdminProjectDetail extends ProjectInput {
  id: number;
  slug: string;
  state: ContentState;
}

interface ListRow {
  id: number;
  slug: string;
  name: string;
  category: string;
  status: string;
  state: string;
  sort_order: number;
}

interface DetailRow {
  id: number;
  slug: string;
  name: string;
  category: string;
  status: string;
  state: string;
  summary: string;
  overview: string;
  status_note: string;
  image_url: string | null;
}

export async function listAdminProjects(db: D1Database): Promise<AdminProjectRow[]> {
  const result = await db
    .prepare(
      "SELECT id, slug, name, category, status, state, sort_order FROM projects ORDER BY sort_order, id",
    )
    .all<ListRow>();

  return result.results.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    status: row.status as ProjectStatus,
    state: row.state as ContentState,
    sortOrder: row.sort_order,
  }));
}

export async function getAdminProject(db: D1Database, id: number): Promise<AdminProjectDetail | null> {
  const [row, focus, links] = await Promise.all([
    db
      .prepare(
        "SELECT id, slug, name, category, status, state, summary, overview, status_note, image_url FROM projects WHERE id = ?",
      )
      .bind(id)
      .first<DetailRow>(),
    db
      .prepare("SELECT label FROM project_focus_areas WHERE project_id = ? ORDER BY sort_order, id")
      .bind(id)
      .all<{ label: string }>(),
    db
      .prepare("SELECT label, url FROM project_links WHERE project_id = ? ORDER BY sort_order, id")
      .bind(id)
      .all<LinkInput>(),
  ]);

  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    status: row.status as ProjectStatus,
    state: row.state as ContentState,
    summary: row.summary,
    overview: row.overview,
    statusNote: row.status_note,
    imageUrl: row.image_url ?? "",
    focusAreas: focus.results.map((r) => r.label),
    links: links.results.map((r) => ({ label: r.label, url: r.url })),
  };
}

export async function getProjectBasics(
  db: D1Database,
  id: number,
): Promise<{ slug: string; state: ContentState } | null> {
  const row = await db
    .prepare("SELECT slug, state FROM projects WHERE id = ?")
    .bind(id)
    .first<{ slug: string; state: string }>();
  return row ? { slug: row.slug, state: row.state as ContentState } : null;
}

export async function getProjectIdBySlug(db: D1Database, slug: string): Promise<number | null> {
  const row = await db.prepare("SELECT id FROM projects WHERE slug = ?").bind(slug).first<{ id: number }>();
  return row ? row.id : null;
}

/** Replaces a project's focus areas and links. Used inside the same all-or-nothing batch as the project. */
function childStatements(db: D1Database, slug: string, input: ProjectInput): D1PreparedStatement[] {
  const statements: D1PreparedStatement[] = [
    db
      .prepare("DELETE FROM project_focus_areas WHERE project_id IN (SELECT id FROM projects WHERE slug = ?)")
      .bind(slug),
    db
      .prepare("DELETE FROM project_links WHERE project_id IN (SELECT id FROM projects WHERE slug = ?)")
      .bind(slug),
  ];

  input.focusAreas.forEach((label, index) => {
    statements.push(
      db
        .prepare(
          "INSERT INTO project_focus_areas (project_id, label, sort_order) SELECT id, ?, ? FROM projects WHERE slug = ?",
        )
        .bind(label, index, slug),
    );
  });

  input.links.forEach((link, index) => {
    statements.push(
      db
        .prepare(
          "INSERT INTO project_links (project_id, label, url, sort_order) SELECT id, ?, ?, ? FROM projects WHERE slug = ?",
        )
        .bind(link.label, link.url, index, slug),
    );
  });

  return statements;
}

/** New projects start as drafts at the end of the list. */
export async function createProject(db: D1Database, slug: string, input: ProjectInput): Promise<void> {
  await db.batch([
    db
      .prepare(
        "INSERT INTO projects (slug, name, category, status, summary, overview, status_note, image_url, sort_order, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM projects), 'draft')",
      )
      .bind(
        slug,
        input.name,
        input.category,
        input.status,
        input.summary,
        input.overview,
        input.statusNote,
        input.imageUrl || null,
      ),
    ...childStatements(db, slug, input),
  ]);
}

export async function updateProject(db: D1Database, slug: string, input: ProjectInput): Promise<void> {
  await db.batch([
    db
      .prepare(
        "UPDATE projects SET name = ?, category = ?, status = ?, summary = ?, overview = ?, status_note = ?, image_url = ?, updated_at = ? WHERE slug = ?",
      )
      .bind(
        input.name,
        input.category,
        input.status,
        input.summary,
        input.overview,
        input.statusNote,
        input.imageUrl || null,
        new Date().toISOString(),
        slug,
      ),
    ...childStatements(db, slug, input),
  ]);
}

export async function setProjectState(db: D1Database, id: number, state: ContentState): Promise<void> {
  await db
    .prepare("UPDATE projects SET state = ?, updated_at = ? WHERE id = ?")
    .bind(state, new Date().toISOString(), id)
    .run();
}

export async function reorderProjects(db: D1Database, ids: number[]): Promise<void> {
  await db.batch(
    ids.map((id, index) =>
      db.prepare("UPDATE projects SET sort_order = ? WHERE id = ?").bind(index + 1, id),
    ),
  );
}

/** Deletes a project only if it is archived: the check is part of the SQL itself. */
export async function deleteArchivedProject(db: D1Database, id: number): Promise<void> {
  await db.batch([
    db
      .prepare(
        "DELETE FROM project_focus_areas WHERE project_id IN (SELECT id FROM projects WHERE id = ? AND state = 'archived')",
      )
      .bind(id),
    db
      .prepare(
        "DELETE FROM project_links WHERE project_id IN (SELECT id FROM projects WHERE id = ? AND state = 'archived')",
      )
      .bind(id),
    db.prepare("DELETE FROM projects WHERE id = ? AND state = 'archived'").bind(id),
  ]);
}