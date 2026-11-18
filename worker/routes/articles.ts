import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getDb } from "../db/client";
import { getPublishedArticle, listPublishedArticles } from "../db/articles";
import type { ArticleResponse, ArticlesResponse } from "../../shared/api";
import type { AppEnv } from "../types";

const articles = new Hono<AppEnv>();

const SLUG_PATTERN = /^[a-z0-9-]{1,100}$/;

articles.get("/", async (c) => {
  const body: ArticlesResponse = { articles: await listPublishedArticles(getDb(c)) };
  c.header("Cache-Control", "public, max-age=60");
  return c.json(body);
});

articles.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  if (!SLUG_PATTERN.test(slug)) {
    throw new HTTPException(404, { message: "Article not found." });
  }

  const article = await getPublishedArticle(getDb(c), slug);
  if (!article) {
    throw new HTTPException(404, { message: "Article not found." });
  }

  const body: ArticleResponse = { article };
  c.header("Cache-Control", "public, max-age=60");
  return c.json(body);
});

export default articles;