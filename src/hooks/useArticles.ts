import { useApiResource } from "../lib/useApiResource";
import type { ArticleResponse, ArticlesResponse } from "../../shared/api";

/** `unavailable` is set only when the API could not be reached (for example on a phone). */
export type ArticlesState = ArticlesResponse & { unavailable?: boolean };

export function useArticles() {
  return useApiResource<ArticlesState>("/api/articles", () => ({
    articles: [],
    unavailable: true,
  }));
}

/** `data` is null when the article does not exist or the API is unreachable. */
export function useArticle(slug: string) {
  return useApiResource<ArticleResponse | null>(
    `/api/articles/${encodeURIComponent(slug)}`,
    () => null,
  );
}