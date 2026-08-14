import { test, expect } from "./support/session";
import { countInPage, pageText } from "./support/text";

/** Nothing on the site may claim a price, a rating or a review count. */
const FABRICATED = /₹|\breviews?\b|\bratings?\b/i;

const DESTINATION_SLUGS = ["havelock", "neil-island", "port-blair"];

/**
 * `/explore` is the consolidation of four pages, so these tests guard two
 * different things: that the page itself is honest and complete, and that the
 * four URLs it replaced still land somewhere coherent.
 *
 * The redirect assertions are the load-bearing half. Those URLs are indexed,
 * linked, and in one case printed on operator materials.
 */
test.describe("/explore", () => {
  test("is the discovery page, with all three sections", async ({
    page,
    request,
  }) => {
    expect((await request.get("/explore")).status()).toBe(200);
    await page.goto("/explore");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /find real experiences/i,
    );

    for (const id of ["experiences", "expectations"]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  /*
    The de-duplication of 2026-08-07. This page carried the homepage's
    destination triptych and its phone tour, so a visitor who arrived here
    from the homepage met both a second time. Where Yuvoy opens and how it
    works are the homepage's job; what kind of day you can have is this one's.
  */
  test("does not repeat the homepage's destinations or product tour", async ({
    page,
  }) => {
    await page.goto("/explore");

    for (const slug of DESTINATION_SLUGS) {
      await expect(page.locator(`a[href="/destinations/${slug}"]`)).toHaveCount(
        0,
      );
    }
    await expect(page.locator("[data-preview]")).toHaveCount(0);
  });

  /*
    The page has to read as the start of something rather than as an Andaman
    site. The headline's location-independent promise carries that, and the
    wider category vocabulary underneath it does the rest.
  */
  test("presents Andaman as the first launch, not the whole platform", async ({
    page,
  }) => {
    await page.goto("/explore");
    const body = await pageText(page);

    expect(body).toMatch(/wherever you are going/i);

    // The defensive expansion language this rebuild removed. It made a first
    // launch sound like a position being held rather than a beginning.
    for (const phrase of [
      /then everywhere worth going/i,
      /before anywhere else/i,
      /a decision, not a date/i,
    ]) {
      expect(body, `/explore must not say ${phrase}`).not.toMatch(phrase);
    }
  });

  /*
    The whole reason /experiences was 410'd once already. The old version
    published invented prices, invented review counts and operator names
    flagged verified without permission. Categories only, forever.
  */
  test("describes categories, never listings", async ({ page }) => {
    await page.goto("/explore");

    // No preview wrapper on this page any more, so the rule applies to every
    // character of it without an exception to carve out.
    const body = await pageText(page);

    expect(body).not.toMatch(FABRICATED);
    for (const claim of [
      /\bfrom \d/i, // "from 4,500"
      /\bper person\b/i,
      /\bavailable (today|now)\b/i,
      /\bbook now\b/i,
      /\bverified operator/i,
      /\bsold out\b/i,
    ]) {
      expect(body, `/explore must not claim ${claim}`).not.toMatch(claim);
    }

    // It says plainly that there is nothing to browse.
    expect(body).toMatch(/no listings on yuvoy yet/i);
  });
});

/*
  The tour lives on the homepage's why act. It was on `/explore` too until
  2026-08-07, which is exactly the repetition that came off.
*/
test("the three steps are watch, understand and book, and nothing more", async ({
  page,
}) => {
  await page.goto("/#how");
  const section = page.locator("#how");

  for (const step of ["Watch", "Understand", "Book"]) {
    await expect(
      section.getByRole("button", { name: new RegExp(`^${step}`) }),
    ).toBeVisible();
  }
  /*
    Four, and both kinds named: the tour's three steps and the tour's pause
    control. It was briefly five while the hunt was an auto-playing deck,
    which needed its own pause control for WCAG 2.2.2; that deck was replaced
    by a static scatter on 2026-08-15 and the control went with it.

    The number is the point of this assertion: it exists so the eight-step
    traveller and operator journeys retired with /how-it-works cannot quietly
    come back, and so a stray control cannot appear in this act unnoticed.
    Change it only alongside a control you can name here.
  */
  await expect(section.getByRole("button")).toHaveCount(4);
});

test.describe("the consolidated routes", () => {
  const REDIRECTS: [string, string][] = [
    // These two point at the HOMEPAGE: the sections they name live there.
    ["/how-it-works", "/"],
    ["/destinations", "/"],
    ["/travellers", "/explore"],
    ["/experiences", "/explore"],
    // A legacy spelling that predates the `neil-island` slug.
    ["/destinations/neil", "/destinations/neil-island"],
  ];

  for (const [from, to] of REDIRECTS) {
    test(`${from} lands on ${to}`, async ({ page }) => {
      const response = await page.goto(from);
      expect(response?.status(), `${from} should resolve`).toBe(200);
      expect(new URL(page.url()).pathname).toBe(to);
    });
  }

  /*
    Deliberately NOT permanent (308). A browser caches a permanent redirect
    indefinitely, which would make folding these four pages together
    irreversible on every machine that ever saw one. The IA is new; it stays
    reversible until the shape has held for a season. The Neil slug fix is a
    genuine canonicalisation and is permanent.
  */
  test("the consolidation redirects are temporary, the slug fix is permanent", async ({
    request,
  }) => {
    for (const path of [
      "/how-it-works",
      "/travellers",
      "/experiences",
      "/destinations",
    ]) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), `${path} should be a temporary redirect`).toBe(307);
    }

    const neil = await request.get("/destinations/neil", { maxRedirects: 0 });
    expect(neil.status()).toBe(308);
  });

  /*
    A redirect that lands on a missing anchor drops the reader at the top of a
    long page with no sign anything happened, which is worse than not
    redirecting at all. Each target is checked on the page that now owns it.
  */
  test("the anchors the redirects point at all exist", async ({ page }) => {
    await page.goto("/");
    for (const id of ["destinations", "how"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }

    await page.goto("/explore");
    await expect(page.locator("#experiences")).toHaveCount(1);
  });
});

