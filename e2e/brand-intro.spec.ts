import { test, expect, type Page } from "@playwright/test";

/*
 * The brand veil: plays once per tab session over the settled page, then
 * removes itself; repeat pageloads and reduced-motion visitors never see it.
 * The decision happens in a pre-paint inline script, so "never see it" is
 * assertable immediately after load — a veil that was going to play is
 * visible from the first frame.
 *
 * This file deliberately imports `@playwright/test` rather than the suite's
 * returning-visitor fixture (`e2e/support/session.ts`): it is the one place
 * that wants a clean session, because the veil is its subject.
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

  /*
   * The lock is why the veil has to yield to a gesture: a page that answers
   * nothing is indistinguishable from a hung one. Asserted with programmatic
   * scrolls, so the gesture-skip below is not what is being measured here.
   */
  test("locks the page while it plays and releases it on the way out", async ({
    page,
    request,
  }) => {
    /*
      Compile the route before measuring it.

      The lock is applied by an effect, so it lands at hydration — while the
      veil's ~3.4s choreography has been running since first paint. Under
      `next dev` with the suite's seven workers, a cold compile can push
      hydration past the end of that window, and the lock is then applied to
      a veil that is already leaving: the assertion sees an unlocked page and
      the test fails on timing rather than on behaviour. It began failing when
      the app grew a route, which is exactly how a marginal test announces
      itself.

      A server-side request compiles `/` without touching this context's
      `sessionStorage`, so the veil still plays on the navigation below — the
      subject of the test is untouched, only the dev server's warm-up is
      taken out of the measurement.
    */
    await request.get("/");

    await page.goto("/");
    await expect(veil(page)).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute(
      "style",
      /overflow:\s*hidden/,
    );

    await page.evaluate(() => window.scrollTo(0, 600));
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await expect(veil(page)).toHaveCount(0, { timeout: 8_000 });
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(0);
  });

  test("a scroll gesture dismisses it", async ({ page }) => {
    await page.goto("/");
    await expect(veil(page)).toBeVisible();

    // As with the keypress: the listener arrives with hydration, so keep
    // asking until the veil leaves.
    await expect(async () => {
      await page.mouse.wheel(0, 240);
      await expect(veil(page)).toHaveCount(0, { timeout: 400 });
    }).toPass({ timeout: 6_000 });
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
