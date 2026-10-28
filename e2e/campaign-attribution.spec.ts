import { test, expect } from "./support/session";
import { CAMPAIGN_SOURCES } from "../src/lib/leads/registry";

/**
 * Campaign attribution, on every route an operator can take to the form.
 *
 * ## Why this file exists at all
 *
 * yuvoy-web#70: for three days every operator arriving from a printed QR code
 * was recorded as organic `web` traffic. The source was dropped by a
 * client-side redirect and then hardcoded by the destination page. It was
 * silent, and it is **unrecoverable** — a `router.replace` leaves no referrer,
 * so nothing downstream can work out afterwards which QR a lead came from.
 *
 * The bug was already asserted, in `live-api.spec.ts` — behind `LIVE_API_E2E=1`,
 * which does not run in CI. So the assertion existed and the regression shipped
 * anyway. **These tests run on every normal invocation**, need no deployed API,
 * and check the thing that actually breaks: the URL the operator ends up on.
 *
 * They deliberately assert the *link*, not the submitted payload. The payload
 * needs a live endpoint and a working form (the application is a notice until
 * yuvoy-api#4 ships), whereas the attribution is lost or kept entirely in the
 * href — which is exactly where it went wrong, and is checkable everywhere.
 */

const OPERATOR_PATHS = ["/hosts", "/hosts?source=ferry"];

test.describe("campaign attribution", () => {
  /*
    Every campaign source, not just ferry: the sources are a contract enum and
    a redirect that special-cased one of them would pass a single-source test
    while dropping the other four.
  */
  for (const source of CAMPAIGN_SOURCES) {
    test(`/go/${source}#providers carries "${source}" to the application`, async ({
      page,
    }) => {
      await page.goto(`/go/${source}#providers`);
      // Compared as parsed URL parts rather than against a RegExp built from
      // a template string: `?` and `#` both need escaping in that pattern,
      // and getting it wrong fails against a URL that is actually correct.
      await expect
        .poll(() => {
          const url = new URL(page.url());
          return `${url.pathname}${url.search}${url.hash}`;
        })
        .toBe(`/hosts?source=${source}#apply`);
    });

    test(`the header's operator link carries "${source}" on /go/${source}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/go/${source}`);

      await expect(
        page.getByRole("banner").getByRole("link", { name: "For Hosts" }),
      ).toHaveAttribute("href", `/hosts?source=${source}`);
    });
  }

  /*
    The phone is where most printed-QR traffic lands, and below `lg` the
    shutter menu is the whole of navigation — so a menu link that dropped the
    source would lose attribution for the majority of scans while every
    desktop assertion above stayed green.
  */
  test("the mobile menu's operator link carries the source", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/go/kiosk");
    await page.getByRole("button", { name: "Open menu" }).click();

    await expect(
      page
        .getByRole("dialog", { name: "Site menu" })
        .getByRole("link", { name: "For Hosts" }),
    ).toHaveAttribute("href", "/hosts?source=kiosk");
  });

  test("the homepage's operator act carries the source on a campaign route", async ({
    page,
  }) => {
    await page.goto("/go/hotel");

    await expect(
      page.getByRole("link", { name: /apply as a founding host/i }).first(),
    ).toHaveAttribute("href", "/hosts?source=hotel#apply");
  });

  /*
    Organic traffic gets a clean URL. `web` is the contract's default, so
    putting it in the query would add a parameter that changes nothing and can
    still be shared and indexed as a second URL for the same page.
  */
  test("organic traffic gets no source query", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(
      page.getByRole("banner").getByRole("link", { name: "For Hosts" }),
    ).toHaveAttribute("href", "/hosts");
    await expect(
      page.getByRole("link", { name: /apply as a founding host/i }).first(),
    ).toHaveAttribute("href", "/hosts#apply");
  });

  /*
    The value reaches the database and the API rejects anything outside its
    enum, so an unrecognised or hostile query has to become `web` here rather
    than travel to a 400 the applicant would read as a broken form.
  */
  for (const junk of ["notreal", "../etc/passwd", "web", ""]) {
    test(`?source=${junk || "(empty)"} still renders the page`, async ({
      page,
    }) => {
      const response = await page.goto(
        `/hosts?source=${encodeURIComponent(junk)}`,
      );
      expect(response?.status(), `?source=${junk} should not error`).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }

  /*
    `/hosts` is indexable, unlike `/go/*`. Without a canonical, every
    campaign query would be a separate URL for one page.
  */
  test("every campaign URL canonicalises to the bare route", async ({
    page,
  }) => {
    for (const path of OPERATOR_PATHS) {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        /\/hosts$/,
      );
    }
  });
});

/**
 * `/operators` moved to `/hosts` (D-049, yuvoy-mobile#397), and every link
 * already out there still has to land.
 *
 * Printed QR codes, shared links and bookmarks carry the old path with a
 * campaign source and often `#apply`. The redirect is permanent (308; the
 * reason is at the redirect in `next.config.ts`), and a permanent redirect
 * that dropped the query would lose the source on every printed code for as
 * long as browsers cache it, which is indefinitely. So both halves are
 * checked: what the server answers, and where a browser ends up.
 */
test.describe("/operators redirects to /hosts", () => {
  for (const [from, to] of [
    ["/operators", "/hosts"],
    ["/operators?source=ferry", "/hosts?source=ferry"],
    ["/operators/opengraph-image", "/hosts/opengraph-image"],
  ]) {
    test(`${from} answers 308 to ${to}`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(308);
      // Compared as path and query: Next may answer with a relative or an
      // absolute Location, and either is correct.
      const location = new URL(
        response.headers()["location"] ?? "",
        "http://localhost",
      );
      expect(`${location.pathname}${location.search}`).toBe(to);
    });
  }

  test("a printed link lands with its source and its fragment", async ({
    page,
  }) => {
    // The fragment never reaches the server; the browser re-applies it to
    // the redirect's target. This is the half only a browser can show.
    await page.goto("/operators?source=hotel#apply");
    await expect
      .poll(() => {
        const url = new URL(page.url());
        return `${url.pathname}${url.search}${url.hash}`;
      })
      .toBe("/hosts?source=hotel#apply");
    await expect(
      page.locator("#apply").getByLabel("Business name"),
    ).toBeVisible();
  });
});
