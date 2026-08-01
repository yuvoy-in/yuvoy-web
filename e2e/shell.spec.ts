import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Routes that exist today and must all render inside the shell. */
const SHELL_ROUTES = ["/", "/waitlist", "/go/ferry", "/privacy", "/terms"];

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
