import { test, expect, type Page } from "./support/session";
import {
  ALLOWED_TYPES,
  FORBIDDEN_TYPES,
} from "../src/lib/site/structured-data";

/** Every route that is meant to be indexed. Must match sitemap.ts. */
const INDEXABLE = [
  "/",
  "/explore",
  "/waitlist",
  "/operators",
  "/contact",
  "/safety",
  "/destinations/havelock",
  "/destinations/neil-island",
  "/destinations/port-blair",
  "/about",
  "/journal",
  "/journal/why-the-andamans",
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
      // publishes localhost canonicals and OG image URLs. Only meaningful
      // against a deployed environment — locally the origin *is* localhost.
      const origin = new URL(baseURL ?? "http://localhost").origin;
      if (!origin.startsWith("http://localhost")) {
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
      /*
        The brand once, never twice.

        `layout.tsx` appends " · Yuvoy" to every title through the template, so
        a page whose own title already carries the brand renders "Contact Yuvoy
        · Yuvoy". `/about` documents the way round it — an absolute title — and
        `/contact` had quietly done the thing that page's comment calls "worse".
        Nothing failed, because a title is not load-bearing, which is exactly
        why it needs a check rather than a reader.

        Counted rather than pattern-matched: "Yuvoy for Operators" is a
        legitimate second word on the operator door and is one mention, not two.
      */
      const brand = (title.match(/Yuvoy/g) ?? []).length;
      expect(brand, `${path} names the brand ${brand} times: "${title}"`).toBe(
        1,
      );

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
    // The four consolidated routes are redirects now. A redirect in a
    // sitemap is crawl budget spent on a URL that no longer answers.
    for (const excluded of [
      "/go/",
      "/philosophy",
      "/privacy",
      "/terms",
      "/how-it-works",
      "/travellers",
      "/experiences",
      "/destinations<",
    ]) {
      expect(xml, `sitemap must not list ${excluded}`).not.toContain(
        `${excluded}<`,
      );
    }
    expect(xml).not.toContain("/go/");
  });

  test("robots disallows the campaign routes", async ({ request }) => {
    const txt = await (await request.get("/robots.txt")).text();
    // Non-production disallows everything; that is correct and not under test.
    if (txt.includes("Disallow: /\n") && !txt.includes("Sitemap:")) return;

    expect(txt).toContain("Disallow: /go/");
    expect(txt).toContain("Sitemap:");
  });

  /*
    THE ATOMIC RULE, ASSERTED AS AN INVARIANT — yuvoy-web#152.

    `robots.ts` states it: /privacy and /terms come off the disallow list in
    the same change that removes their `noindex` and adds them to the sitemap,
    "all three together, never independently".

    Nothing checked it, so it came apart. Step one shipped alone: the two
    paths left the disallow list while both pages still answered `noindex` and
    the sitemap still excluded them with a comment calling their copy
    placeholder. `robots.txt` was inviting crawlers to two pages that told
    them to go away, and every half looked deliberate on its own.

    Worse, the test that stood here asserted `not.toContain("Disallow:
    /privacy")` — it PINNED the broken half in place and would have failed the
    fix.

    So this does not assert a state. It asserts the three agree with each
    other, whichever way they are set, and it passes unchanged through the
    launch flip — which is the only version of this check that cannot go stale.
  */
  test("the three halves of /privacy and /terms indexing agree", async ({
    request,
  }) => {
    const txt = await (await request.get("/robots.txt")).text();
    if (txt.includes("Disallow: /\n") && !txt.includes("Sitemap:")) return;
    const xml = await (await request.get("/sitemap.xml")).text();

    for (const path of ["/privacy", "/terms"]) {
      const blocked = txt.includes(`Disallow: ${path}`);
      const html = await (await request.get(path)).text();
      const noindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(
        html,
      );
      const listed = xml.includes(`${path}<`);

      expect(
        noindex,
        `robots.txt ${blocked ? "blocks" : "allows"} ${path} but the page ` +
          `${noindex ? "says" : "does not say"} noindex — two halves of one answer`,
      ).toBe(blocked);
      expect(
        listed,
        `${path} is ${blocked ? "blocked" : "allowed"} and ` +
          `${listed ? "IS" : "is not"} in the sitemap — a sitemap entry for a ` +
          `blocked page is a promise to a crawler we are also refusing`,
      ).toBe(!blocked);
    }
  });
});

/**
 * Security headers, asserted against a running origin — yuvoy-web#153.
 *
 * `next.config.ts` builds the policy from environment variables, so the only
 * place the real policy exists is a deployed response. A green unit test on
 * the builder says the string is right; only this says the string arrived.
 * Read-only GETs, so it can be pointed at yuvoy.in unchanged.
 */
test.describe("security headers", () => {
  test("every response carries the enforced policy", async ({ request }) => {
    const headers = (await request.get("/")).headers();

    expect(headers["content-security-policy"]).toBe(
      "object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    );
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });

  test("the full policy ships in report-only and closes both form-jacking exits", async ({
    request,
  }) => {
    const policy =
      (await request.get("/")).headers()[
        "content-security-policy-report-only"
      ] ?? "";

    expect(policy).toContain("default-src 'none'");
    // The two that matter on a site with no session: where a script may send
    // what it scrapes, and where a rewritten form may post it.
    expect(policy).toMatch(/connect-src [^;]*'self'/);
    expect(policy).toContain("form-action 'self'");
    expect(policy).not.toContain("'unsafe-eval'");
  });

  test("the enforced policy is a strict subset of the reported one", async ({
    request,
  }) => {
    // Both are built from one directive list. An enforced rule that the
    // report-only header does not carry is a rule nobody ever saw a report for.
    const headers = (await request.get("/")).headers();
    const reported = new Set(
      (headers["content-security-policy-report-only"] ?? "").split("; "),
    );
    for (const d of (headers["content-security-policy"] ?? "").split("; ")) {
      expect(reported, `enforced "${d}" is not in report-only`).toContain(d);
    }
  });
});
