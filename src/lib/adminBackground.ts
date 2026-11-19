import { request } from "./adminData";
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

export interface SkillGroupValues {
  title: string;
  items: string[];
}

export function listTimeline() {
  return request<{ items: TimelineRow[] }>("/api/admin/timeline");
}

export function getTimelineItem(id: number) {
  return request<TimelineDetail>(`/api/admin/timeline/${id}`);
}

export function createTimelineItem(kind: TimelineKind, input: TimelineInput) {
  return request<{ id: number }>("/api/admin/timeline", {
    method: "POST",
    body: JSON.stringify({ kind, ...input }),
  });
}

export function updateTimelineItem(id: number, input: TimelineInput) {
  return request<{ saved: boolean }>(`/api/admin/timeline/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function setTimelineState(id: number, state: ContentState) {
  return request<{ saved: boolean }>(`/api/admin/timeline/${id}/state`, {
    method: "PUT",
    body: JSON.stringify({ state }),
  });
}

export function deleteTimelineItem(id: number) {
  return request<{ deleted: boolean }>(`/api/admin/timeline/${id}`, { method: "DELETE" });
}

export function reorderTimeline(kind: TimelineKind, ids: number[]) {
  return request<{ saved: boolean }>("/api/admin/timeline/order", {
    method: "PUT",
    body: JSON.stringify({ kind, ids }),
  });
}

export function getSkills() {
  return request<{ groups: SkillGroupValues[] }>("/api/admin/skills");
}

export function saveSkills(groups: SkillGroupValues[]) {
  return request<{ saved: boolean }>("/api/admin/skills", {
    method: "PUT",
    body: JSON.stringify({ groups }),
  });
}