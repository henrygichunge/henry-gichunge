import { request } from "./adminData";
import type { ContentState } from "./adminProjects";

export interface AdminArticleRow {
  id: number;
  slug: string;
  title: string;
  category: string;
  state: ContentState;
  publishedAt: string | null;
  updatedAt: string;
}

export interface AdminArticleInput {
  title: string;
  excerpt: string;
  body: string;
  category: string;
  coverImageUrl: string;
  seoTitle: string;
  seoDescription: string;
}

export interface AdminArticleDetail extends AdminArticleInput {
  id: number;
  slug: string;
  state: ContentState;
  publishedAt: string | null;
}

export function listArticles() {
  return request<{ articles: AdminArticleRow[] }>("/api/admin/articles");
}

export function getArticle(id: number) {
  return request<AdminArticleDetail>(`/api/admin/articles/${id}`);
}

export function createArticle(slug: string, input: AdminArticleInput) {
  return request<{ id: number }>("/api/admin/articles", {
    method: "POST",
    body: JSON.stringify({ slug, ...input }),
  });
}

export function updateArticle(id: number, input: AdminArticleInput) {
  return request<{ saved: boolean }>(`/api/admin/articles/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function setArticleState(id: number, state: ContentState) {
  return request<{ saved: boolean }>(`/api/admin/articles/${id}/state`, {
    method: "PUT",
    body: JSON.stringify({ state }),
  });
}

export function deleteArticle(id: number) {
  return request<{ deleted: boolean }>(`/api/admin/articles/${id}`, { method: "DELETE" });
}