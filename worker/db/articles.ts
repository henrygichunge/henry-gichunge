import type { D1Database } from "../types";
import type { ArticleDetail, ArticleSummary } from "../../shared/api";
import { safeUrl } from "../lib/url";
import { paragraphs } from "../lib/text";

interface ArticleRow {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover_image_url: string | null;
  published_at: string | null;
}

interface ArticleDetailRow extends ArticleRow {
  body: string;
  seo_title: string | null;
  seo_description: string | null;
}

function toSummary(row: ArticleRow): ArticleSummary {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    coverImage: safeUrl(row.cover_image_url, true),
    publishedAt: row.published_at,
  };
}

export async function listPublishedArticles(db: D1Database): Promise<ArticleSummary[]> {
  const result = await db
    .prepare(
      "SELECT slug, title, excerpt, category, cover_image_url, published_at FROM articles WHERE state = 'published' ORDER BY published_at DESC, id DESC",
    )
    .all<ArticleRow>();
  return result.results.map(toSummary);
}

export async function getPublishedArticle(
  db: D1Database,
  slug: string,
): Promise<ArticleDetail | null> {
  const row = await db
    .prepare(
      "SELECT slug, title, excerpt, body, category, cover_image_url, seo_title, seo_description, published_at FROM articles WHERE slug = ? AND state = 'published'",
    )
    .bind(slug)
    .first<ArticleDetailRow>();

  if (!row) return null;

  return {
    ...toSummary(row),
    body: paragraphs(row.body),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}