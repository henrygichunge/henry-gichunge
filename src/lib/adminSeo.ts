import { request } from "./adminData";

export const SEO_PAGES = ["home", "about", "education", "projects", "insights", "cv", "contact"] as const;
export type SeoPageKey = (typeof SEO_PAGES)[number];

export interface PageSeo {
  title: string;
  description: string;
}

export interface SeoSettings {
  pages: Record<SeoPageKey, PageSeo>;
  shareImageUrl: string;
}

export function getSeo() {
  return request<SeoSettings>("/api/admin/seo");
}

export function saveSeo(settings: SeoSettings) {
  return request<{ saved: boolean }>("/api/admin/seo", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}