import { test, expect } from "./support/session";
import { pageText } from "./support/text";

/**
 * /safety is the highest-risk page on the site: a claim here that turns out to
 * be untrue is not a marketing problem, it is a person in the water.
 *
 * These tests encode the rule that no unbacked assurance may appear. They are
 * phrased as "this word must not appear in an assurance-shaped sentence"
 * rather than "must not appear at all", because the page has to be able to
 * *name* the things it has not built — that naming is the point of the page.
 */
test.describe("/safety", () => {
  test("names every gap instead of leaving it unmentioned", async ({
    page,
  }) => {
    await page.goto("/safety");
    const body = await pageText(page);

    /*
      Each of these must be explicitly disclaimed somewhere on the page.

      The page was simplified on 2026-08-06 from two full sections into a list
      of standards plus one status panel. **No disclosure was dropped**, which
      is exactly what this test exists to hold: if a future edit tightens the
      panel and one of these disappears, the gap has been hidden rather than
      fixed, and on a page about open water that is the failure mode that
      matters.
    */
    for (const gap of [
      /no operator on yuvoy has been verified by us/i,
      /no cancellation or refund policy has been written or approved/i,
      /none of it is collected anywhere on this site/i,
      /incident reporting and on-the-ground support are planned, not running/i,
    ]) {
      expect(body, `missing disclosure: ${gap}`).toMatch(gap);
    }
  });

  test("makes no assurance it cannot back", async ({ page }) => {
    await page.goto("/safety");
    const body = await pageText(page);

    // Present-tense assurances that would be false today.
    const FALSE_ASSURANCES = [
      /\ball operators are (verified|vetted|checked)\b/i,
      /\bfully (insured|covered)\b/i,
      /\bwe verify\b/i,
      /\bwe vet\b/i,
      /\bguaranteed refund\b/i,
      /\bmoney[- ]back\b/i,
      /\bcertified operators\b/i,
      /\bsafety guaranteed\b/i,
    ];
    for (const claim of FALSE_ASSURANCES) {
      expect(body, `/safety must not assert ${claim}`).not.toMatch(claim);
    }
  });

  test("agrees with /explore rather than contradicting it", async ({
    page,
  }) => {
    /*
      Both surfaces make the same promise about conditions, in the same
      words: the sea decides, and a booking does not override that. If one is
      ever softened without the other, this fails.

      It used to be asserted between /safety and the homepage's registration
      FAQ. That FAQ came down to three questions on 2026-08-06 and the safety
      answer moved to where someone looking for it actually goes — /explore's
      "what to expect" section, and this page.
    */
    const PROMISE = /take priority over completing a booking/i;

    await page.goto("/safety");
    expect(await pageText(page)).toMatch(PROMISE);

    await page.goto("/explore");
    expect(await pageText(page)).toMatch(PROMISE);
  });
});
