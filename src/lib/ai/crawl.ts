import "server-only";

/**
 * Site crawler for the intake analysis.
 *
 * - Fetches the source page, discovers same-site links, and reads the pages most likely
 *   to hold business facts (about, team, services, reviews, contact, locations).
 * - Extracts title, meta description, Open Graph tags and JSON-LD before stripping HTML.
 * - Social and directory profiles are fetched for metadata only (their bodies are JS shells,
 *   login walls, or blocked), and Google Maps links are not fetched at all.
 */

export interface DiscoveredLink {
  platform: string;
  url: string;
}

export interface PageMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  canonical: string;
  jsonLd: string[];
}

export type PageStatus = "ok" | "meta-only" | "empty" | "failed" | "skipped";

export interface CrawledPage {
  /** e.g. "Website /about-us/" or "Instagram" */
  label: string;
  url: string;
  status: PageStatus;
  /** Short human note for the admin, e.g. "HTTP 403" or "requires a browser". */
  note: string;
  meta: PageMeta | null;
  text: string;
}

export interface CrawlResult {
  pages: CrawledPage[];
  discoveredLinks: DiscoveredLink[];
}

// ============================================================================
// URL SECURITY
// ============================================================================

export function validateUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Blocked protocol: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname.toLowerCase();
  const blocked = [
    "localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1",
    "metadata.google.internal", "169.254.169.254",
  ];
  if (blocked.includes(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new Error(`Blocked host: ${hostname}`);
  }

  const ipMatch = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipMatch) {
    const [, a, b] = ipMatch.map(Number);
    if (
      a === 10 || a === 127 || a === 0 || a === 169 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      throw new Error(`Blocked private IP: ${hostname}`);
    }
  }
  return parsed;
}

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

export const SOCIAL_DOMAINS: Record<string, string> = {
  "facebook.com": "Facebook",
  "instagram.com": "Instagram",
  "linkedin.com": "LinkedIn",
  "twitter.com": "Twitter",
  "x.com": "Twitter",
  "youtube.com": "YouTube",
  "tiktok.com": "TikTok",
  "yelp.com": "Yelp",
  "nextdoor.com": "Nextdoor",
  "bbb.org": "BBB",
  "homeadvisor.com": "HomeAdvisor",
  "houzz.com": "Houzz",
  "thumbtack.com": "Thumbtack",
  "angieslist.com": "Angie's List",
  "angi.com": "Angi",
  "google.com": "Google Business",
  "healthgrades.com": "Healthgrades",
  "zocdoc.com": "Zocdoc",
  "tripadvisor.com": "TripAdvisor",
};

/** Hosts whose page bodies are useless to a plain fetch; read their meta tags only. */
const META_ONLY_HOSTS = new Set([
  "facebook.com", "instagram.com", "linkedin.com", "twitter.com", "x.com",
  "tiktok.com", "youtube.com", "yelp.com", "nextdoor.com", "thumbtack.com",
]);

/** Hosts that return nothing useful without a browser; never fetched. */
const SKIP_HOSTS = new Set(["google.com", "maps.google.com", "goo.gl", "maps.app.goo.gl"]);

export function platformFor(hostname: string): string | null {
  const host = hostname.replace(/^www\./, "").toLowerCase();
  for (const [domain, name] of Object.entries(SOCIAL_DOMAINS)) {
    if (host === domain || host.endsWith(`.${domain}`)) return name;
  }
  return null;
}

function bareHost(hostname: string): string {
  return hostname.replace(/^www\./, "").toLowerCase();
}

function matchesHostSet(hostname: string, set: Set<string>): boolean {
  const host = bareHost(hostname);
  for (const d of set) {
    if (host === d || host.endsWith(`.${d}`)) return true;
  }
  return false;
}

// ============================================================================
// FETCH
// ============================================================================

const USER_AGENT = "Mozilla/5.0 (compatible; L3adBot/1.0; +https://l3adsolutions.com)";

async function fetchHtml(
  url: string,
  timeoutMs = 12_000
): Promise<{ ok: true; html: string; finalUrl: string } | { ok: false; note: string }> {
  try {
    validateUrl(url);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timer);

    if (!res.ok) return { ok: false, note: `HTTP ${res.status}` };
    const type = res.headers.get("content-type") || "";
    if (!type.includes("html") && !type.includes("xml") && type !== "") {
      return { ok: false, note: `not HTML (${type.split(";")[0]})` };
    }
    const html = await res.text();
    return { ok: true, html, finalUrl: res.url || url };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown error";
    return { ok: false, note: msg.includes("abort") ? "timed out" : msg };
  }
}

// ============================================================================
// HTML PARSING
// ============================================================================

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  ndash: "-", mdash: ", ", hellip: "...", copy: "(c)", reg: "(R)", trade: "(TM)",
  lsquo: "'", rsquo: "'", ldquo: '"', rdquo: '"',
};

