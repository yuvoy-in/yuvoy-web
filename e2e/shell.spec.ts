import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Routes that exist today and must all render inside the shell. */
const SHELL_ROUTES = [
  "/",
  "/waitlist",
  "/how-it-works",
  "/travellers",
  "/operators",
  "/experiences",
  "/destinations",
  "/destinations/havelock",
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
        header.getByRole("link", { name: "Yuvoy — home" }),
      ).toBeVisible();

      // Sticky: still on screen after scrolling to the bottom of the document.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
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

  test("footer publishes no placeholder contact channel", async ({ page }) => {
    await page.goto("/");
    const footer = await page.getByRole("contentinfo").textContent();
    // A contact row ships only when a real, monitored channel is confirmed.
    expect(footer).not.toMatch(/@|mailto:|wa\.me/i);
  });

  /*
    Two whole-page structural checks that a screenshot cannot make for you,
    and that axe's WCAG-tagged rules do not cover.
  */
  for (const path of SHELL_ROUTES) {
    test(`${path} has sound structure at every breakpoint`, async ({
      page,
    }) => {
      const problems: string[] = [];

      for (const viewport of [
        { name: "mobile", width: 390, height: 844 },
        { name: "tablet", width: 834, height: 1112 },
        { name: "desktop", width: 1440, height: 900 },
      ]) {
        await page.setViewportSize(viewport);
        await page.goto(path, { waitUntil: "networkidle" });

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

        // Exactly one h1, and heading levels never skip on the way down.
        const levels = await page.evaluate(() =>
          [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((el) =>
            Number(el.tagName.substring(1)),
          ),
        );
        const h1Count = levels.filter((level) => level === 1).length;
        if (h1Count !== 1) {
          problems.push(`${viewport.name}: ${h1Count} h1 elements, expected 1`);
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
      await page.setViewportSize(MOBILE);
      await page.goto(path, { waitUntil: "networkidle" });

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
 * do not exist once the animation lands. Infinite animations (the loading
 * pulse) never finish and are skipped — they run only on decorative elements.
 */
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (a) =>
          a.effect?.getTiming().iterations === Infinity ||
          a.playState === "finished",
      ),
  );
}

/** Violations, flattened to one readable line per offending node. */
async function axeViolations(page: Page) {
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
