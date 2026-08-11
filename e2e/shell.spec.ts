import { test, expect, type Page } from "./support/session";
import AxeBuilder from "@axe-core/playwright";

import { waitForRouteReady } from "./support/ready";

/**
 * Routes that exist today and must all render inside the shell.
 *
 * `/waitlist` is in here on purpose even though it suppresses the site header:
 * what this list asserts is that every route has a `banner` carrying the mark
 * and a `contentinfo` beneath it, and that route satisfies both with its own
 * masthead (`WaitlistChrome`). What is *specific* to it — no site nav, a back
 * control, a centred mark — is asserted in `waitlist.spec.ts`.
 */
const SHELL_ROUTES = [
  "/",
  "/explore",
  "/waitlist",
  "/operators",
  "/contact",
  "/safety",
  "/destinations/havelock",
  "/about",
  "/journal",
  "/journal/why-the-andamans",
  "/go/ferry",
  "/privacy",
  "/terms",
];

const MOBILE = { width: 390, height: 844 };

async function openMenu(page: Page) {
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  // Let the entrance animation settle. Contrast is only a WCAG concern in the
  // settled state, and sampling mid-fade reports the panel composited against
  // the backdrop rather than its own background.
  await page
    .getByRole("dialog", { name: "Site menu" })
    .locator("> div")
    .evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  return trigger;
}

