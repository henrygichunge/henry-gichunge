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

export interface ProfileData {
  displayName: string;
  fullName: string;
  tagline: string;
  intro: string;
  biography: string[];
  mission: string;
  portraitUrl: string | null;
}

export interface ContactData {
  email: string;
  phone: string;
  location: string;
}

export interface SocialLinkItem {
  label: string;
  url: string;
}

export interface SiteResponse {
  profile: ProfileData;
  contact: ContactData;
  socials: SocialLinkItem[];
}

export interface TimelineEntry {
  title: string;
  organisation: string;
  period: string;
  description: string;
  placeholder?: boolean;
}

export interface SkillGroupItem {
  title: string;
  items: string[];
}

export interface BackgroundResponse {
  experience: TimelineEntry[];
  education: TimelineEntry[];
  skillGroups: SkillGroupItem[];
}

export interface ArticleSummary {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string | null;
  publishedAt: string | null;
}

export interface ArticleDetail extends ArticleSummary {
  body: string[];
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface ArticlesResponse {
  articles: ArticleSummary[];
}

export interface ArticleResponse {
  article: ArticleDetail;
}