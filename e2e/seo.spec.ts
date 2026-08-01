import { test, expect, type Page } from "@playwright/test";
import {
  ALLOWED_TYPES,
  FORBIDDEN_TYPES,
} from "../src/lib/site/structured-data";

/** Every route that is meant to be indexed. Must match sitemap.ts. */
const INDEXABLE = [
  "/",
  "/waitlist",
  "/how-it-works",
  "/travellers",
  "/operators",
  "/safety",
  "/experiences",
  "/destinations",
  "/destinations/havelock",
  "/destinations/neil-island",
  "/destinations/port-blair",
];

/** Collect every `@type` present in a page's JSON-LD, at any nesting depth. */
async function jsonLdTypes(page: Page): Promise<string[]> {
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();

  const types: string[] = [];
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node && typeof node === "object") {
      const record = node as Record<string, unknown>;
      if (typeof record["@type"] === "string") types.push(record["@type"]);
      Object.values(record).forEach(walk);
    }
  };
  for (const block of blocks) walk(JSON.parse(block));
  return types;
}

test.describe("metadata", () => {
  for (const path of INDEXABLE) {
    test(`${path} has a non-localhost self-canonical and its own OG image`, async ({
      page,
      baseURL,
    }) => {
      await page.goto(path);

      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(canonical, `${path} has no canonical`).toBeTruthy();

      // The staging bug this guards against: SITE_URL falling back to
      // localhost when no explicit origin is configured, which silently
      // publishes localhost canonicals and OG image URLs.
      const origin = new URL(baseURL ?? "http://localhost:3000").origin;
      if (origin !== "http://localhost:3000") {
        expect(
          canonical,
          `${path} canonical points at localhost`,
        ).not.toContain("localhost");
      }
      expect(new URL(canonical!).pathname).toBe(path);

      const ogImage = await page
        .locator('meta[property="og:image"]')
        .first()
        .getAttribute("content");
      expect(ogImage, `${path} has no og:image`).toBeTruthy();
    });
  }

  test("every indexable route has a unique title and description", async ({
    page,
  }) => {
    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();

    for (const path of INDEXABLE) {
      await page.goto(path);
      const title = await page.title();
      const description = await page
        .locator('meta[name="description"]')
        .first()
        .getAttribute("content");

      expect(title, `${path} has no title`).toBeTruthy();
      expect(description, `${path} has no description`).toBeTruthy();

      for (const [other, value] of titles) {
        expect(title, `${path} shares a title with ${other}`).not.toBe(value);
      }
      for (const [other, value] of descriptions) {
        expect(
          description,
          `${path} shares a description with ${other}`,
        ).not.toBe(value);
      }
      titles.set(path, title);
      descriptions.set(path, description!);
    }
  });
});

test.describe("structured data", () => {
  test("the homepage declares Organization and WebSite", async ({ page }) => {
    await page.goto("/");
    const types = await jsonLdTypes(page);
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
  });

  test("nested routes declare a BreadcrumbList", async ({ page }) => {
    await page.goto("/destinations/havelock");
    const types = await jsonLdTypes(page);
    expect(types).toContain("BreadcrumbList");
  });

  /*
    The actual enforcement mechanism.

    Structured data is invisible on the page, which makes it the easiest place
    for a truthfulness violation to be reintroduced by well-meaning "SEO
    polish". This fails loudly the moment anyone adds a rating widget.
  */
  test("no route declares a forbidden type", async ({ page }) => {
    const allowed = new Set<string>([...ALLOWED_TYPES, "ListItem"]);

    for (const path of INDEXABLE) {
      await page.goto(path);
      const types = await jsonLdTypes(page);

      for (const type of types) {
        expect(
          FORBIDDEN_TYPES as readonly string[],
          `${path} declares forbidden @type "${type}"`,
        ).not.toContain(type);
        expect(
          allowed.has(type),
          `${path} declares unapproved @type "${type}" — add it to ALLOWED_TYPES deliberately or remove it`,
        ).toBe(true);
      }
    }
  });
});

test.describe("sitemap and robots", () => {
  test("the sitemap lists every indexable route and nothing that 404s or 410s", async ({
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => new URL(match[1]).pathname,
    );

    expect(paths.sort()).toEqual([...INDEXABLE].sort());

    // A URL in a sitemap is a promise to a crawler. Every one must resolve.
    for (const path of paths) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
  });

  test("the sitemap excludes campaign, retired and noindexed routes", async ({
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const excluded of [
      "/go/",
      "/journal",
      "/philosophy",
      "/privacy",
      "/terms",
    ]) {
      expect(xml, `sitemap must not list ${excluded}`).not.toContain(
        `${excluded}<`,
      );
    }
    expect(xml).not.toContain("/go/");
  });

  test("robots disallows only the campaign routes", async ({ request }) => {
    const txt = await (await request.get("/robots.txt")).text();
    // Non-production disallows everything; that is correct and not under test.
    if (txt.includes("Disallow: /\n") && !txt.includes("Sitemap:")) return;

    expect(txt).toContain("Disallow: /go/");
    expect(txt).not.toContain("Disallow: /privacy");
    expect(txt).not.toContain("Disallow: /terms");
    expect(txt).toContain("Sitemap:");
  });
});
