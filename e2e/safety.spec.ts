import { test, expect } from "@playwright/test";

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
    const body = (await page.textContent("body")) ?? "";

    // Each of these must be explicitly disclaimed somewhere on the page.
    for (const gap of [
      /no operator on yuvoy has been verified by us/i,
      /no policy has been written or approved/i,
      /none of it is built/i,
    ]) {
      expect(body, `missing disclosure: ${gap}`).toMatch(gap);
    }
  });

  test("makes no assurance it cannot back", async ({ page }) => {
    await page.goto("/safety");
    const body = (await page.textContent("body")) ?? "";

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

  test("agrees with the homepage FAQ rather than contradicting it", async ({
    page,
  }) => {
    // Both surfaces make the same promise: transparency about what a day
    // requires, and a willingness to lose a booking over it. If one is ever
    // softened without the other, this fails.
    const PROMISE = /rather lose a booking than overstate/i;

    await page.goto("/safety");
    expect(await page.textContent("body")).toMatch(PROMISE);

    // The homepage FAQ is a collapsed <details>; its text is in the DOM.
    await page.goto("/");
    expect(await page.textContent("body")).toMatch(PROMISE);
  });
});
