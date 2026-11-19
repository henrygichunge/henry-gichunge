import type { D1Database } from "../types";
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

export interface ArticleInput {
  title: string;
  excerpt: string;
  body: string;
  category: string;
  coverImageUrl: string;
  seoTitle: string;
  seoDescription: string;
}

export interface AdminArticleDetail extends ArticleInput {
  id: number;
  slug: string;
  state: ContentState;
  publishedAt: string | null;
}

interface ListRow {
  id: number;
  slug: string;
  title: string;
  category: string;
  state: string;
  published_at: string | null;
  updated_at: string;
}

interface DetailRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  cover_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  state: string;
  published_at: string | null;
}

export async function listAdminArticles(db: D1Database): Promise<AdminArticleRow[]> {
  const result = await db
    .prepare(
      "SELECT id, slug, title, category, state, published_at, updated_at FROM articles ORDER BY updated_at DESC, id DESC",
    )
    .all<ListRow>();

  return result.results.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    state: row.state as ContentState,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  }));
}

export async function countArticles(db: D1Database): Promise<number> {
  const row = await db.prepare("SELECT COUNT(*) AS count FROM articles").first<{ count: number }>();
  return row?.count ?? 0;
}

export async function getAdminArticle(db: D1Database, id: number): Promise<AdminArticleDetail | null> {
  const row = await db
    .prepare(
      "SELECT id, slug, title, excerpt, body, category, cover_image_url, seo_title, seo_description, state, published_at FROM articles WHERE id = ?",
    )
    .bind(id)
    .first<DetailRow>();

  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    category: row.category,
    coverImageUrl: row.cover_image_url ?? "",
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    state: row.state as ContentState,
    publishedAt: row.published_at,
  };
}

export async function getArticleBasics(
  db: D1Database,
  id: number,
): Promise<{ slug: string; state: ContentState; bodyLength: number } | null> {
  const row = await db
    .prepare("SELECT slug, state, length(body) AS body_length FROM articles WHERE id = ?")
    .bind(id)
    .first<{ slug: string; state: string; body_length: number }>();
  return row ? { slug: row.slug, state: row.state as ContentState, bodyLength: row.body_length } : null;
}

export async function getArticleIdBySlug(db: D1Database, slug: string): Promise<number | null> {
  const row = await db.prepare("SELECT id FROM articles WHERE slug = ?").bind(slug).first<{ id: number }>();
  return row ? row.id : null;
}

/** New articles always start as drafts. */
export async function createArticle(db: D1Database, slug: string, input: ArticleInput): Promise<void> {
  await db
    .prepare(
      "INSERT INTO articles (slug, title, excerpt, body, category, cover_image_url, seo_title, seo_description, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')",
    )
    .bind(
      slug,
      input.title,
      input.excerpt,
      input.body,
      input.category,
      input.coverImageUrl || null,
      input.seoTitle || null,
      input.seoDescription || null,
    )
    .run();
}

export async function updateArticle(db: D1Database, id: number, input: ArticleInput): Promise<void> {
  await db
    .prepare(
      "UPDATE articles SET title = ?, excerpt = ?, body = ?, category = ?, cover_image_url = ?, seo_title = ?, seo_description = ?, updated_at = ? WHERE id = ?",
    )
    .bind(
      input.title,
      input.excerpt,
      input.body,
      input.category,
      input.coverImageUrl || null,
      input.seoTitle || null,
      input.seoDescription || null,
      new Date().toISOString(),
      id,
    )
    .run();
}

/** Publishing for the first time sets the publish date. Later changes keep it. */
export async function setArticleState(db: D1Database, id: number, state: ContentState): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare(
      "UPDATE articles SET state = ?, published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN ? ELSE published_at END, updated_at = ? WHERE id = ?",
    )
    .bind(state, state, now, now, id)
    .run();
}

/** Deletes an article only if it is archived: the check is part of the SQL itself. */
export async function deleteArchivedArticle(db: D1Database, id: number): Promise<void> {
  await db.prepare("DELETE FROM articles WHERE id = ? AND state = 'archived'").bind(id).run();
}