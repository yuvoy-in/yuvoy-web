import { test, expect } from "./support/session";
import type { Locator } from "@playwright/test";

import { waitForRouteReady } from "./support/ready";
import { SHELL_ROUTES, MOBILE, openMenu } from "./support/shell-kit";

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
    The business page is `/hosts` and the portal is hosts.yuvoy.in, since
    D-049 (yuvoy-mobile#397).

    `/operators` still answers, with a permanent redirect, so a link left on
    it would not look broken: it would cost every visitor one more hop and
    keep the old word in the address bar for a moment. Nothing on the page
    shows the difference, so the hrefs themselves are read, in the header
    (desktop), the footer and the menu (phone), where the business page is
    linked from.
  */
  test("links the business page and the portal by their new names", async ({
    page,
  }) => {
    const hrefsIn = (scope: Locator) =>
      scope
        .getByRole("link")
        .evaluateAll((links) =>
          links.map((l) => (l as HTMLAnchorElement).getAttribute("href") ?? ""),
        );

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const header = page.getByRole("banner");
    const footer = page.getByRole("contentinfo");

    await expect(
      header.getByRole("link", { name: "For Hosts", exact: true }),
    ).toHaveAttribute("href", "/hosts");
    await expect(
      footer.getByRole("link", { name: "Host sign-in", exact: true }),
    ).toHaveAttribute("href", "https://hosts.yuvoy.in");
    await expect(footer.getByText("Operator sign-in")).toHaveCount(0);
    // Read before the menu opens: the open dialog takes the page behind it
    // out of the accessibility tree.
    const hrefs = [...(await hrefsIn(header)), ...(await hrefsIn(footer))];

    await page.setViewportSize(MOBILE);
    await openMenu(page);
    const menu = page.getByRole("dialog", { name: "Site menu" });
    await expect(
      menu.getByRole("link", { name: "For Hosts", exact: true }),
    ).toHaveAttribute("href", "/hosts");
    hrefs.push(...(await hrefsIn(menu)));

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(
        href,
        "a link still goes through the /operators redirect",
      ).not.toMatch(/^\/operators(?:[/?#]|$)/);
      expect(href, "a link still names the old portal address").not.toContain(
        "operators.yuvoy.in",
      );
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
