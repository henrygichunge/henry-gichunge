import type { D1Database, D1PreparedStatement } from "../types";
import type { ContentState } from "./adminProjects";

export type TimelineKind = "experience" | "education";

export interface TimelineRow {
  id: number;
  kind: TimelineKind;
  title: string;
  organisation: string;
  period: string;
  state: ContentState;
  sortOrder: number;
}

export interface TimelineInput {
  title: string;
  organisation: string;
  period: string;
  description: string;
}

export interface TimelineDetail extends TimelineInput {
  id: number;
  kind: TimelineKind;
  state: ContentState;
}

export interface SkillGroupInput {
  title: string;
  items: string[];
}

interface TimelineListRow {
  id: number;
  kind: string;
  title: string;
  organisation: string;
  period: string;
  state: string;
  sort_order: number;
}

interface TimelineDetailRow {
  id: number;
  kind: string;
  title: string;
  organisation: string;
  period: string;
  description: string;
  state: string;
}

export async function listTimeline(db: D1Database): Promise<TimelineRow[]> {
  const result = await db
    .prepare(
      "SELECT id, kind, title, organisation, period, state, sort_order FROM timeline_items ORDER BY kind, sort_order, id",
    )
    .all<TimelineListRow>();

  return result.results.map((row) => ({
    id: row.id,
    kind: row.kind as TimelineKind,
    title: row.title,
    organisation: row.organisation,
    period: row.period,
    state: row.state as ContentState,
    sortOrder: row.sort_order,
  }));
}

export async function countTimeline(db: D1Database, kind: TimelineKind): Promise<number> {
  const row = await db
    .prepare("SELECT COUNT(*) AS count FROM timeline_items WHERE kind = ?")
    .bind(kind)
    .first<{ count: number }>();
  return row?.count ?? 0;
}

export async function getTimelineItem(db: D1Database, id: number): Promise<TimelineDetail | null> {
  const row = await db
    .prepare(
      "SELECT id, kind, title, organisation, period, description, state FROM timeline_items WHERE id = ?",
    )
    .bind(id)
    .first<TimelineDetailRow>();

  if (!row) return null;

  return {
    id: row.id,
    kind: row.kind as TimelineKind,
    title: row.title,
    organisation: row.organisation,
    period: row.period,
    description: row.description,
    state: row.state as ContentState,
  };
}

export async function getTimelineBasics(
  db: D1Database,
  id: number,
): Promise<{ kind: TimelineKind; state: ContentState } | null> {
  const row = await db
    .prepare("SELECT kind, state FROM timeline_items WHERE id = ?")
    .bind(id)
    .first<{ kind: string; state: string }>();
  return row ? { kind: row.kind as TimelineKind, state: row.state as ContentState } : null;
}

/** New entries start as drafts at the end of their section. Returns the new entry's id. */
export async function createTimelineItem(
  db: D1Database,
  kind: TimelineKind,
  input: TimelineInput,
): Promise<number | null> {
  await db
    .prepare(
      "INSERT INTO timeline_items (kind, title, organisation, period, description, sort_order, state) VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM timeline_items WHERE kind = ?), 'draft')",
    )
    .bind(kind, input.title, input.organisation, input.period, input.description, kind)
    .run();

  const row = await db
    .prepare("SELECT id FROM timeline_items WHERE kind = ? ORDER BY id DESC LIMIT 1")
    .bind(kind)
    .first<{ id: number }>();
  return row ? row.id : null;
}

export async function updateTimelineItem(
  db: D1Database,
  id: number,
  input: TimelineInput,
): Promise<void> {
  await db
    .prepare(
      "UPDATE timeline_items SET title = ?, organisation = ?, period = ?, description = ?, updated_at = ? WHERE id = ?",
    )
    .bind(input.title, input.organisation, input.period, input.description, new Date().toISOString(), id)
    .run();
}

export async function setTimelineState(db: D1Database, id: number, state: ContentState): Promise<void> {
  await db
    .prepare("UPDATE timeline_items SET state = ?, updated_at = ? WHERE id = ?")
    .bind(state, new Date().toISOString(), id)
    .run();
}

/** Sets the order within one section. The kind check stops an id from another section being touched. */
export async function reorderTimeline(db: D1Database, kind: TimelineKind, ids: number[]): Promise<void> {
  await db.batch(
    ids.map((id, index) =>
      db
        .prepare("UPDATE timeline_items SET sort_order = ? WHERE id = ? AND kind = ?")
        .bind(index + 1, id, kind),
    ),
  );
}

/** Deletes an entry only if it is archived: the check is part of the SQL itself. */
export async function deleteArchivedTimelineItem(db: D1Database, id: number): Promise<void> {
  await db.prepare("DELETE FROM timeline_items WHERE id = ? AND state = 'archived'").bind(id).run();
}

export async function getSkillGroups(db: D1Database): Promise<SkillGroupInput[]> {
  const [groups, skills] = await Promise.all([
    db.prepare("SELECT id, title FROM skill_groups ORDER BY sort_order, id").all<{ id: number; title: string }>(),
    db
      .prepare("SELECT group_id, name FROM skills ORDER BY group_id, sort_order, id")
      .all<{ group_id: number; name: string }>(),
  ]);

  const byGroup = new Map<number, string[]>();
  for (const skill of skills.results) {
    const list = byGroup.get(skill.group_id) ?? [];
    list.push(skill.name);
    byGroup.set(skill.group_id, list);
  }

  return groups.results.map((group) => ({ title: group.title, items: byGroup.get(group.id) ?? [] }));
}

/** Replaces every skill group and skill in one all-or-nothing step. */
export async function saveSkillGroups(db: D1Database, groups: SkillGroupInput[]): Promise<void> {
  const statements: D1PreparedStatement[] = [
    db.prepare("DELETE FROM skills"),
    db.prepare("DELETE FROM skill_groups"),
  ];

  groups.forEach((group, groupIndex) => {
    statements.push(
      db.prepare("INSERT INTO skill_groups (title, sort_order) VALUES (?, ?)").bind(group.title, groupIndex),
    );
    group.items.forEach((name, skillIndex) => {
      statements.push(
        db
          .prepare(
            "INSERT INTO skills (group_id, name, sort_order) SELECT id, ?, ? FROM skill_groups WHERE sort_order = ?",
          )
          .bind(name, skillIndex, groupIndex),
      );
    });
  });

  await db.batch(statements);
}