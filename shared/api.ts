/** Types shared by the Worker API and the website. Types only: no runtime code. */

export type ProjectStatusLabel =
  | "Operational"
  | "In development"
  | "Planned"
  | "Status to confirm";

export interface ProjectLinkItem {
  label: string;
  url: string;
}

export interface ProjectItem {
  slug: string;
  name: string;
  category: string;
  status: ProjectStatusLabel;
  summary: string;
  image: string | null;
  overview: string;
  statusNote: string;
  focusAreas: string[];
  links: ProjectLinkItem[];
}

export interface ProjectsResponse {
  projects: ProjectItem[];
}