test.describe("destination pages", () => {
  for (const slug of DESTINATION_SLUGS) {
    test(`/destinations/${slug} renders with breadcrumbs and a canonical`, async ({
      page,
    }) => {
      const res = await page.goto(`/destinations/${slug}`);
      expect(res?.status()).toBe(200);

      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

      const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
      await expect(crumbs).toBeVisible();
      await expect(crumbs.getByRole("link", { name: "Home" })).toBeVisible();
      await expect(
        crumbs.getByRole("link", { name: "Destinations" }),
      ).toBeVisible();

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`/destinations/${slug}$`),
      );

      expect(await pageText(page)).not.toMatch(FABRICATED);
    });
  }

  test("a destination page states the pre-launch position exactly once", async ({
    page,
  }) => {
    await page.goto("/destinations/havelock");
    expect(await countInPage(page, /currently onboarding experiences/i)).toBe(
      1,
    );
  });

  test("an unknown destination is a 404, not a blank page", async ({
    request,
  }) => {
    expect((await request.get("/destinations/mumbai")).status()).toBe(404);
  });

  test("labels match the lead registry rather than drifting from it", async ({
    page,
  }) => {
    /*
      The registry is what the API contract uses; the site must not rename a
      destination independently of it. They used to meet on the waitlist
      form's destination dropdown, which came off on 2026-08-07 — the
      destination pages carry the official name now, so that is where the two
      are checked against each other.
    */
    // Sequential, not `Promise.all`: these share one page, and concurrent
    // navigations abort each other.
    const pages: string[] = [];
    for (const slug of DESTINATION_SLUGS) {
      await page.goto(`/destinations/${slug}`);
      pages.push(await pageText(page));
    }
    const body = pages.join(" ");
    for (const label of [
      "Havelock (Swaraj Dweep)",
      "Neil (Shaheed Dweep)",
      "Port Blair",
    ]) {
      expect(body, `missing registry label: ${label}`).toContain(label);
    }
  });
});

test("retired experience detail slugs still answer 410", async ({
  request,
}) => {
  for (const slug of [
    "sunrise-scuba-dive",
    "bioluminescence-kayak",
    "anything-at-all",
  ]) {
    const res = await request.get(`/experiences/${slug}`);
    expect(res.status(), `/experiences/${slug}`).toBe(410);
  }
});

test("explore is reachable from the site navigation", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("banner").getByRole("navigation", {
    name: "Primary",
  });
  await expect(
    nav.getByRole("link", { name: "Explore", exact: true }),
  ).toBeVisible();
});
