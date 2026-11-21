import type { Context } from "hono";
import type { AppEnv, Bindings, D1Database } from "../types";
import { emptyPages, getSeoSettings, type SeoPageKey, type SeoSettings } from "../db/seo";
import {
  applyHead,
  buildHead,
  buildRobots,
  buildSitemap,
  resolveImage,
  truncate,
  type PageMeta,
  type SitemapEntry,
} from "./head";
import { contentSecurityPolicy, inlineScriptHashes, securityHeaders } from "./security";

interface SiteFacts {
  displayName: string;
  fullName: string;
  intro: string;
  portrait: string | null;
  socials: string[];
  seo: SeoSettings;
}

interface Resolved {
  status: number;
  meta: PageMeta;
}

const DEFAULT_INTRO =
  "I teach, build software and develop practical digital solutions that make education and everyday business work better.";

const STATIC_PAGES: Record<string, { key: SeoPageKey; title: string; description: string }> = {
  "/": {
    key: "home",
    title: "Henry Gichunge — Ideas. Education. Innovation.",
    description: DEFAULT_INTRO,
  },
  "/about": {
    key: "about",
    title: "About — Henry Gichunge",
    description:
      "About Henry Gichunge: educator, technology creator and entrepreneur building practical digital solutions.",
  },
  "/education": {
    key: "education",
    title: "Education — Henry Gichunge",
    description: "Henry Gichunge's teaching background, educational interests and education technology work.",
  },
  "/projects": {
    key: "projects",
    title: "Projects — Henry Gichunge",
    description: "Projects by Henry Gichunge in education technology and software, with their current status.",
  },
  "/insights": {
    key: "insights",
    title: "Insights — Henry Gichunge",
    description: "Articles and reflections by Henry Gichunge on education, technology and innovation.",
  },
  "/cv": {
    key: "cv",
    title: "CV — Henry Gichunge",
    description: "Curriculum vitae of Henry Mutuma Gichunge.",
  },
  "/contact": {
    key: "contact",
    title: "Contact — Henry Gichunge",
    description: "Contact Henry Gichunge about projects, collaboration or education technology.",
  },
};

/** The address to put in canonical links and the sitemap, and whether this visit uses it. */
function siteBase(env: Bindings | undefined, url: URL): { base: string; canonicalHost: boolean } {
  const configured = (env?.SITE_URL ?? "").trim().replace(/\/+$/, "");
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === "https:") {
        return { base: parsed.origin, canonicalHost: parsed.host === url.host };
      }
    } catch {
      /* an invalid setting is ignored */
    }
  }
  return { base: url.origin, canonicalHost: true };
}

function normalisePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

async function loadFacts(db: D1Database | undefined): Promise<SiteFacts> {
  const facts: SiteFacts = {
    displayName: "Henry Gichunge",
    fullName: "Henry Mutuma Gichunge",
    intro: DEFAULT_INTRO,
    portrait: null,
    socials: [],
    seo: { pages: emptyPages(), shareImageUrl: "" },
  };
  if (!db) return facts;

  try {
    const [profile, socials, seo] = await Promise.all([
      db
        .prepare("SELECT display_name, full_name, intro, portrait_url FROM site_profile WHERE id = 1")
        .first<{ display_name: string; full_name: string; intro: string; portrait_url: string | null }>(),
      db
        .prepare("SELECT url FROM social_links WHERE state = 'published' ORDER BY sort_order, id")
        .all<{ url: string }>(),
      getSeoSettings(db),
    ]);

    if (profile) {
      facts.displayName = profile.display_name;
      facts.fullName = profile.full_name;
      facts.intro = profile.intro || DEFAULT_INTRO;
      facts.portrait = profile.portrait_url;
    }
    facts.socials = socials.results.map((row) => row.url).filter((url) => /^https?:\/\//.test(url));
    facts.seo = seo;
  } catch (error) {
    console.error("SEO facts unavailable, using defaults:", error);
  }
  return facts;
}

function plainMeta(title: string, path: string, noindex: boolean): PageMeta {
  return {
    title,
    description: "",
    path,
    noindex,
    type: "website",
    image: null,
    publishedTime: null,
    jsonLd: [],
  };
}

function notFound(path: string): Resolved {
  return { status: 404, meta: plainMeta("Page not found — Henry Gichunge", path, true) };
}

async function resolvePage(
  path: string,
  db: D1Database | undefined,
  base: string,
  facts: SiteFacts,
): Promise<Resolved> {
  const shareImage = facts.seo.shareImageUrl || facts.portrait;

  const known = STATIC_PAGES[path];
  if (known) {
    const override = facts.seo.pages[known.key];
    const title = override.title || known.title;
    const description = truncate(
      override.description || (known.key === "home" ? facts.intro : known.description),
      200,
    );

    const jsonLd: unknown[] = [];
    if (known.key === "home") {
      const portrait = resolveImage(facts.portrait, base);
      jsonLd.push({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "WebSite", "@id": `${base}/#website`, url: `${base}/`, name: facts.displayName },
          {
            "@type": "Person",
            "@id": `${base}/#person`,
            name: facts.fullName,
            url: `${base}/`,
            description,
            ...(portrait ? { image: portrait } : {}),
            ...(facts.socials.length > 0 ? { sameAs: facts.socials } : {}),
          },
        ],
      });
    }

    return {
      status: 200,
      meta: { title, description, path, noindex: false, type: "website", image: shareImage, publishedTime: null, jsonLd },
    };
  }

  if (path === "/admin" || path.startsWith("/admin/")) {
    return { status: 200, meta: plainMeta("Admin — Henry Gichunge", path, true) };
  }

  const projectMatch = /^\/projects\/([a-z0-9-]{1,60})$/.exec(path);
  if (projectMatch && db) {
    const row = await db
      .prepare("SELECT name, summary, image_url FROM projects WHERE slug = ? AND state = 'published'")
      .bind(projectMatch[1])
      .first<{ name: string; summary: string; image_url: string | null }>();
    if (!row) return notFound(path);

    return {
      status: 200,
      meta: {
        title: `${row.name} — Henry Gichunge`,
        description: truncate(row.summary || facts.intro, 200),
        path,
        noindex: false,
        type: "website",
        image: row.image_url || shareImage,
        publishedTime: null,
        jsonLd: [],
      },
    };
  }

  const articleMatch = /^\/insights\/([a-z0-9-]{1,100})$/.exec(path);
  if (articleMatch && db) {
    const row = await db
      .prepare(
        "SELECT title, excerpt, cover_image_url, seo_title, seo_description, published_at, updated_at FROM articles WHERE slug = ? AND state = 'published'",
      )
      .bind(articleMatch[1])
      .first<{
        title: string;
        excerpt: string;
        cover_image_url: string | null;
        seo_title: string | null;
        seo_description: string | null;
        published_at: string | null;
        updated_at: string;
      }>();
    if (!row) return notFound(path);

    const description = truncate(row.seo_description || row.excerpt || facts.intro, 200);
    const rawImage = row.cover_image_url || shareImage;
    const image = resolveImage(rawImage, base);

    return {
      status: 200,
      meta: {
        title: `${row.seo_title || row.title} — Henry Gichunge`,
        description,
        path,
        noindex: false,
        type: "article",
        image: rawImage,
        publishedTime: row.published_at,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: row.title,
            description,
            ...(row.published_at ? { datePublished: row.published_at } : {}),
            dateModified: row.updated_at,
            mainEntityOfPage: `${base}${path}`,
            author: { "@type": "Person", name: facts.fullName, url: `${base}/` },
            ...(image ? { image: [image] } : {}),
          },
        ],
      },
    };
  }

  return notFound(path);
}

