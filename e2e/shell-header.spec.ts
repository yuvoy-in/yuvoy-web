import { test, expect, type Page } from "./support/session";
import AxeBuilder from "@axe-core/playwright";

import { waitForRouteReady } from "./support/ready";
import { SHELL_ROUTES, MOBILE, openMenu } from "./support/shell-kit";

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
    for (const label of ["Explore", "For Hosts", "About"]) {
      await expect(
        header.getByRole("link", { name: label, exact: true }),
      ).toBeVisible();
    }
    await expect(
      header.getByRole("link", { name: /browse experiences/i }),
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
      "For Hosts",
      "About",
      "Journal",
      "Safety",
    ]) {
      await expect(
        dialog.getByRole("link", { name: label, exact: true }),
      ).toBeVisible();
    }
    await expect(
      dialog.getByRole("link", { name: /browse experiences/i }),
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
      .getByRole("link", { name: /browse experiences/i })
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
      dialog.getByRole("link", { name: /browse experiences/i }),
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
 * pulse) never finish and are skipped; they run only on decorative surfaces.
 *
 * There used to be a second exemption, for the homepage tour, which re-armed
 * finite animations for as long as it was on screen. The tour went with
 * yuvoy-web#171, so every finite animation on every page is waited for now.
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
