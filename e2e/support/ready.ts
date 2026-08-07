import type { Page } from "@playwright/test";

/**
 * Wait until a route's own markup is **on the page**, rather than parked in
 * React's streaming staging area.
 *
 * ## Why `state: "attached"` on `<main>` was not enough
 *
 * It was the previous guard here, and it is wrong in a way that only shows up
 * under load. React streams a suspended segment by first sending the fallback,
 * then appending the real markup to the end of `<body>` inside a hidden
 * container, then running an inline script that swaps the two. Probing the DOM
 * mid-stream finds this:
 *
 * ```
 * h1        [display=block]      ← looks fine
 * main      [display=block]      ← looks fine
 * div#S:0   [display=none; hidden]   ← but the whole subtree is in here
 * body
 * ```
 *
 * The route's `<main>` is genuinely attached, so the wait returned
 * immediately — against a subtree that is not rendered, has no layout, and is
 * about to be moved. Everything measured afterwards was measured on nothing:
 *
 * - **Structure checks** counted the staged `<h1>` alongside the one already in
 *   place and reported "2 h1 elements, expected 1" on `/operators`, `/waitlist`
 *   and `/journal`. The pages have one each; the served HTML proves it.
 * - **Overflow checks** measured elements with a zero-size bounding box, so a
 *   real overflow at that moment could not be detected at all.
 * - Worst, the **truthfulness guards** (`not.toMatch` on prices, ratings and
 *   review counts) read the staged copy and passed on text that had not been
 *   examined. A forbidden claim could have shipped with a green suite — the
 *   same vacuous-pass failure mode as the `loading.tsx` bug this guard was
 *   originally added to fix.
 *
 * ## Why `main:visible` is the right signal
 *
 * The staging container is `display: none`, so nothing inside it is visible,
 * while the swapped-in copy has layout. Visibility is therefore the exact
 * boundary between "streamed" and "rendered", and Playwright polls it rather
 * than sampling once.
 *
 * It is deliberately matched by selector rather than by index: the document
 * holds two `<main>` elements, and which one comes first in DOM order is
 * React's business, not this suite's.
 *
 * ## Under `next dev` the container does not go away
 *
 * Worth stating because it is the surprising part, and assuming otherwise
 * sends you looking for a race that is not there: against the dev server
 * `div#S:0` and its contents **stay in the DOM**. Waiting longer does not
 * clean them up — it only makes them reliably present, which is why a
 * duplicate CI hit on one viewport turns into all six once the wait is right.
 *
 * It is specific to the dev server, and measured rather than assumed — the
 * same four routes, same probe, one against `next dev` and one against
 * `next build && next start`:
 *
 * ```
 *              stagingBlocks  h1  main
 *   dev  /operators      1     2    2
 *   dev  /journal        1     2    2
 *   build every route    0     1    1
 * ```
 *
 * So the site does not ship this; a dev server does. CI therefore runs against
 * a production build (see `playwright.config.ts`), which removes the cause.
 * What follows is kept because a local `pnpm test:e2e` still uses `next dev`,
 * and a helper that only works in CI is not much of a helper.
 *
 * A wait alone cannot make `document.querySelectorAll` trustworthy there.
 * Anything that counts or reads across the whole document must also ignore
 * that subtree: structural counts filter to elements that have layout, and
 * `pageText` drops `[hidden]`. Checks that already skip zero-size boxes —
 * overflow, tap targets — are unaffected by construction.
 *
 * ## Why a visible `<main>` is not the whole signal
 *
 * It is the boundary for the *shell*, not for the route's content. Under the
 * suite's parallel workers `/waitlist` reached a state with a visible `<main>`
 * whose heading still had no layout, and the structure check duly reported
 * "0 h1 elements, expected 1" — passing on its own and failing once every
 * worker was competing for the same `next dev` process.
 *
 * That is worth more than one flaky test, because it is the vacuous pass in
 * miniature: at that instant `pageText` would have read a page whose content
 * had not rendered, and every `not.toMatch` guard on it — prices, ratings,
 * review counts — would have passed without examining anything.
 *
 * So readiness also requires a heading with layout. Every route on this site
 * renders exactly one `<h1>`; that is asserted, not assumed, by the structure
 * check in `shell.spec.ts`.
 *
 * Both waits inherit the suite's configured timeout rather than carrying one of
 * their own. A bounded wait that swallows its own timeout was tried first and
 * is worse than it looks: under load it gives up quietly and lets the *next*
 * assertion fail instead, so `/go/ferry` reported "0 h1 elements, expected 1"
 * — a page-structure defect that was nothing of the kind. Failing at the wait
 * names the actual problem (`h1:visible` never appeared), and CI's `retries`
 * are what absorb genuine infrastructure blips. A route with no `<h1>` at all
 * is a real defect either way, and still fails.
 *
 * Nothing here waits on images. `next/image` sits in a CSS aspect-ratio box, so
 * layout is final before any pixel decodes — which is what lets this stay off
 * `networkidle`, whose per-variant image re-encoding under `next dev` used to
 * hang `/explore` even at a 120s budget.
 */
export async function waitForRouteReady(page: Page): Promise<void> {
  await page.locator("main:visible").first().waitFor();
  await page.locator("h1:visible").first().waitFor();
}
