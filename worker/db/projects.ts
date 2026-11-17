import type { D1Database } from "../types";
import type { ProjectItem, ProjectLinkItem, ProjectStatusLabel } from "../../shared/api";

interface ProjectRow {
  id: number;
  slug: string;
  name: string;
  category: string;
  status: string;
  summary: string;
  overview: string;
  status_note: string;
  image_url: string | null;
}

interface FocusRow {
  project_id: number;
  label: string;
}

interface LinkRow {
  project_id: number;
  label: string;
  url: string;
}

const STATUS_LABELS: Record<string, ProjectStatusLabel> = {
  operational: "Operational",
  in_development: "In development",
  planned: "Planned",
  status_to_confirm: "Status to confirm",
};

/** Allows only http(s) addresses, plus site paths such as /images/a.png when allowed. */
function safeUrl(value: string | null, allowSitePath: boolean): string | null {
  if (!value) return null;
  if (allowSitePath && value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function listPublishedProjects(db: D1Database): Promise<ProjectItem[]> {
  const publishedIds = "SELECT id FROM projects WHERE state = 'published'";

  const [projectsResult, focusResult, linksResult] = await Promise.all([
    db
      .prepare(
        "SELECT id, slug, name, category, status, summary, overview, status_note, image_url FROM projects WHERE state = 'published' ORDER BY sort_order, id",
      )
      .all<ProjectRow>(),
    db
      .prepare(
        `SELECT project_id, label FROM project_focus_areas WHERE project_id IN (${publishedIds}) ORDER BY project_id, sort_order, id`,
      )
      .all<FocusRow>(),
    db
      .prepare(
        `SELECT project_id, label, url FROM project_links WHERE project_id IN (${publishedIds}) ORDER BY project_id, sort_order, id`,
      )
      .all<LinkRow>(),
  ]);

  const focusByProject = new Map<number, string[]>();
  for (const row of focusResult.results) {
    const list = focusByProject.get(row.project_id) ?? [];
    list.push(row.label);
    focusByProject.set(row.project_id, list);
  }

  const linksByProject = new Map<number, ProjectLinkItem[]>();
  for (const row of linksResult.results) {
    const url = safeUrl(row.url, false);
    if (!url) continue;
    const list = linksByProject.get(row.project_id) ?? [];
    list.push({ label: row.label, url });
    linksByProject.set(row.project_id, list);
  }

  return projectsResult.results.map((row) => ({
    slug: row.slug,
    name: row.name,
    category: row.category,
    status: STATUS_LABELS[row.status] ?? "Status to confirm",
    summary: row.summary,
    image: safeUrl(row.image_url, true),
    overview: row.overview,
    statusNote: row.status_note,
    focusAreas: focusByProject.get(row.id) ?? [],
    links: linksByProject.get(row.id) ?? [],
  }));
}