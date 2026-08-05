import { test, expect, type Page } from "@playwright/test";

/*
 * The brand veil: plays once per tab session over the settled page, then
 * removes itself; repeat pageloads and reduced-motion visitors never see it.
 * The decision happens in a pre-paint inline script, so "never see it" is
 * assertable immediately after load — a veil that was going to play is
 * visible from the first frame.
 */

const veil = (page: Page) => page.locator("#yuvoy-intro");

test.describe("brand intro veil", () => {
  test("plays on the session's first load, then never again", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(veil(page)).toBeVisible();

    // The choreography ends at ~2.5s and React removes the node; the page
    // underneath was interactive the whole time.
    await expect(veil(page)).toHaveCount(0, { timeout: 8_000 });

    await page.reload();
    // Same tab, stamped session: the veil stays display:none until hydration
    // removes it. It must never become visible again.
    await expect(veil(page)).toBeHidden();
  });

  test("any keypress dismisses it early", async ({ page }) => {
    await page.goto("/");
    await expect(veil(page)).toBeVisible();

    // The keydown listener arrives with hydration, which may land a beat
    // after first paint: keep pressing until the veil leaves the tree.
    await expect(async () => {
      await page.keyboard.press("Escape");
      await expect(veil(page)).toHaveCount(0, { timeout: 300 });
    }).toPass({ timeout: 5_000 });
  });

  test("never exists under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    // Fresh context, so no session flag: only the media query stands between
    // this visitor and the veil, and it must be enough.
    await expect(veil(page)).toBeHidden();
  });
});
