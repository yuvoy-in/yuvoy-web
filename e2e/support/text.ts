import type { Page } from "@playwright/test";

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
 * ## The preview exception
 *
 * `excludePreview` removes `[data-preview]` — the phone tour, which is the one
 * owner-approved place illustrative prices and seat counts may appear
 * (docs/DESIGN_SYSTEM.md §8). Any spec that passes it should also assert the
 * caption that justifies the exception is present, or the exception becomes a
 * hole rather than a carve-out.
 */
export async function pageText(
  page: Page,
  { excludePreview = false }: { excludePreview?: boolean } = {},
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

    `<main>` is the signal because every route renders one and the loading
    fallback renders none, so this is a structural check rather than a string
    match against fallback copy that could be reworded. Every spec that reads
    page text gets the fix by using this helper.
  */
  await page.locator("main").first().waitFor({ state: "attached" });

  return page.evaluate((dropPreview) => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    // Scripts and styles are not content. The dev overlay and the route
    // announcer are the framework talking to itself.
    clone
      .querySelectorAll(
        "script, style, template, next-route-announcer, nextjs-portal",
      )
      .forEach((node) => node.remove());
    if (dropPreview) {
      clone.querySelectorAll("[data-preview]").forEach((node) => node.remove());
    }
    return clone.textContent ?? "";
  }, excludePreview);
}

/** How many times a pattern occurs in the page's readable text. */
export async function countInPage(
  page: Page,
  pattern: RegExp,
  options?: { excludePreview?: boolean },
): Promise<number> {
  const text = await pageText(page, options);
  const global = new RegExp(
    pattern.source,
    pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`,
  );
  return (text.match(global) ?? []).length;
}
