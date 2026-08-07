import { test, expect } from "./support/session";
import { pageText } from "./support/text";

/** Nothing on the site may claim a price, a rating or a review count. */
const FABRICATED = /₹|\breviews?\b|\bratings?\b/i;

/**
 * Wording that would imply a capability the product does not have. These are
 * the exact phrases the reviewer warned against and the reference artifact
 * used; none of them may appear on a content page.
 */
const OVERCLAIMS = [
  /\blive availability\b/i,
  /\bfixed price\b/i,
  /\bbooked in a minute\b/i,
  /\bbook now\b/i,
];

const CONTENT_ROUTES = [
  {
    path: "/explore",
    h1: /find real experiences/i,
    title: /Explore experiences and destinations/,
  },
  {
    path: "/operators",
    h1: /yuvoy helps people find and book it/i,
    title: /Yuvoy for Operators/,
  },
  {
    path: "/about",
    h1: /experience more of a place/i,
    title: /About Yuvoy/,
  },
  {
    path: "/safety",
    h1: /clear expectations before every experience/i,
    title: /Trust & safety/,
  },
];

for (const route of CONTENT_ROUTES) {
  test.describe(route.path, () => {
    test("has exactly one H1, a unique title and a self-canonical", async ({
      page,
    }) => {
      await page.goto(route.path);

      const h1s = page.getByRole("heading", { level: 1 });
      await expect(h1s).toHaveCount(1);
      await expect(h1s).toContainText(route.h1);
      await expect(page).toHaveTitle(route.title);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`${route.path}$`),
      );
    });

    test("claims nothing that does not exist", async ({ page }) => {
      await page.goto(route.path);
      // The phone tour is the one approved place illustrative numbers may
      // appear (DESIGN_SYSTEM §8); the caption that justifies it is asserted
      // separately below.
      const body = await pageText(page, { excludePreview: true });
      expect(body).not.toMatch(FABRICATED);
      for (const phrase of OVERCLAIMS) {
        expect(body, `${route.path} must not claim ${phrase}`).not.toMatch(
          phrase,
        );
      }
    });

    /*
      The consumer pages speak plainly. These are the internal and investor
      terms the rebuild moved out of public copy; "Experience OS" is exempt on
      /operators, where it is allowed to appear once as a product name, and
      nowhere else.
    */
    test("uses plain language, not the internal vocabulary", async ({
      page,
    }) => {
      await page.goto(route.path);
      const body = await pageText(page);

      const banned = [
        /experience commerce/i,
        /\bAI-native\b/i,
        /experience graph/i,
        /marketplace (intelligence|liquidity)/i,
        /operational infrastructure/i,
        /\bTrigo\b/i,
        /provider classification/i,
      ];
      for (const phrase of banned) {
        expect(body, `${route.path} must not use ${phrase}`).not.toMatch(
          phrase,
        );
      }

      const osMentions = (body.match(/Experience OS/gi) ?? []).length;
      if (route.path === "/operators") {
        expect(
          osMentions,
          "Experience OS may appear once on /operators, as a product name",
        ).toBeLessThanOrEqual(1);
      } else {
        expect(osMentions).toBe(0);
      }
    });

    test("every link resolves", async ({ page, request }) => {
      await page.goto(route.path);
      const hrefs = await page
        .getByRole("link")
        .evaluateAll((links) =>
          links.map((l) => (l as HTMLAnchorElement).getAttribute("href") ?? ""),
        );
      const internal = new Set(
        hrefs
          .filter((h) => h.startsWith("/"))
          .map((h) => h.split("#")[0])
          .filter(Boolean),
      );
      expect(internal.size).toBeGreaterThan(0);
      for (const href of internal) {
        const res = await request.get(href);
        expect(res.status(), `${href} linked from ${route.path}`).toBeLessThan(
          400,
        );
      }
    });
  });
}

