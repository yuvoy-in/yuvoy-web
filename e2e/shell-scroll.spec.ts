import { test, expect, type Page } from "./support/session";

import { waitForRouteReady } from "./support/ready";
import { SHELL_ROUTES } from "./support/shell-kit";

/*
  The header gets out of the way on the way down the page and returns on the
  way up. What makes or breaks this pattern is the edge cases, so they are
  what is asserted: it never hides near the top, it comes back on the
  smallest upward movement, and focus always brings it back — a focus ring
  parked off-screen is a WCAG 2.4.11 failure, and closing the menu returns
  focus to a trigger that lives in this bar.
*/
test.describe("header on scroll", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // Emulated explicitly: the hide lives behind a `no-preference` media query,
  // and headless runtimes do not agree on what the default should be.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });

  const header = (page: Page) => page.getByRole("banner");

  const TRANSPARENT = "rgba(0, 0, 0, 0)";

  /**
   * Scroll down until the bar actually hides.
   *
   * `page.goto` resolves on load, not on hydration, so a lone wheel can
   * land before the scroll listener exists: the page moves, the header
   * never learns the gesture was downward, and it sits there in view. That
   * raced twice in CI on 2026-08-06 (both runs recovered on retry, which is
   * exactly how a latent race announces itself). Repeating the gesture
   * until it takes keeps these tests about the header rather than about
   * hydration timing.
   */
  const scrollUntilHidden = async (page: Page) => {
    await expect(async () => {
      await page.mouse.wheel(0, 900);
      await expect(header(page)).not.toBeInViewport({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
  };

  test("stays put at the very top of the page", async ({ page }) => {
    await page.goto("/");
    await page.mouse.wheel(0, 4);
    await expect(header(page)).toBeInViewport();
  });

  /*
    The tone contract, in both directions (owner directions 2026-08-08 and
    2026-08-16 together).

    Going DOWN the bar hides, and its latent tone tracks the cover's bottom
    edge — read off the element, not timed, because a fixed 240px release
    once put a paper bar on a green field partway down every cover route
    (504px early on `/operators`, whose cover is 744px tall). Coming back UP
    anywhere below the top, the visitor sees a SOLID bar: the transparent
    treatment belongs to the very top alone. On-device captures (2026-08-16)
    showed why — a bar revealed transparent mid-cover sat under the Dynamic
    Island with the cover's own type sliding through its lockup.
  */
  /*
    Instant, not the site's own smooth scrolling. What these assert is a
    geometric relationship — cover edge against bar — and a smooth scroll makes
    that a race: the "not transparent" assertion resolves the moment the colour
    changes, which can be mid-animation, and the next `scrollTo` then lands on
    top of a scroll still in flight. That produced two failures out of three
    routes at three workers, on logic that is correct at every position (probed
    directly). The smooth path is the browser's, not ours, and is not what is
    under test here.
  */
  const scrollTo = (page: Page, y: number) =>
    page.evaluate((to) => window.scrollTo({ top: to, behavior: "instant" }), y);

  /**
   * The scroll position at which the cover's foot meets the bar's underside.
   *
   * Picks the cover that has layout. Under `next dev` a suspended route leaves
   * a second, `display: none` copy of its markup in the document, and reading
   * that one reports a 744px cover as 0px (see `support/ready.ts`).
   */
  const coverEdge = (page: Page) =>
    page.evaluate(() => {
      const cover = [...document.querySelectorAll("[data-dark-hero]")].find(
        (el) => el.getBoundingClientRect().height > 0,
      )!;
      const bar = document.querySelector("header")!;
      return (
        window.scrollY + cover.getBoundingClientRect().bottom - bar.offsetHeight
      );
    });

  for (const path of ["/", "/hosts", "/explore"]) {
    test(`${path} wears the cover down it, and the bar back up it`, async ({
      page,
    }) => {
      await page.goto(path);
      await waitForRouteReady(page);
      await expect(header(page)).toHaveCSS("background-color", TRANSPARENT);

      const edge = await coverEdge(page);
      expect(edge, `${path} has no cover to speak of`).toBeGreaterThan(200);

      // Descending, the bar hides — and hidden over the cover it keeps the
      // cover's colours, so the slide-away that began at the top left in the
      // colours it arrived with rather than flashing paper on the way out.
      await scrollTo(page, Math.round(edge * 0.6));
      await expect(header(page)).not.toBeInViewport();
      await expect(header(page)).toHaveCSS("background-color", TRANSPARENT);

      // A hair short of the edge: still hidden, still the cover's colours.
      await scrollTo(page, Math.max(0, Math.round(edge) - 8));
      await expect(header(page)).toHaveCSS("background-color", TRANSPARENT);

      // Past it: paper, swapped where nobody can see it happen.
      await scrollTo(page, Math.round(edge) + 40);
      await expect(header(page)).not.toHaveCSS("background-color", TRANSPARENT);

      // Returning up through the cover: the position that was transparent on
      // the way down now shows a SOLID bar — any bar the visitor can see
      // below the top is paper (owner direction, 2026-08-16).
      await scrollTo(page, Math.round(edge * 0.6));
      await expect(header(page)).toBeInViewport();
      await expect(header(page)).not.toHaveCSS("background-color", TRANSPARENT);

      // All the way home: the top is the transparent state's whole territory.
      await scrollTo(page, 0);
      await expect(header(page)).toHaveCSS("background-color", TRANSPARENT);
    });
  }

  /*
    The reduced-motion case, where the bar never hides and the colour is the
    only thing that can change. Descending, it still tracks the cover rather
    than releasing early over it — a visibly resting bar on a green field must
    not be paper. Ascending, these visitors get the same contract as everyone
    else (owner direction, 2026-08-16): a bar coming back up the page is
    solid, and the cover's colours return at the top.
  */
  test("tracks the cover under prefers-reduced-motion too", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/hosts");
    await waitForRouteReady(page);

    const edge = await coverEdge(page);
    await scrollTo(page, Math.round(edge * 0.6));
    await expect(header(page)).toBeInViewport();
    await expect(header(page)).toHaveCSS("background-color", TRANSPARENT);

    await scrollTo(page, Math.round(edge) + 40);
    await expect(header(page)).toBeInViewport();
    await expect(header(page)).not.toHaveCSS("background-color", TRANSPARENT);

    // Back up into the cover: still solid — the reveal direction wears the
    // bar, at every motion preference.
    await scrollTo(page, Math.round(edge * 0.6));
    await expect(header(page)).toBeInViewport();
    await expect(header(page)).not.toHaveCSS("background-color", TRANSPARENT);

    await scrollTo(page, 0);
    await expect(header(page)).toHaveCSS("background-color", TRANSPARENT);
  });

  // `/safety`, not `/about`: About gained a dark title spread on 2026-08-07,
  // so it is a cover route now. This assertion needs a page that genuinely
  // opens on paper, and the legal and safety pages are the ones that do.
  /*
    The server and the first paint must agree about whether a route opens on
    a dark cover.

    `useHeaderChrome` seeds itself from a hardcoded route list and then
    re-derives the truth from the DOM. If a page gains a `data-dark-hero`
    section and nobody adds it to that list, the server renders a paper bar,
    hydration flips it to transparent, and the header flashes on every single
    load — a defect that is invisible in any test that runs after hydration,
    which is every other test in this file.

    So this reads the **served HTML**, where the mismatch actually lives.
    `/contact` shipped with exactly this bug on 2026-08-07 and was caught by
    hand; this is why it cannot happen twice.
  */
  for (const path of SHELL_ROUTES) {
    test(`${path} agrees with itself about having a cover`, async ({
      request,
    }) => {
      const html = await (await request.get(path)).text();
      const hasCover = html.includes("data-dark-hero");

      /*
        The header's OPENING TAG, not its subtree. Reading the whole element
        matched `bg-transparent` on the mobile menu's `<dialog>`, which is a
        child of it and transparent on every route — so this reported that
        every page rendered a transparent bar, including the ones that do not.

        The SITE header specifically, named by its `header-slide` class. The
        bare `<header>` pattern used to grab whichever header came first,
        which on `/waitlist` is the WaitlistChrome masthead — so this spec
        was asserting the site-header invariant against a component that is
        not the site header, and passed only because that route carried no
        `data-dark-hero`. Since 2026-08-11 it does (the marker also drives
        the page CANVAS via body:has() in globals.css, and /waitlist is a
        dark page), which surfaced the imprecision: on a route that hides
        the site chrome the invariant is vacuous, and the assertion below
        only requires that the route still renders some banner.
      */
      const openingTag = /<header[^>]*header-slide[^>]*>/.exec(html)?.[0] ?? "";
      if (!openingTag) {
        expect(html, `${path} rendered no header at all`).toMatch(
          /<header[^>]*>/,
        );
        return;
      }
      const rendersTransparent = openingTag.includes("bg-transparent");

      expect(
        rendersTransparent,
        hasCover
          ? `${path} has a dark cover but the server rendered a solid bar — add it to COVER_ROUTES in use-header-chrome.ts`
          : `${path} has no dark cover but the server rendered a transparent bar — remove it from COVER_ROUTES`,
      ).toBe(hasCover);
    });
  }

  test("is solid at the top of a page with no cover", async ({ page }) => {
    await page.goto("/safety");
    await expect(header(page)).not.toHaveCSS("background-color", TRANSPARENT);
  });

  /*
    A cover route reached the way a visitor actually reaches it: by clicking,
    not by typing the URL.

    Every other cover assertion here navigates directly, which renders the page
    on the server and puts the cover in the DOM before the header ever asks
    about it. A *client-side* navigation to a route that suspends does not:
    `loading.tsx` renders first, and the header asked its question against that
    — got "no cover", correctly, for a paper loading screen — and never asked
    again, because the pathname does not change a second time. The bar then sat
    paper on top of a forest cover for the whole visit (owner report,
    2026-08-08).

    `/hosts` is the case that showed it. It reads `searchParams`, so it is
    dynamic and its navigation reliably passes through the fallback; `/go/*` is
    dynamic for the same reason. A static cover route like `/explore` renders
    instantly and never exposed the bug, which is why direct-navigation
    assertions all passed while the defect was on screen.
  */
  test("wears the cover after a client-side navigation to a dynamic route", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("banner")
      .getByRole("link", { name: "For Hosts", exact: true })
      .click();

    await expect(page).toHaveURL(/\/hosts$/);
    // The cover is the first thing on the page, and the page is at the top.
    await waitForRouteReady(page);
    await expect(header(page)).toHaveCSS("background-color", TRANSPARENT);
  });

  test("hides going down and returns going up", async ({ page }) => {
    await page.goto("/");

    await scrollUntilHidden(page);
    /*
      Settled-hidden means it paints NOTHING. A bar translated by its own
      height is parked exactly in the strip iOS Safari's collapsed chrome
      shows under the Dynamic Island, and it ghosted there through the system
      glass (owner captures, 2026-08-16) — so once the slide lands, opacity
      goes to zero. The element stays focusable: the focus test below depends
      on that, which is why this is not `visibility`.
    */
    await expect(header(page)).toHaveCSS("opacity", "0");

    await page.mouse.wheel(0, -120);
    await expect(header(page)).toBeInViewport();
    await expect(header(page)).toHaveCSS("opacity", "1");
  });

  test("comes back when focus enters it", async ({ page }) => {
    await page.goto("/");
    await scrollUntilHidden(page);

    // Any focusable in the bar; at this width that is the inline nav.
    await header(page).getByRole("link", { name: "Explore" }).focus();
    await expect(header(page)).toBeInViewport();
  });

  test("stays put entirely under prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    // Belt and braces: emulateMedia overrides the describe-level preference.
    await page.goto("/");

    await page.mouse.wheel(0, 900);
    // Not "hidden without a transition" — for these visitors it never hides.
    await expect(header(page)).toBeInViewport();
  });
});