export function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

function attr(tag: string, name: string): string {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return decodeEntities((m?.[2] ?? m?.[3] ?? "").trim());
}

export function extractMeta(html: string): PageMeta {
  const head = html.slice(0, 200_000);
  const meta: PageMeta = { title: "", description: "", ogTitle: "", ogDescription: "", canonical: "", jsonLd: [] };

  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) meta.title = decodeEntities(title[1]).replace(/\s+/g, " ").trim();

  const metaTags = head.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of metaTags) {
    const name = (attr(tag, "name") || attr(tag, "property")).toLowerCase();
    const content = attr(tag, "content");
    if (!content) continue;
    if (name === "description" && !meta.description) meta.description = content;
    if (name === "og:title" && !meta.ogTitle) meta.ogTitle = content;
    if (name === "og:description" && !meta.ogDescription) meta.ogDescription = content;
  }

  const canonical = head.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i);
  if (canonical) meta.canonical = attr(canonical[0], "href");

  const ldRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = ldRegex.exec(html)) !== null && meta.jsonLd.length < 3) {
    const body = m[1].replace(/\s+/g, " ").trim();
    if (body.length > 20) meta.jsonLd.push(body.slice(0, 2500));
  }

  return meta;
}

/** Strip HTML to readable text with line breaks at block boundaries. */
export function htmlToText(html: string, opts: { keepChrome: boolean; maxChars: number }): string {
  let s = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|iframe|canvas|select)\b[\s\S]*?<\/\1>/gi, " ");

  if (!opts.keepChrome) {
    s = s.replace(/<(header|nav|footer)\b[\s\S]*?<\/\1>/gi, " ");
  }

  s = s
    .replace(/<\/(p|div|section|article|li|tr|h[1-6]|blockquote|figcaption|dd|dt)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<h([1-6])[^>]*>/gi, "\n## ")
    .replace(/<[^>]+>/g, " ");

  s = decodeEntities(s)
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

  // Drop lines that are just navigation crumbs or icon names
  const lines = s
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(line);
  }

  return deduped.join("\n").slice(0, opts.maxChars);
}

// ============================================================================
// LINK DISCOVERY
// ============================================================================

const SKIP_EXT = /\.(jpe?g|png|gif|webp|svg|ico|pdf|docx?|xlsx?|zip|mp4|mp3|css|js|xml|json|txt)$/i;
const SKIP_PATH = /\/(wp-json|wp-admin|wp-content|wp-includes|feed|tag|category|author|page|cart|checkout|my-account|login|register|search|cdn-cgi|xmlrpc)(\/|$)/i;