test.describe("site shell", () => {
  for (const path of SHELL_ROUTES) {
    test(`header and footer render on ${path}`, async ({ page }) => {
      await page.goto(path);

      const header = page.getByRole("banner");
      await expect(header).toBeVisible();
      await expect(
        header.getByRole("link", { name: "Yuvoy home" }),
      ).toBeVisible();

      // Sticky: after moving down the page and back up, it is on screen
      // again. The directional hide has its own describe below, where the
      // motion preference is emulated explicitly rather than inherited.
      await page.mouse.wheel(0, 800);
      await page.mouse.wheel(0, -800);
      await expect(header).toBeInViewport();

      await expect(page.getByRole("contentinfo")).toBeVisible();
    });
  }

  test("navigation never links to a route that does not exist", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const hrefs = await page
      .getByRole("banner")
      .getByRole("link")
      .evaluateAll((links) =>
        links.map((l) => (l as HTMLAnchorElement).getAttribute("href") ?? ""),
      );
    const footerHrefs = await page
      .getByRole("contentinfo")
      .getByRole("link")
      .evaluateAll((links) =>
        links.map((l) => (l as HTMLAnchorElement).getAttribute("href") ?? ""),
      );

    const routes = [...hrefs, ...footerHrefs]
      .filter((h) => h.startsWith("/"))
      .map((h) => h.split("#")[0])
      .filter((h) => h.length > 0);

    expect(routes.length).toBeGreaterThan(0);
    for (const route of new Set(routes)) {
      const res = await request.get(route);
      expect(res.status(), `${route} should resolve`).toBeLessThan(400);
    }
  });

  /*
    The footer published no contact row at all until 2026-08-07, on the rule
    that an unmonitored address is worse than none. The owner confirmed both
    of these are read by a person, so the row ships — and what is asserted
    now is that the channels are real links rather than decoration, and that
    they match the single source they are derived from.
  */
  test("footer publishes the confirmed contact channels, as links", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");

    await expect(
      footer.getByRole("link", { name: "info@yuvoy.in" }),
    ).toHaveAttribute("href", "mailto:info@yuvoy.in");
    await expect(
      footer.getByRole("link", { name: /\+91 81216 57657/ }),
    ).toHaveAttribute("href", "https://wa.me/918121657657");

    // No social row: an account nobody posts to is the same broken promise
    // in a different shape.
    const text = (await footer.textContent()) ?? "";
    for (const network of ["instagram", "facebook", "twitter", "linkedin"]) {
      expect(text.toLowerCase()).not.toContain(network);
    }
  });

  /*
    Two whole-page structural checks that a screenshot cannot make for you,
    and that axe's WCAG-tagged rules do not cover.
  */
  /*
    The widths that actually break things, not a sample of them: the narrowest
    phone still in use (360), the common one (390), the large one (430), the
    tablet, the laptop where the `lg` inline nav appears, and the desktop.
    Horizontal overflow is a defect that shows at one width and hides at the
    next, so the cheap fix is to check the ones real devices report.

    Hoisted out of the test so the timeout below can be derived from the count
    rather than guessed at.
  */
  const BREAKPOINTS = [
    { name: "phone-360", width: 360, height: 780 },
    { name: "phone-390", width: 390, height: 844 },
    { name: "phone-430", width: 430, height: 932 },
    { name: "tablet-768", width: 768, height: 1024 },
    { name: "laptop-1280", width: 1280, height: 800 },
    { name: "desktop-1440", width: 1440, height: 900 },
  ];

  for (const path of SHELL_ROUTES) {
    test(`${path} has sound structure at every breakpoint`, async ({
      page,
    }) => {
      /*
        One budget per navigation, not one for all of them.

        This test loads the same route once per breakpoint — six full page
        loads — while Playwright's default 30s applies to the *whole test*, so
        the budget was shared across all six. `/explore` blew through it on CI
        after #72 put photography on the pages.

        Raising the budget alone was not the fix, and proved it: at 120s the
        same test still hung. The wait condition was the real cause (see the
        note on `page.goto` below). This stays because a shared budget is still
        the wrong shape — six navigations deserve six navigations' worth.

        Derived from the array rather than hardcoded, so adding a seventh
        breakpoint cannot quietly make it tight again.
      */
      test.setTimeout(BREAKPOINTS.length * 20_000);

      const problems: string[] = [];

      for (const viewport of BREAKPOINTS) {
        await page.setViewportSize(viewport);
        /*
          `domcontentloaded`, NOT `networkidle`.

          `networkidle` waits for 500ms of network silence, which on `next dev`
          means waiting for every responsive image variant to be optimised on
          demand. This test loads the same route at six widths, and `next/image`
          requests a different width at each — so `/explore`, with four category
          photographs, asks the dev server for up to 24 separate WebP re-encodes.
          On a CI runner that never settled: the test hung on `page.goto` and
          failed even at a 120s budget, having passed locally throughout.

          Nothing here needs the image bytes. Every image sits in a box with a
          CSS aspect ratio, so layout — which is all the overflow and heading
          checks measure — is final before a single pixel is decoded. Waiting on
          a *visible* `<main>` is the real guard, and it is what stops this
          measuring `loading.tsx` while the route compiles, or React's hidden
          streaming buffer while the route is still arriving.
        */
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await waitForRouteReady(page);

        // Horizontal overflow — the classic mobile defect, invisible in tests
        // that only assert on content.
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        if (overflow > 1) {
          problems.push(
            `${viewport.name}: overflows horizontally by ${overflow}px`,
          );
        }

        /*
          Element-level overflow, which the document-level check above can
          miss entirely.

          `globals.css` sets `overflow-x: clip` on the body as a guard. That
          guard also *hides the evidence*: content wider than the viewport is
          cut off rather than made scrollable, so the page can look fine to a
          scrollWidth comparison while a button, a table or a long address is
          silently sliced down the right edge. On a phone that is exactly the
          class of defect nobody catches until a screenshot arrives.

          Elements inside a deliberately clipping ancestor are skipped: the
          hero's drifting artwork, a plate's hover scale and the menu shutter
          all overflow on purpose and are contained by design. So are
          off-screen positioned things — the skip link and the form honeypot
          live at negative coordinates and are meant to.
        */
        const clipped = await page.evaluate((width) => {
          const out: string[] = [];
          for (const el of document.body.querySelectorAll<HTMLElement>("*")) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;
            // Deliberately off-screen (skip link, honeypot), not overflow.
            if (rect.right <= 0 || rect.left >= width) continue;
            const spill = Math.round(rect.right - width);
            if (spill <= 1) continue;

            let clipsSomewhere = false;
            for (
              let node: HTMLElement | null = el.parentElement;
              node && node !== document.documentElement;
              node = node.parentElement
            ) {
              const overflowX = getComputedStyle(node).overflowX;
              if (overflowX !== "visible") {
                clipsSomewhere = true;
                break;
              }
            }
            if (clipsSomewhere) continue;

            const label =
              el.tagName.toLowerCase() +
              (el.className && typeof el.className === "string"
                ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}`
                : "");
            out.push(`${label} spills ${spill}px`);
          }
          // One line per offender, deduplicated — a spilling wrapper usually
          // drags its children with it and would otherwise report ten times.
          return [...new Set(out)].slice(0, 5);
        }, viewport.width);

        for (const offender of clipped) {
          problems.push(`${viewport.name}: ${offender}`);
        }

        /*
          Exactly one h1, and heading levels never skip on the way down.

          Only headings that have layout are counted. React's streaming staging
          container keeps a hidden second copy of the whole route in the DOM
          (see `waitForRouteReady`), so counting every match reported "2 h1
          elements" on pages that render one — which the served HTML proves,
          and which is what a crawler is given.

          Layout is also the honest test of the thing being asserted: a heading
          with no box is not on the page and is not in the accessibility tree,
          so it cannot be the second h1 a screen-reader user has to sort out.
        */
        const headings = await page.evaluate(() =>
          [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
            .filter((el) => el.getClientRects().length > 0)
            .map((el) => ({
              level: Number(el.tagName.substring(1)),
              text: (el.textContent ?? "").trim().slice(0, 40),
            })),
        );
        const levels = headings.map((h) => h.level);
        const h1s = headings.filter((h) => h.level === 1);
        if (h1s.length !== 1) {
          const detail = h1s.map((h) => `"${h.text}"`).join(" + ");
          problems.push(
            `${viewport.name}: ${h1s.length} h1 elements, expected 1${
              detail ? ` — ${detail}` : ""
            }`,
          );
        }
        for (let i = 1; i < levels.length; i++) {
          if (levels[i] - levels[i - 1] > 1) {
            problems.push(
              `${viewport.name}: heading level skips h${levels[i - 1]} → h${levels[i]}`,
            );
          }
        }
      }

      expect(problems.join("\n")).toBe("");
    });
  }

  /*
    WCAG 2.2 SC 2.5.8 — pointer targets are at least 24×24 CSS px.

    axe does not flag this, so without a test a 16px `label` link ships as a
    16px tap target and nobody notices until someone tries to hit it on a
    phone. The `tap-target` utility exists for exactly this.

    Two documented exemptions, both from the success criterion itself:
    links inside a sentence (their size is constrained by surrounding text),
    and off-screen elements like the skip link, which is full-size on focus.
  */
  for (const path of SHELL_ROUTES) {
    test(`${path} has no undersized tap target`, async ({ page }) => {
      // The narrowest phone still in use, not the common one: targets shrink
      // as the viewport does, so 390 can pass while 360 fails.
      await page.setViewportSize({ width: 360, height: 780 });
      // Same reasoning as the structure check above: tap-target size comes
      // from layout, not from decoded image bytes.
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await waitForRouteReady(page);

      const undersized = await page.evaluate(() =>
        [...document.querySelectorAll("a,button")]
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return false;
            if (rect.height >= 24) return false;
            // Inline exception: the parent holds text beyond this link.
            const parentText = (el.parentElement?.textContent ?? "").trim();
            const ownText = (el.textContent ?? "").trim();
            if (parentText.length > ownText.length + 3) return false;
            // Off-screen (the skip link until focused).
            if (rect.width <= 1 || rect.height <= 1) return false;
            return true;
          })
          .map(
            (el) =>
              `${Math.round(el.getBoundingClientRect().height)}px "${(el.textContent ?? "").trim().slice(0, 30)}"`,
          ),
      );

      expect(undersized.join("\n")).toBe("");
    });
  }
});

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
    The bar wears the cover for exactly as long as the cover is behind it, and
    goes solid when the cover's bottom edge passes under it.

    It used to release on a fixed 240px instead, which put a cream bar on a
    green field partway down every cover route — 504px early on `/operators`,
    whose cover is 744px tall (owner report, 2026-08-08). So what is asserted
    is the *relationship* rather than a scroll position: the boundary is read
    off the cover element, so this keeps holding as the covers change height.
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

  for (const path of ["/", "/operators", "/explore"]) {
    test(`${path} wears the cover for the whole cover, then the bar`, async ({
      page,
    }) => {
      await page.goto(path);
      await waitForRouteReady(page);
      await expect(header(page)).toHaveCSS("background-color", TRANSPARENT);

      const edge = await coverEdge(page);
      expect(edge, `${path} has no cover to speak of`).toBeGreaterThan(200);

      // Well inside the cover — the old rule had already gone cream here.
      await scrollTo(page, Math.round(edge * 0.6));
      await expect(header(page)).toHaveCSS("background-color", TRANSPARENT);

      // A hair short of the edge: still the cover's colours.
      await scrollTo(page, Math.max(0, Math.round(edge) - 8));
      await expect(header(page)).toHaveCSS("background-color", TRANSPARENT);

      // Past it: solid, because what is behind the bar is no longer forest.
      await scrollTo(page, Math.round(edge) + 40);
      await expect(header(page)).not.toHaveCSS("background-color", TRANSPARENT);

      // All the way home: it returns to the cover's colours.
      await scrollTo(page, 0);
      await expect(header(page)).toHaveCSS("background-color", TRANSPARENT);
    });
  }

  /*
    The reduced-motion case, which the retired 240px constant existed to serve:
    the bar never hides for these visitors, so the colour is the only thing
    that can change — and it must still track the cover rather than releasing
    early over it.
  */
  test("tracks the cover under prefers-reduced-motion too", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/operators");
    await waitForRouteReady(page);

    const edge = await coverEdge(page);
    await scrollTo(page, Math.round(edge * 0.6));
    await expect(header(page)).toBeInViewport();
    await expect(header(page)).toHaveCSS("background-color", TRANSPARENT);

    await scrollTo(page, Math.round(edge) + 40);
    await expect(header(page)).toBeInViewport();
    await expect(header(page)).not.toHaveCSS("background-color", TRANSPARENT);
  });

  // `/safety`, not `/about`: About gained a dark title spread on 2026-08-07,
  // so it is a cover route now. This assertion needs a page that genuinely
  // opens on cream, and the legal and safety pages are the ones that do.
  /*
    The server and the first paint must agree about whether a route opens on
    a dark cover.

    `useHeaderChrome` seeds itself from a hardcoded route list and then
    re-derives the truth from the DOM. If a page gains a `data-dark-hero`
    section and nobody adds it to that list, the server renders a cream bar,
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
    — got "no cover", correctly, for a cream loading screen — and never asked
    again, because the pathname does not change a second time. The bar then sat
    cream on top of a forest cover for the whole visit (owner report,
    2026-08-08).

    `/operators` is the case that showed it. It reads `searchParams`, so it is
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
      .getByRole("link", { name: "For Operators", exact: true })
      .click();

    await expect(page).toHaveURL(/\/operators$/);
    // The cover is the first thing on the page, and the page is at the top.
    await waitForRouteReady(page);
    await expect(header(page)).toHaveCSS("background-color", TRANSPARENT);
  });

  test("hides going down and returns going up", async ({ page }) => {
    await page.goto("/");

    await scrollUntilHidden(page);

    await page.mouse.wheel(0, -120);
    await expect(header(page)).toBeInViewport();
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

/*
  From `lg` up the header lists three routes inline and the call to action,
  and the menu trigger does not exist. Below `lg` the bar carries exactly two
  things — the mark and the trigger — and everything else, including the call
  to action, lives in the shutter menu (owner direction, 2026-08-06).
*/
test.describe("header", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("lists the primary routes inline on desktop, with no menu trigger", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.getByRole("banner");

    await expect(
      header.getByRole("link", { name: "Yuvoy home" }),
    ).toBeVisible();
    for (const label of ["Explore", "For Operators", "About"]) {
      await expect(
        header.getByRole("link", { name: label, exact: true }),
      ).toBeVisible();
    }
    await expect(
      header.getByRole("link", { name: /join waitlist/i }),
    ).toBeVisible();
    // The mark, the three primary routes, the call to action — nothing else.
    // A fourth nav item is a design change, not a routing one, so it should
    // fail here and be decided deliberately.
    await expect(header.getByRole("link")).toHaveCount(5);
    await expect(
      header.getByRole("button", { name: "Open menu" }),
    ).toBeHidden();
  });

  /*
    The mark sits on the bar's baseline, not in its middle (owner direction,
    2026-08-07). What is asserted is the relationship rather than a pixel
    value: it is nearer the bottom edge than the top, and it still clears that
    edge — flush against the hairline reads as a mistake, and overlapping it
    reads as a bug.
  */
  test("sits the mark on the bar's baseline", async ({ page }) => {
    await page.goto("/");
    const bar = page.getByRole("banner");
    const mark = bar.getByRole("link", { name: "Yuvoy home" });

    /*
      The LOCKUP's own box, not the link's. The link is `self-end` with bottom
      padding, so its box always ends at the bar's edge and measuring it would
      report the same numbers wherever the drawing inside it sat — the test
      would pass while the mark floated anywhere.
    */
    const barBox = (await bar.boundingBox())!;
    const markBox = (await mark.getByRole("img").boundingBox())!;
    const above = markBox.y - barBox.y;
    const below = barBox.y + barBox.height - (markBox.y + markBox.height);

    expect(
      below,
      `lockup should clear the bar's bottom edge, sits ${below}px from it`,
    ).toBeGreaterThan(1);
    expect(
      above,
      `lockup should sit low in the bar: ${above}px above, ${below}px below`,
    ).toBeGreaterThan(below);
  });

  /*
    The trigger disappears at `lg`, so an open panel must not survive the
    viewport growing past it — a rotation or a window snap would otherwise
    leave a modal on screen with no visible owner, and the page behind it
    locked.
  */
  test("closes the menu when the viewport grows to desktop", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(dialog).toBeHidden();
    // The scroll lock releases with it.
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });
});

