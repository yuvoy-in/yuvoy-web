import { test, expect } from "@playwright/test";

const FABRICATED = /₹|\breviews?\b|\bratings?\b/i;

const DESTINATION_SLUGS = ["havelock", "neil-island", "port-blair"];

test.describe("/experiences", () => {
  test("is a real page again", async ({ page, request }) => {
    expect((await request.get("/experiences")).status()).toBe(200);
    await page.goto("/experiences");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /four kinds of day/i,
    );
  });

  /*
    The whole reason this URL was 410'd. The old version published invented
    prices, invented review counts and operator names flagged verified without
    permission. It may come back only as categories.
  */
  test("describes categories, never listings", async ({ page }) => {
    await page.goto("/experiences");
    const body = (await page.textContent("body")) ?? "";

    expect(body).not.toMatch(FABRICATED);
    for (const claim of [
      /\bfrom \d/i, // "from 4,500"
      /\bper person\b/i,
      /\bavailable (today|now)\b/i,
      /\bbook now\b/i,
      /\bverified operator/i,
      /\bsold out\b/i,
    ]) {
      expect(body, `/experiences must not claim ${claim}`).not.toMatch(claim);
    }

    // It says plainly that there is nothing to browse.
    expect(body).toMatch(/no listings on yuvoy yet/i);
  });

  test("retired detail slugs still answer 410", async ({ request }) => {
    for (const slug of [
      "sunrise-scuba-dive",
      "bioluminescence-kayak",
      "anything-at-all",
    ]) {
      const res = await request.get(`/experiences/${slug}`);
      expect(res.status(), `/experiences/${slug}`).toBe(410);
    }
  });
});

test.describe("/destinations", () => {
  test("index lists all three islands and links to each", async ({ page }) => {
    await page.goto("/destinations");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /one market/i,
    );
    for (const slug of DESTINATION_SLUGS) {
      await expect(
        page.locator(`a[href="/destinations/${slug}"]`).first(),
      ).toBeVisible();
    }
  });

  for (const slug of DESTINATION_SLUGS) {
    test(`/destinations/${slug} renders with breadcrumbs and a canonical`, async ({
      page,
    }) => {
      const res = await page.goto(`/destinations/${slug}`);
      expect(res?.status()).toBe(200);

      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

      const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
      await expect(crumbs).toBeVisible();
      await expect(crumbs.getByRole("link", { name: "Home" })).toBeVisible();
      await expect(
        crumbs.getByRole("link", { name: "Destinations" }),
      ).toBeVisible();

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`/destinations/${slug}$`),
      );

      expect(await page.textContent("body")).not.toMatch(FABRICATED);
    });
  }

  test("an unknown destination is a 404, not a blank page", async ({
    request,
  }) => {
    expect((await request.get("/destinations/mumbai")).status()).toBe(404);
  });

  test("labels match the lead registry rather than drifting from it", async ({
    page,
  }) => {
    // The registry is what the API contract uses; the site must not rename
    // a destination independently of it.
    await page.goto("/destinations");
    const body = (await page.textContent("body")) ?? "";
    for (const label of [
      "Havelock (Swaraj Dweep)",
      "Neil (Shaheed Dweep)",
      "Port Blair",
    ]) {
      expect(body, `missing registry label: ${label}`).toContain(label);
    }
  });
});

test("the discover routes appear in the site navigation", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  for (const label of ["Experiences", "Destinations"]) {
    await expect(nav.getByRole("link", { name: label })).toBeVisible();
  }
});