/** Recognized third-party profile links found on a page. */
export function extractProfileLinks(html: string, sourceUrl: string): DiscoveredLink[] {
  const source = new URL(sourceUrl);
  const seen = new Set<string>();
  const results: DiscoveredLink[] = [];

  const hrefs = html.match(/href\s*=\s*["'][^"']+["']/gi) || [];
  for (const raw of hrefs) {
    const href = decodeEntities(raw.replace(/^href\s*=\s*["']/i, "").replace(/["']$/, ""));
    let parsed: URL;
    try {
      parsed = new URL(href, source.origin);
    } catch {
      continue;
    }
    if (!["http:", "https:"].includes(parsed.protocol)) continue;
    if (bareHost(parsed.hostname) === bareHost(source.hostname)) continue;

    const platform = platformFor(parsed.hostname);
    if (!platform) continue;

    // Ignore generic share/intent links and Google links that aren't a business profile
    const path = parsed.pathname.toLowerCase();
    if (/\/(sharer|share|intent|dialog|plugins|embed|writeareview)\b/.test(path)) continue;
    if (platform === "Google Business" && !/maps/.test(parsed.hostname + path) && !/cid=|place/.test(parsed.href)) continue;

    const normalized = parsed.href.replace(/\/$/, "");
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    results.push({ platform, url: parsed.href });
  }

  // Also read JSON-LD sameAs links
  const same = html.match(/"sameAs"\s*:\s*\[([^\]]*)\]/i);
  if (same) {
    for (const u of same[1].match(/https?:\/\/[^"'\s]+/g) || []) {
      try {
        const parsed = new URL(u);
        const platform = platformFor(parsed.hostname);
        const normalized = parsed.href.replace(/\/$/, "");
        if (platform && !seen.has(normalized)) {
          seen.add(normalized);
          results.push({ platform, url: parsed.href });
        }
      } catch {
        /* ignore */
      }
    }
  }

  return results;
}

interface InternalLink {
  url: string;
  path: string;
  count: number;
}

function extractInternalLinks(html: string, sourceUrl: string): InternalLink[] {
  const source = new URL(sourceUrl);
  const counts = new Map<string, InternalLink>();

  const hrefs = html.match(/href\s*=\s*["'][^"']+["']/gi) || [];
  for (const raw of hrefs) {
    const href = decodeEntities(raw.replace(/^href\s*=\s*["']/i, "").replace(/["']$/, ""));
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    let parsed: URL;
    try {
      parsed = new URL(href, source.href);
    } catch {
      continue;
    }
    if (!["http:", "https:"].includes(parsed.protocol)) continue;
    if (bareHost(parsed.hostname) !== bareHost(source.hostname)) continue;

    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    if (path === "/" || SKIP_EXT.test(path) || SKIP_PATH.test(path)) continue;
    if (path.split("/").length > 5) continue;

    const url = `${source.protocol}//${source.host}${path}/`;
    const existing = counts.get(path);
    if (existing) existing.count++;
    else counts.set(path, { url, path, count: 1 });
  }

  return Array.from(counts.values());
}

const PATH_SCORES: [RegExp, number][] = [
  [/about|our-story|story|history|who-we-are|why-us|mission/, 10],
  [/review|testimonial|feedback|what-.*-say/, 10],
  [/team|staff|doctor|dr-|meet|provider|crew|owner|founder/, 9],
  [/service|treatment|what-we-do|product|care|repair|install|menu|program|offer|specialt/, 8],
  [/contact|location|hours|direction|visit|office/, 8],
  [/faq|question/, 6],
  [/pricing|price|rate|cost|financing|insurance|payment/, 6],
  [/gallery|portfolio|our-work|project|before-after|photo/, 5],
  [/blog|news|article/, 2],
];

/** Choose which internal pages to read, preferring pages that carry business facts. */
export function pickPriorityPages(links: InternalLink[], max: number): InternalLink[] {
  const scored = links.map((l) => {
    const path = l.path.toLowerCase();
    let score = 3; // any linked page has some value
    for (const [re, s] of PATH_SCORES) {
      if (re.test(path)) {
        score = Math.max(score, s);
        break;
      }
    }
    // Deep blog posts are low value; hub pages beat leaf pages slightly
    const depth = path.split("/").filter(Boolean).length;
    if (/^\/\d{4}\//.test(path)) score = 1;
    return { link: l, score: score * 10 + Math.min(l.count, 6) - depth };
  });

  scored.sort((a, b) => b.score - a.score);

  const picked: InternalLink[] = [];
  const perSection = new Map<string, number>();
  let blogTaken = 0;
  for (const { link } of scored) {
    if (picked.length >= max) break;
    const section = link.path.split("/").filter(Boolean)[0] || "";
    const n = perSection.get(section) || 0;
    if (n >= 6) continue; // keep breadth across sections
    if (/blog|news|article|^\/\d{4}\//.test(link.path) && blogTaken >= 1) continue;
    if (/blog|news|article|^\/\d{4}\//.test(link.path)) blogTaken++;
    perSection.set(section, n + 1);
    picked.push(link);
  }
  return picked;
}

// ============================================================================
// PAGE BUILDERS
// ============================================================================

const HOME_CHARS = 7_000;
const PAGE_CHARS = 5_000;
const PROFILE_CHARS = 3_000;

function pageFromHtml(label: string, url: string, html: string, opts: { keepChrome: boolean; maxChars: number }): CrawledPage {
  const meta = extractMeta(html);
  const text = htmlToText(html, opts);
  const hasText = text.length > 80;
  const hasMeta = !!(meta.title || meta.description || meta.ogDescription);
  return {
    label,
    url,
    status: hasText ? "ok" : hasMeta ? "meta-only" : "empty",
    note: hasText ? "" : hasMeta ? "metadata only" : "no readable text",
    meta,
    text: hasText ? text : "",
  };
}

async function fetchSitePage(label: string, url: string, opts: { keepChrome: boolean; maxChars: number }): Promise<{ page: CrawledPage; html: string }> {
  const res = await fetchHtml(url);
  if (!res.ok) {
    return { page: { label, url, status: "failed", note: res.note, meta: null, text: "" }, html: "" };
  }
  return { page: pageFromHtml(label, res.finalUrl, res.html, opts), html: res.html };
}

/** Fetch a third-party profile: metadata only for social/directory hosts, text for the rest. */
export async function fetchProfilePage(link: DiscoveredLink): Promise<CrawledPage> {
  let hostname = "";
  try {
    hostname = new URL(link.url).hostname;
  } catch {
    return { label: link.platform, url: link.url, status: "failed", note: "invalid URL", meta: null, text: "" };
  }

  if (matchesHostSet(hostname, SKIP_HOSTS)) {
    return { label: link.platform, url: link.url, status: "skipped", note: "requires a browser; covered by web research", meta: null, text: "" };
  }

  const res = await fetchHtml(link.url);
  if (!res.ok) {
    return { label: link.platform, url: link.url, status: "failed", note: res.note, meta: null, text: "" };
  }

  if (matchesHostSet(hostname, META_ONLY_HOSTS)) {
    const meta = extractMeta(res.html);
    const hasMeta = !!(meta.description || meta.ogDescription || meta.title);
    return {
      label: link.platform,
      url: res.finalUrl,
      status: hasMeta ? "meta-only" : "empty",
      note: hasMeta ? "profile metadata only" : "no readable metadata",
      meta,
      text: "",
    };
  }

  return pageFromHtml(link.platform, res.finalUrl, res.html, { keepChrome: false, maxChars: PROFILE_CHARS });
}

// ============================================================================
// SITE CRAWL
// ============================================================================

export async function crawlSite(sourceUrl: string, opts: { maxPages?: number; maxProfiles?: number } = {}): Promise<CrawlResult> {
  const maxPages = opts.maxPages ?? 12;
  const maxProfiles = opts.maxProfiles ?? 6;

  const home = await fetchSitePage("Website (home)", sourceUrl, { keepChrome: true, maxChars: HOME_CHARS });
  if (!home.html) {
    return { pages: [home.page], discoveredLinks: [] };
  }

  const discoveredLinks = extractProfileLinks(home.html, home.page.url);
  const internal = pickPriorityPages(extractInternalLinks(home.html, home.page.url), maxPages);

  const [sitePages, profilePages] = await Promise.all([
    Promise.all(
      internal.map((l) => fetchSitePage(`Website ${l.path}/`, l.url, { keepChrome: false, maxChars: PAGE_CHARS }))
    ),
    Promise.all(discoveredLinks.slice(0, maxProfiles).map((l) => fetchProfilePage(l))),
  ]);

  // Profile links discovered on inner pages (e.g. a contact page) are worth keeping too
  const seen = new Set(discoveredLinks.map((l) => l.url.replace(/\/$/, "")));
  for (const sp of sitePages) {
    for (const link of extractProfileLinks(sp.html, sp.page.url)) {
      const key = link.url.replace(/\/$/, "");
      if (!seen.has(key)) {
        seen.add(key);
        discoveredLinks.push(link);
      }
    }
  }

  return {
    pages: [home.page, ...sitePages.map((p) => p.page), ...profilePages],
    discoveredLinks,
  };
}

/** Fetch an explicit list of URLs (legacy flow with manually entered links). */
export async function fetchLinkedPages(links: DiscoveredLink[]): Promise<CrawlResult> {
  const pages = await Promise.all(
    links.map(async (link) => {
      const platform = platformFor(new URL(link.url).hostname);
      if (platform) return fetchProfilePage({ platform, url: link.url });
      const { page } = await fetchSitePage(link.platform || "Website", link.url, { keepChrome: true, maxChars: HOME_CHARS });
      return page;
    })
  );
  return { pages, discoveredLinks: [] };
}

// ============================================================================
// RENDERING FOR PROMPTS
// ============================================================================

export function pageHasContent(p: CrawledPage): boolean {
  return p.status === "ok" || p.status === "meta-only";
}

/** Full context for extraction: everything we read, page by page. */
export function renderPagesContext(pages: CrawledPage[]): string {
  return pages
    .map((p) => {
      const head = `--- ${p.label} (${p.url}) [${p.status}${p.note ? `: ${p.note}` : ""}] ---`;
      if (!pageHasContent(p)) return head;
      const parts: string[] = [head];
      if (p.meta?.title) parts.push(`TITLE: ${p.meta.title}`);
      if (p.meta?.description) parts.push(`META DESCRIPTION: ${p.meta.description}`);
      if (p.meta?.ogDescription && p.meta.ogDescription !== p.meta.description) parts.push(`OG DESCRIPTION: ${p.meta.ogDescription}`);
      for (const ld of p.meta?.jsonLd || []) parts.push(`JSON-LD: ${ld}`);
      if (p.text) parts.push(`TEXT:\n${p.text}`);
      return parts.join("\n");
    })
    .join("\n\n");
}

/** Shorter preview for the planning step. */
export function renderPagesSummary(pages: CrawledPage[], charsPerPage = 1500): string {
  return pages
    .filter(pageHasContent)
    .map((p) => {
      const bits: string[] = [`--- ${p.label} ---`];
      if (p.meta?.title) bits.push(`TITLE: ${p.meta.title}`);
      if (p.meta?.description) bits.push(`META: ${p.meta.description}`);
      if (p.text) bits.push(p.text.slice(0, charsPerPage));
      return bits.join("\n");
    })
    .join("\n\n");
}

export function sourcesSummary(pages: CrawledPage[]): { label: string; url: string; status: PageStatus; note: string }[] {
  return pages.map((p) => ({ label: p.label, url: p.url, status: p.status, note: p.note }));
}
