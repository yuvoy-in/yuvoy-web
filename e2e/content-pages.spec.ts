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
  The application was a "Coming soon" notice rather than a form until
  2026-08-07, because the deployed API still required fields the form had
  stopped asking for and answered 400 to every applicant. `yuvoy-in/yuvoy-api#4`
  shipped and the real form returned to both surfaces at once.
*/
test("audience pages send each audience to the right form", async ({
  page,
}) => {
  /*
    Travellers: the app is the primary path now (yuvoy-web#154), and the
    waitlist survives as the secondary one — it is still the only way to hear
    about a destination the first season does not cover.

    Both are asserted, because the risk in that change is losing the waitlist
    rather than gaining the app.
  */
  await page.goto("/explore");
  await expect(
    page.getByRole("link", { name: "Browse experiences" }).first(),
  ).toHaveAttribute("href", /^https:\/\/app\.yuvoy\.in\/\?/);
  await page
    .getByRole("link", { name: "Tell us where you want to go" })
    .first()
    .click();
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
  // The application itself, not a notice standing in for it.
  await expect(
    page.locator("#apply").getByLabel("Business name"),
  ).toBeVisible();
  await expect(
    page.locator("#apply").getByRole("button", {
      name: "Apply as a founding operator",
    }),
  ).toBeVisible();
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

/*
  The closing waitlist act is an allowlist, not a habit (owner direction,
  2026-08-08).

  It used to run under every route that did not explicitly opt out, which put
  the same full-width ask beneath the legal pages, the safety page, the contact
  page and the journal index. The header carries "Join Waitlist" on every page,
  so the footer asks only where the ask is earned: at the foot of a page
  somebody read to the bottom, about one place or one idea, with no conversion
  of its own.

  Asserted both ways round. A test that only checks the absences would pass
  just as happily if the act were deleted altogether.
*/
test.describe("the footer's closing call to action", () => {
  const CLOSES_WITH_THE_ASK = [
    "/destinations/havelock",
    "/journal/why-the-andamans",
  ];

  const DOES_NOT = [
    "/", // closes on the registration form itself
    "/waitlist", // is the form
    "/operators", // closes on the application
    "/explore",
    "/about",
    "/contact", // a conversation, not a conversion
    "/safety",
    "/privacy",
    "/terms",
    "/journal", // a list is browsing, not finishing
  ];

  for (const path of CLOSES_WITH_THE_ASK) {
    test(`${path} closes with it`, async ({ page }) => {
      await page.goto(path);
      await expect(
        page
          .getByRole("contentinfo")
          .getByRole("heading", { name: /be first to experience yuvoy/i }),
      ).toBeVisible();
    });
  }

  for (const path of DOES_NOT) {
    test(`${path} does not`, async ({ page }) => {
      await page.goto(path);
      await expect(
        page
          .getByRole("contentinfo")
          .getByRole("heading", { name: /be first to experience yuvoy/i }),
      ).toHaveCount(0);
    });
  }
});