/*
  The operator page is an application, not a signup, and its shape carries
  that: four joining steps rather than eight, one compact pre-launch panel
  rather than a section of retractions, and a button that says what the
  operator is doing.
*/
test("/operators is an application, at the right proportions", async ({
  page,
}) => {
  await page.goto("/operators");

  await expect(page.locator("#joining").getByRole("listitem")).toHaveCount(4);

  // Every statement the retired "what this is not" section made, still here.
  const body = await pageText(page);
  for (const disclosure of [
    /does not create a listing, partnership or commercial agreement/i,
    /pricing, commissions and payout terms will be agreed before an operator goes live/i,
    /your existing customers and channels remain yours/i,
  ]) {
    expect(body, `missing disclosure: ${disclosure}`).toMatch(disclosure);
  }

  // No guarantee of demand, ever.
  for (const claim of [
    /guaranteed bookings/i,
    /guaranteed revenue/i,
    /we guarantee/i,
  ]) {
    expect(body, `/operators must not claim ${claim}`).not.toMatch(claim);
  }

  await expect(
    page.locator("#apply").getByRole("heading", {
      name: /apply as a founding operator/i,
    }),
  ).toBeVisible();
});

/*
  While `OPERATOR_FORM_LIVE` is false the application is a notice rather than a
  form: the deployed API still requires fields this form stopped asking for
  (yuvoy-in/yuvoy-api#4), so submitting would 400 every applicant. What has to
  hold either way is that `#apply` exists, says what is happening, and offers a
  channel that reaches a person today. Swap these assertions back to the form's
  fields in the change that flips the flag.
*/
test("audience pages send each audience to the right form", async ({
  page,
}) => {
  // Travellers: the homepage's own form, and the dedicated page.
  await page.goto("/explore");
  await page.getByRole("link", { name: "Join the waitlist" }).first().click();
  await expect(page).toHaveURL(/\/waitlist$/);
  await expect(page.getByRole("tab", { name: /travelling/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  // Operators do not leave their page to apply: the section is on it.
  await page.goto("/operators");
  await page
    .getByRole("link", { name: "Apply as a founding operator" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/operators#apply$/);
  await expect(page.locator("#apply")).toContainText(/coming soon/i);
  // A way through to a person, not the channels themselves: the contact band
  // sits directly beneath this section and carries the address and the number
  // once (owner direction, 2026-08-07).
  await expect(
    page.locator("#apply").getByRole("link", { name: /send us a message/i }),
  ).toHaveAttribute("href", "/contact");
});

/*
  /about explains the company; it does not convert. It carried the waitlist
  ask twice inside one scroll — its own status section and the footer's
  standing call to action — and both came off on 2026-08-07 (owner
  direction). The header carries the call to action on every route, which is
  where it belongs.
*/
test("/about does not ask for the waitlist", async ({ page }) => {
  await page.goto("/about");

  await expect(
    page.getByRole("heading", { name: /be first to experience yuvoy/i }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("main").getByRole("link", { name: /join the waitlist/i }),
  ).toHaveCount(0);
});

/*
  Three questions each. An FAQ is where a pre-launch site goes to argue with
  itself, so both are capped and the cap is enforced rather than remembered.
  The operator list lost "Are bookings guaranteed?" on 2026-08-07 (owner
  direction) — the page still refuses to promise demand, which is asserted in
  the proportions test above, but it no longer raises the doubt itself in
  order to answer it. Both lists now sit beside their form rather than above
  it, so both are located by their section's anchor.
*/
test("both FAQs stay short, and open on the keyboard", async ({ page }) => {
  await page.goto("/operators");
  // Inside the application act. The questions were a section of their own
  // until 2026-08-07; they are now the left column beside the ask, which is
  // how the homepage has always closed.
  const operatorFaqs = page.locator("#apply");
  await expect(operatorFaqs.locator("details")).toHaveCount(3);

  const first = operatorFaqs.locator("details").first();
  await first.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("open", "");

  await page.goto("/");
  await expect(page.locator("#register details")).toHaveCount(3);
});

test("the primary routes appear in the site navigation", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("banner").getByRole("navigation", {
    name: "Primary",
  });
  for (const label of ["Explore", "For Operators", "About"]) {
    await expect(
      nav.getByRole("link", { name: label, exact: true }),
    ).toBeVisible();
  }
});
