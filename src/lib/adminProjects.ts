import { request } from "./adminData";

export type ProjectStatus = "operational" | "in_development" | "planned" | "status_to_confirm";
export type ContentState = "draft" | "published" | "archived";

export const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "operational", label: "Operational" },
  { value: "in_development", label: "In development" },
  { value: "planned", label: "Planned" },
  { value: "status_to_confirm", label: "Status to confirm" },
];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  operational: "Operational",
  in_development: "In development",
  planned: "Planned",
  status_to_confirm: "Status to confirm",
};

export interface AdminProjectRow {
  id: number;
  slug: string;
  name: string;
  category: string;
  status: ProjectStatus;
  state: ContentState;
  sortOrder: number;
}

export interface AdminProjectLink {
  label: string;
  url: string;
}

export interface AdminProjectInput {
  name: string;
  category: string;
  status: ProjectStatus;
  summary: string;
  overview: string;
  statusNote: string;
  imageUrl: string;
  focusAreas: string[];
  links: AdminProjectLink[];
}

export interface AdminProjectDetail extends AdminProjectInput {
  id: number;
  slug: string;
  state: ContentState;
}

/** Turns a failed request into a message for the admin. */
export function describeFailure(status: number, message: string): string {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 503) return "The admin service is not available here. It works only on the live site.";
  return message;
}

export function listProjects() {
  return request<{ projects: AdminProjectRow[] }>("/api/admin/projects");
}

export function getProject(id: number) {
  return request<AdminProjectDetail>(`/api/admin/projects/${id}`);
}

export function createProject(slug: string, input: AdminProjectInput) {
  return request<{ id: number }>("/api/admin/projects", {
    method: "POST",
    body: JSON.stringify({ slug, ...input }),
  });
}

export function updateProject(id: number, input: AdminProjectInput) {
  return request<{ saved: boolean }>(`/api/admin/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function setProjectState(id: number, state: ContentState) {
  return request<{ saved: boolean }>(`/api/admin/projects/${id}/state`, {
    method: "PUT",
    body: JSON.stringify({ state }),
  });
}

export function deleteProject(id: number) {
  return request<{ deleted: boolean }>(`/api/admin/projects/${id}`, { method: "DELETE" });
}

export function reorderProjects(ids: number[]) {
  return request<{ saved: boolean }>("/api/admin/projects/order", {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });
}