async function sitemapEntries(db: D1Database | undefined): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = Object.keys(STATIC_PAGES).map((path) => ({ path, lastmod: null }));
  if (!db) return entries;

  try {
    const [projects, articles] = await Promise.all([
      db
        .prepare("SELECT slug, updated_at FROM projects WHERE state = 'published' ORDER BY sort_order, id")
        .all<{ slug: string; updated_at: string }>(),
      db
        .prepare("SELECT slug, updated_at FROM articles WHERE state = 'published' ORDER BY published_at DESC, id DESC")
        .all<{ slug: string; updated_at: string }>(),
    ]);
    for (const row of projects.results) {
      entries.push({ path: `/projects/${row.slug}`, lastmod: row.updated_at });
    }
    for (const row of articles.results) {
      entries.push({ path: `/insights/${row.slug}`, lastmod: row.updated_at });
    }
  } catch (error) {
    console.error("Sitemap content unavailable, using pages only:", error);
  }
  return entries;
}

/**
 * Serves every page request: the built website with correct SEO tags and security headers.
 * If anything fails, the page is served exactly as it was built.
 */
export async function servePage(c: Context<AppEnv>): Promise<Response> {
  const assets = c.env?.ASSETS;
  if (!assets) return new Response("Not found", { status: 404 });

  try {
    const url = new URL(c.req.url);
    const path = normalisePath(url.pathname);
    const { base, canonicalHost } = siteBase(c.env, url);
    const db = c.env?.DB;

    if (path === "/robots.txt") {
      return new Response(buildRobots(base, canonicalHost), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    if (path === "/sitemap.xml") {
      if (!canonicalHost) return new Response("Not found", { status: 404 });
      return new Response(buildSitemap(base, await sitemapEntries(db)), {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // Any other file (an image, for example) is served exactly as it is.
    if (/\.[A-Za-z0-9]{1,8}$/.test(path)) return assets.fetch(c.req.raw);

    const shellResponse = await assets.fetch(new Request(new URL("/", url).toString()));
    if (!shellResponse.ok) return assets.fetch(c.req.raw);

    const facts = await loadFacts(db);
    const resolved = await resolvePage(path, db, base, facts);
    if (!canonicalHost) resolved.meta.noindex = true;

    const html = applyHead(await shellResponse.text(), buildHead(resolved.meta, base));
    if (html === null) return assets.fetch(c.req.raw);

    const policy = contentSecurityPolicy(await inlineScriptHashes(html));
    const headers = new Headers({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      ...securityHeaders(c.env?.CSP_MODE, policy),
    });
    if (resolved.meta.noindex) headers.set("X-Robots-Tag", "noindex, nofollow");

    return new Response(html, { status: resolved.status, headers });
  } catch (error) {
    console.error("Page rendering failed, serving the page as built:", error);
    return assets.fetch(c.req.raw);
  }
}