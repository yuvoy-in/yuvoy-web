import type { Page } from "@playwright/test";

import { waitForRouteReady } from "./ready";

/**
 * A page's text, as a reader would meet it — and never as the framework
 * leaves it lying around.
 *
 * ## Why `page.textContent("body")` is the wrong tool
 *
 * `textContent` includes `<script>` elements, and in dev mode Next embeds the
 * entire RSC flight payload in exactly such a script inside the body. Every
 * string the page renders therefore appears **twice**: once in the DOM and
 * once in that payload. Assertions that count occurrences ("this is stated
 * exactly once") silently see double, and assertions that forbid a phrase
 * report a match against markup nobody can read. Both cost a debugging
 * session on 2026-08-06.
 *
 * `innerText` would exclude scripts but also excludes anything not currently
 * displayed — which on this site means every collapsed `<details>` answer,
 * and those are exactly the claims that must stay honest. So this walks the
 * DOM instead: it takes all the text, and drops only the parts that are not
 * content.
 *
 * ## Leaving a region out
 *
 * `exclude` drops every element matching a selector. The homepage passes
 * `[data-live-listing]`: the listing read from the API is the one place a
 * price may appear, because it is the API's price (docs/DESIGN_SYSTEM.md §8).
 * It used to be `excludePreview`, which exempted a mock tour from the same
 * rule, and an exempt region is where a rule stops being checked: the tour
 * carried an invented operator for six weeks (yuvoy-web#171). Exclude real
 * data only, never something this repository wrote.
 */
export async function pageText(
  page: Page,
  { exclude }: { exclude?: string } = {},
): Promise<string> {
  /*
    Wait for the route to have rendered before reading a single character.

    **This is not belt and braces, it is the fix for a real failure.** Reading
    text is a one-shot operation: unlike `expect(...).toContainText()`, which
    polls, `textContent` returns whatever is in the DOM at that instant and
    never looks again. `page.goto` resolves on load, which under `next dev`
    can be while the route is still compiling — so the read captured
    `loading.tsx` ("Loading Yuvoy", the header and the footer, no content) and
    the assertion failed on a page that was about to be perfectly correct. It
    reproduced twice under the suite's seven parallel workers and passed every
    time the test was run alone, which is exactly how this class of bug hides.

    A *visible* `<main>` is the signal because every route renders one, the
    loading fallback renders none, and React's streaming staging container is
    hidden — so this is a structural check rather than a string match against
    fallback copy that could be reworded. See `waitForRouteReady`: waiting for
    `attached` instead was letting this read staged markup and pass without
    examining the page. Every spec that reads page text gets the fix by using
    this helper.
  */
  await waitForRouteReady(page);

  return page.evaluate((dropSelector) => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    // Scripts and styles are not content. The dev overlay and the route
    // announcer are the framework talking to itself.
    clone
      .querySelectorAll(
        "script, style, template, next-route-announcer, nextjs-portal",
      )
      .forEach((node) => node.remove());
    /*
      React's streaming staging container — `<div hidden id="S:0">` — holds a
      full second copy of the route's markup and is never removed. Reading
      through it doubles every string on the page, which is the exact failure
      the note above describes for the dev flight payload, arriving by a
      different door: "stated exactly once" assertions see two, and a phrase
      forbidden on the page matches a copy nobody can read.

      `[hidden]` is the right net rather than `#S\\:0` specifically: the
      attribute means "not shown", so anything the site itself hides is not
      text a reader meets either. Collapsed `<details>` are unaffected — a
      closed disclosure is hidden by the UA, not by this attribute — so the
      claims inside them still get checked, which is the point of walking the
      DOM here instead of using `innerText`.
    */
    clone.querySelectorAll("[hidden]").forEach((node) => node.remove());
    if (dropSelector) {
      clone.querySelectorAll(dropSelector).forEach((node) => node.remove());
    }
    return clone.textContent ?? "";
  }, exclude ?? null);
}

/** How many times a pattern occurs in the page's readable text. */
export async function countInPage(
  page: Page,
  pattern: RegExp,
  options?: { exclude?: string },
): Promise<number> {
  const text = await pageText(page, options);
  const global = new RegExp(
    pattern.source,
    pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`,
  );
  return (text.match(global) ?? []).length;
}
