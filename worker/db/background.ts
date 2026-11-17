import type { D1Database } from "../types";
import type { BackgroundResponse, SkillGroupItem, TimelineEntry } from "../../shared/api";

interface TimelineRow {
  kind: string;
  title: string;
  organisation: string;
  period: string;
  description: string;
}

interface GroupRow {
  id: number;
  title: string;
}

interface SkillRow {
  group_id: number;
  name: string;
}

export async function getBackground(db: D1Database): Promise<BackgroundResponse> {
  const [timelineResult, groupsResult, skillsResult] = await Promise.all([
    db
      .prepare(
        "SELECT kind, title, organisation, period, description FROM timeline_items WHERE state = 'published' ORDER BY sort_order, id",
      )
      .all<TimelineRow>(),
    db.prepare("SELECT id, title FROM skill_groups ORDER BY sort_order, id").all<GroupRow>(),
    db
      .prepare("SELECT group_id, name FROM skills ORDER BY group_id, sort_order, id")
      .all<SkillRow>(),
  ]);

  const experience: TimelineEntry[] = [];
  const education: TimelineEntry[] = [];
  for (const row of timelineResult.results) {
    const entry: TimelineEntry = {
      title: row.title,
      organisation: row.organisation,
      period: row.period,
      description: row.description,
    };
    if (row.kind === "experience") experience.push(entry);
    else if (row.kind === "education") education.push(entry);
  }

  const skillsByGroup = new Map<number, string[]>();
  for (const row of skillsResult.results) {
    const list = skillsByGroup.get(row.group_id) ?? [];
    list.push(row.name);
    skillsByGroup.set(row.group_id, list);
  }

  const skillGroups: SkillGroupItem[] = groupsResult.results
    .map((group) => ({ title: group.title, items: skillsByGroup.get(group.id) ?? [] }))
    .filter((group) => group.items.length > 0);

  return { experience, education, skillGroups };
}