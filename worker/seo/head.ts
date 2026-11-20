const START = "<!--seo:start-->";
const END = "<!--seo:end-->";

export interface PageMeta {
  title: string;
  description: string;
  /** The page's own path, such as /about. */
  path: string;
  noindex: boolean;
  type: "website" | "article";
  /** A raw image address (a site path or https address), or null. */
  image: string | null;
  publishedTime: string | null;
  /** Structured data objects, written into the page as JSON-LD. */
  jsonLd: unknown[];
}

export interface SitemapEntry {
  path: string;
  lastmod: string | null;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Makes JSON safe to place inside a script tag: it can never close the tag early. */
function jsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function absoluteUrl(value: string, base: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? `${base}${value}` : value;
}

/** Cloudinary images are cropped to 1200 x 630 JPEG, which every social site accepts. */
function socialImage(url: string): string {
  const marker = "/image/upload/";
  const at = url.indexOf(marker);
  if (!url.startsWith("https://res.cloudinary.com/") || at === -1) return url;

  const head = url.slice(0, at + marker.length);
  const rest = url.slice(at + marker.length).replace(/^f_auto,q_auto\//, "");
  return `${head}c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/${rest}`;
}

/** The full public address of an image for social previews, or null. */
export function resolveImage(raw: string | null, base: string): string | null {
  if (!raw) return null;
  return absoluteUrl(socialImage(raw), base);
}

/** Builds the block of tags that replaces the placeholder in the page's head. */
export function buildHead(meta: PageMeta, base: string): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = escapeHtml(`${base}${meta.path}`);
  const image = resolveImage(meta.image, base);

  const lines: string[] = [
    START,
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="x-seo" content="server" />`,
  ];

  if (meta.noindex) {
    lines.push(`<meta name="robots" content="noindex, nofollow" />`);
  } else {
    lines.push(`<link rel="canonical" href="${url}" />`);
  }

  lines.push(
    `<meta property="og:site_name" content="Henry Gichunge" />`,
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
  );
  if (meta.publishedTime) {
    lines.push(`<meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}" />`);
  }
  if (image) lines.push(`<meta property="og:image" content="${escapeHtml(image)}" />`);

  lines.push(
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
  );
  if (image) lines.push(`<meta name="twitter:image" content="${escapeHtml(image)}" />`);

  if (!meta.noindex) {
    for (const data of meta.jsonLd) {
      lines.push(`<script type="application/ld+json">${jsonForScript(data)}</script>`);
    }
  }

  lines.push(END);
  return lines.join("\n    ");
}

/** Puts the head block into the page. Returns null if the placeholder is missing. */
export function applyHead(shell: string, head: string): string | null {
  const start = shell.indexOf(START);
  const end = shell.indexOf(END);
  if (start === -1 || end === -1 || end < start) return null;
  return shell.slice(0, start) + head + shell.slice(end + END.length);
}

export function buildRobots(base: string, canonicalHost: boolean): string {
  if (!canonicalHost) return "User-agent: *\nDisallow: /\n";
  return ["User-agent: *", "Allow: /", "Disallow: /admin", "Disallow: /api/", "", `Sitemap: ${base}/sitemap.xml`, ""].join("\n");
}

export function buildSitemap(base: string, entries: SitemapEntry[]): string {
  const items = entries.map((entry) => {
    const loc = escapeHtml(`${base}${entry.path}`);
    const lastmod = entry.lastmod ? `<lastmod>${escapeHtml(entry.lastmod.slice(0, 10))}</lastmod>` : "";
    return `  <url><loc>${loc}</loc>${lastmod}</url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join("\n")}\n</urlset>\n`;
}