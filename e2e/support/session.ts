import { test as base } from "@playwright/test";

/**
 * The suite's default `test`: a returning visitor, for whom the brand veil
 * has already played.
 *
 * The veil (see `src/components/brand/brand-intro.tsx`) is a once-per-tab
 * entrance that covers the viewport for ~3.4s and locks scroll while it
 * runs. Every Playwright test gets a fresh context, so without this the
 * entrance replays in front of all 154 specs — none of which are about it.
 * That cost two real failures on 2026-08-06 (`shell.spec.ts` scrolled while
 * the veil held the lock, so nothing moved) and would have kept costing
 * flakes and wall-clock forever.
 *
 * Seeding the session flag makes every spec state its subject honestly: a
 * header test tests the header. The veil's own behaviour — that it plays,
 * that it plays only once, that a gesture dismisses it, that reduced motion
 * never sees it — is asserted in `e2e/brand-intro.spec.ts`, which imports
 * `@playwright/test` directly and therefore starts from a clean session.
 *
 * The key is duplicated from `STORAGE_KEY` in the component rather than
 * imported: pulling a "use client" React module into the Playwright runtime
 * would drag Next and React in with it. `brand-intro.test.tsx` asserts the
 * component's script carries this exact string, so a rename cannot pass
 * unnoticed.
 */
const INTRO_PLAYED_KEY = "yuvoy.intro-played";

export const test = base.extend({
  // Playwright calls the second argument `use`; it is `run` here because
  // the react-hooks lint rule reads a bare `use(...)` call as React's `use`
  // hook and fails the build. The name is positional, so nothing else cares.
  page: async ({ page }, run) => {
    await page.addInitScript((key: string) => {
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        // Storage can be unavailable (about:blank, blocked cookies). The
        // veil's own script fails open the same way, so there is nothing
        // to do here but let the test proceed.
      }
    }, INTRO_PLAYED_KEY);
    await run(page);
  },
});

export { expect, type Page } from "@playwright/test";
