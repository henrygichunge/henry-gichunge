import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getDb } from "../db/client";
import {
  countArticles,
  createArticle,
  deleteArchivedArticle,
  getAdminArticle,
  getArticleBasics,
  getArticleIdBySlug,
  listAdminArticles,
  setArticleState,
  updateArticle,
  type ArticleInput,
} from "../db/adminArticles";
import type { ContentState } from "../db/adminProjects";
import { badRequest, cleanText, optionalWebAddress, readJsonBody } from "../lib/validate";
import type { AppEnv } from "../types";

/** Mounted below the admin guard (see routes/admin.ts): every route here requires a signed-in admin. */
const adminArticles = new Hono<AppEnv>();

const STATE_VALUES: readonly string[] = ["draft", "published", "archived"];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ARTICLES = 500;
const MAX_BODY_REQUEST = 80_000;

function parseId(raw: string): number {
  if (!/^\d{1,9}$/.test(raw)) throw new HTTPException(404, { message: "Article not found." });
  return Number(raw);
}

function pickState(value: unknown): ContentState {
  if (typeof value === "string" && STATE_VALUES.includes(value)) return value as ContentState;
  throw badRequest("Choose a valid visibility.");
}

function parseInput(body: Record<string, unknown>): ArticleInput {
  return {
    title: cleanText(body.title, { label: "Title", max: 150, required: true }),
    excerpt: cleanText(body.excerpt, { label: "Excerpt", max: 300, multiline: true }),
    body: cleanText(body.body, { label: "Article text", max: 30_000, multiline: true }),
    category: cleanText(body.category, { label: "Category", max: 40 }),
    coverImageUrl: optionalWebAddress(body.coverImageUrl, "Cover image address", true),
    seoTitle: cleanText(body.seoTitle, { label: "SEO title", max: 70 }),
    seoDescription: cleanText(body.seoDescription, { label: "SEO description", max: 160 }),
  };
}

adminArticles.get("/articles", async (c) => {
  return c.json({ articles: await listAdminArticles(getDb(c)) });
});

adminArticles.post("/articles", async (c) => {
  const db = getDb(c);
  const body = await readJsonBody(c.req.raw, MAX_BODY_REQUEST);

  const slug = cleanText(body.slug, { label: "Slug", max: 100, required: true });
  if (!SLUG_PATTERN.test(slug)) {
    throw badRequest("Slug may contain only lowercase letters, numbers and single dashes.");
  }
  const input = parseInput(body);

  if ((await countArticles(db)) >= MAX_ARTICLES) {
    throw badRequest(`You can have at most ${MAX_ARTICLES} articles.`);
  }
  if ((await getArticleIdBySlug(db, slug)) !== null) {
    throw new HTTPException(409, { message: "An article with that slug already exists." });
  }

  await createArticle(db, slug, input);
  const id = await getArticleIdBySlug(db, slug);
  return c.json({ id }, 201);
});

adminArticles.get("/articles/:id", async (c) => {
  const article = await getAdminArticle(getDb(c), parseId(c.req.param("id")));
  if (!article) throw new HTTPException(404, { message: "Article not found." });
  return c.json(article);
});

adminArticles.put("/articles/:id", async (c) => {
  const db = getDb(c);
  const id = parseId(c.req.param("id"));
  if (!(await getArticleBasics(db, id))) {
    throw new HTTPException(404, { message: "Article not found." });
  }

  const input = parseInput(await readJsonBody(c.req.raw, MAX_BODY_REQUEST));
  await updateArticle(db, id, input);
  return c.json({ saved: true });
});

adminArticles.put("/articles/:id/state", async (c) => {
  const db = getDb(c);
  const id = parseId(c.req.param("id"));
  const basics = await getArticleBasics(db, id);
  if (!basics) throw new HTTPException(404, { message: "Article not found." });

  const body = await readJsonBody(c.req.raw);
  const state = pickState(body.state);
  if (state === "published" && basics.bodyLength === 0) {
    throw badRequest("Add the article text before publishing.");
  }

  await setArticleState(db, id, state);
  return c.json({ saved: true });
});

adminArticles.delete("/articles/:id", async (c) => {
  const db = getDb(c);
  const id = parseId(c.req.param("id"));
  const basics = await getArticleBasics(db, id);
  if (!basics) throw new HTTPException(404, { message: "Article not found." });
  if (basics.state !== "archived") {
    throw new HTTPException(409, {
      message: "Only archived articles can be deleted. Archive it first.",
    });
  }

  await deleteArchivedArticle(db, id);
  return c.json({ deleted: true });
});

export default adminArticles;