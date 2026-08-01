import { test, expect } from "@playwright/test";

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
    path: "/how-it-works",
    h1: /two separate journeys/i,
    title: /How it works/,
  },
  {
    path: "/travellers",
    h1: /before you are on the boat/i,
    title: /For travellers/,
  },
  { path: "/operators", h1: /show it properly/i, title: /For operators/ },
  { path: "/safety", h1: /the sea deserves respect/i, title: /Safety/ },
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
      const body = await page.textContent("body");
      expect(body).not.toMatch(FABRICATED);
      for (const phrase of OVERCLAIMS) {
        expect(body, `${route.path} must not claim ${phrase}`).not.toMatch(
          phrase,
        );
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

test("/how-it-works keeps the two journeys separate and marks what is planned", async ({
  page,
}) => {
  await page.goto("/how-it-works");

  const traveller = page.locator("#travellers");
  const operator = page.locator("#operators");
  await expect(traveller).toBeVisible();
  await expect(operator).toBeVisible();

  // Eight steps each, in their own track — never interleaved.
  await expect(traveller.getByRole("listitem")).toHaveCount(8);
  await expect(operator.getByRole("listitem")).toHaveCount(8);

  // Only the operator application is open; everything else is marked planned.
  await expect(page.getByText("Open now", { exact: true })).toHaveCount(1);
  await expect(operator.getByText("Open now", { exact: true })).toHaveCount(1);
  await expect(traveller.getByText("Open now", { exact: true })).toHaveCount(0);

  // The steps that would be most damaging to overclaim.
  for (const step of [
    /Pay and receive confirmation/i,
    /Receive bookings/i,
    /Receive payout and traveller feedback/i,
  ]) {
    const item = page.getByRole("listitem").filter({ hasText: step });
    await expect(item).toContainText("Planned");
  }
});

test("audience pages send each audience to the right form", async ({
  page,
}) => {
  await page.goto("/travellers");
  await page
    .getByRole("link", { name: "Join the traveller waitlist" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/waitlist$/);
  await expect(page.getByRole("tab", { name: /travelling/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await page.goto("/operators");
  await page
    .getByRole("link", { name: "Apply as a founding operator" })
    .first()
    .click();
  await expect(page).toHaveURL(/audience=provider$/);
  await expect(
    page.getByRole("tab", { name: /run experiences/i }),
  ).toHaveAttribute("aria-selected", "true");
});

test("the new routes appear in the site navigation", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  for (const label of ["How it works", "For travellers", "For operators"]) {
    await expect(nav.getByRole("link", { name: label })).toBeVisible();
  }
});