/*
  The phone masthead. Two targets in 64 pixels, not four: the bar carried a
  centred operator link and a small waitlist button until 2026-08-06, which
  read as a toolbar and left the mark fighting for room. Both moved into the
  menu, where the call to action is pinned at full size.
*/
test.describe("header on a phone", () => {
  test.use({ viewport: MOBILE });

  test("carries only the mark and the menu trigger", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");

    await expect(
      header.getByRole("link", { name: "Yuvoy home" }),
    ).toBeVisible();
    await expect(
      header.getByRole("button", { name: "Open menu" }),
    ).toBeVisible();
    await expect(header.getByRole("link")).toHaveCount(1);
  });

  test("reaches every primary route through the menu", async ({ page }) => {
    await page.goto("/");
    await openMenu(page);
    const dialog = page.getByRole("dialog", { name: "Site menu" });

    for (const label of [
      "Explore",
      "For Operators",
      "About",
      "Journal",
      "Safety",
    ]) {
      await expect(
        dialog.getByRole("link", { name: label, exact: true }),
      ).toBeVisible();
    }
    await expect(
      dialog.getByRole("link", { name: /join waitlist/i }),
    ).toBeVisible();
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: MOBILE });

  test("opens, traps focus, and closes on Escape returning focus", async ({
    page,
  }) => {
    await page.goto("/");
    const trigger = await openMenu(page);

    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();

    // Tabbing cycles within the panel. Chromium parks focus on <body> for one
    // step as it wraps past the last element, which is the browser's own
    // behaviour and harmless — what must never happen is focus reaching an
    // interactive element behind the modal.
    const escapes: string[] = [];
    let returnedInside = false;
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const landed = await dialog.evaluate((el) => {
        const active = document.activeElement;
        if (!active) return { inside: false, escaped: null as string | null };
        if (el.contains(active)) return { inside: true, escaped: null };
        const neutral =
          active === document.body || active === document.documentElement;
        return {
          inside: false,
          escaped: neutral
            ? null
            : `${active.tagName}[${(active.textContent ?? "").trim().slice(0, 30)}]`,
        };
      });
      if (landed.escaped) escapes.push(`tab ${i + 1}: ${landed.escaped}`);
      if (landed.inside && i > 3) returnedInside = true;
    }
    expect(escapes, "focus reached content behind the modal").toEqual([]);
    expect(returnedInside, "focus never cycled back into the panel").toBe(true);

    // The real guarantee showModal() buys us: everything behind is inert, so
    // background content cannot be focused even when asked directly.
    const backgroundState = await page.evaluate(() => {
      const link = document.querySelector<HTMLElement>("header a");
      if (!link) return "no background link to test";
      link.focus();
      return document.activeElement === link ? "focusable" : "inert";
    });
    expect(backgroundState).toBe("inert");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("locks background scroll while open", async ({ page }) => {
    await page.goto("/");
    await openMenu(page);
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    await page.keyboard.press("Escape");
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });

  test("the primary call to action navigates and the panel closes", async ({
    page,
  }) => {
    await page.goto("/");
    await openMenu(page);

    await page
      .getByRole("dialog")
      .getByRole("link", { name: /join waitlist/i })
      .click();

    await expect(page.getByRole("dialog")).toBeHidden();
  });

  /*
    The call to action and the legal links are pinned below the scrolling link
    list, so they stay on screen however many routes the registry grows to.
    Before this was pinned, a longer nav pushed them out of view — reachable
    only by scrolling, and resolved against the wrong background by axe.
  */
  test("the call to action stays visible without scrolling as the nav grows", async ({
    page,
  }) => {
    await page.goto("/");
    await openMenu(page);

    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(
      dialog.getByRole("link", { name: /join waitlist/i }),
    ).toBeInViewport();
    for (const label of ["Privacy", "Terms"]) {
      await expect(dialog.getByRole("link", { name: label })).toBeInViewport();
    }
  });

  test("has no motion under prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await openMenu(page);

    const duration = await page
      .getByRole("dialog")
      .locator("> div")
      .evaluate((el) => getComputedStyle(el).animationDuration);
    // The global reduced-motion rule collapses every animation to ~0.
    expect(parseFloat(duration)).toBeLessThan(0.01);
  });
});

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * Wait for every finite animation to finish.
 *
 * Contrast is a property of the settled page: sampling mid-entrance measures
 * a half-faded element against whatever is behind it and reports failures that
 * do not exist once the animation lands. Two classes of motion never finish
 * and are skipped: infinite animations (the loading pulse), and anything
 * inside `[data-demo]` — the homepage tour re-arms finite animations for as
 * long as it is on screen, so waiting for it deadlocks. Both run only on
 * decorative surfaces; the demo's animated content is aria-hidden.
 */
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => {
      if (a.effect?.getTiming().iterations === Infinity) return true;
      if (a.playState === "finished") return true;
      const target =
        a.effect instanceof KeyframeEffect ? a.effect.target : null;
      return (
        target instanceof Element && target.closest("[data-demo]") !== null
      );
    }),
  );
}

/** Violations, flattened to one readable line per offending node. */
async function axeViolations(page: Page) {
  // Scanning a route that is still streaming means scanning the fallback, and
  // a fallback has no violations — a clean report that examined nothing. These
  // call sites navigate with the default `load`, which happens to make that
  // safe today; saying so explicitly means it stays safe if one ever doesn't.
  await waitForRouteReady(page);
  await settle(page);
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();
  return violations.flatMap((v) =>
    v.nodes.map(
      (n) =>
        `${v.id} @ ${n.target.join(" ")} — ${(n.failureSummary ?? v.help)
          .replace(/\s+/g, " ")
          .trim()}`,
    ),
  );
}

test.describe("accessibility", () => {
  for (const path of SHELL_ROUTES) {
    test(`${path} has no axe violations`, async ({ page }) => {
      await page.goto(path);
      expect(await axeViolations(page)).toEqual([]);
    });
  }

  test("the open mobile menu has no axe violations", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    await openMenu(page);

    expect(await axeViolations(page)).toEqual([]);
  });
});
