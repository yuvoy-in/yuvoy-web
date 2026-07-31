import { test, expect } from "@playwright/test";

test("landing renders every section", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "tourist",
  );
  await expect(
    page.getByRole("heading", { name: /chosen by feeling/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /be there when it opens/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /the honest answers/i }),
  ).toBeVisible();
  // No fabricated social proof anywhere on the page.
  const body = await page.textContent("body");
  expect(body).not.toMatch(/₹|\breviews?\b|\bratings?\b/i);
});

test("hero CTA scrolls to registration and the audience tabs switch", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Register interest" }).first().click();
  await expect(page).toHaveURL(/#register/);

  // Traveller tab is the default.
  await expect(page.getByRole("tab", { name: /travelling/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("tab", { name: /run experiences/i }).click();
  await expect(page.getByLabel(/business name/i)).toBeVisible();
});

test("traveller form surfaces validation errors without a network call", async ({
  page,
}) => {
  await page.goto("/#register");
  // Submitting empty must fail client-side: block any accidental API call.
  await page.route("**/v1/leads", (route) => route.abort());
  await page
    .getByRole("tabpanel", { name: /travelling/i })
    .getByRole("button", { name: "Register interest" })
    .click();
  const panel = page.getByRole("tabpanel", { name: /travelling/i });
  await expect(panel.getByText("Enter your name.")).toBeVisible();
  await expect(panel.getByText("Enter your WhatsApp number.")).toBeVisible();
  await expect(panel.getByText(/accept the privacy policy/i)).toBeVisible();
});

test("traveller form success state (API stubbed)", async ({ page }) => {
  await page.goto("/#register");
  await page.route("**/v1/leads", (route) =>
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: "test-id",
        audience: "traveller",
        status: "recorded",
        createdAt: new Date().toISOString(),
      }),
    }),
  );

  const panel = page.getByRole("tabpanel", { name: /travelling/i });
  await panel.getByLabel("Name").fill("Test Person");
  await panel.getByLabel("WhatsApp number").fill("+919000000000");
  await panel.getByText("Diving & water").click();
  await panel.getByText(/I agree to the/).click();
  await panel.getByRole("button", { name: "Register interest" }).click();

  await expect(panel.getByRole("status")).toContainText(/registered/i);
});

test("unavailable API produces a truthful failure, never fake success", async ({
  page,
}) => {
  await page.goto("/#register");
  await page.route("**/v1/leads", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  );

  const panel = page.getByRole("tabpanel", { name: /travelling/i });
  await panel.getByLabel("Name").fill("Test Person");
  await panel.getByLabel("WhatsApp number").fill("+919000000000");
  await panel.getByText("Diving & water").click();
  await panel.getByText(/I agree to the/).click();
  await panel.getByRole("button", { name: "Register interest" }).click();

  await expect(panel.getByRole("alert")).toContainText(/couldn't save/i);
  await expect(panel.getByText(/you're registered/i)).toHaveCount(0);
});

test("campaign route renders with noindex and canonical to home", async ({
  page,
}) => {
  await page.goto("/go/ferry");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "tourist",
  );
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /^https?:\/\/[^/]+\/?$/, // the site root, never /go/<source>
  );
});

test("retired routes answer 410, not 404", async ({ request }) => {
  for (const path of [
    "/experiences",
    "/experiences/sunrise-scuba-dive",
    "/journal",
    "/philosophy",
  ]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(410);
  }
});
