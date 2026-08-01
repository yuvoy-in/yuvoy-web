import { test, expect } from "@playwright/test";

/** Nothing on the site may claim a price, a rating or a review count. */
const FABRICATED = /₹|\breviews?\b|\bratings?\b/i;

test("landing renders every section", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "See the experience",
  );
  await expect(
    page.getByRole("heading", { name: /watch\. feel\. book\./i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /chosen by feeling/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /three islands/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /two different questions/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /asked and answered/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /join the waitlist/i }),
  ).toBeVisible();

  // No fabricated social proof anywhere on the page.
  expect(await page.textContent("body")).not.toMatch(FABRICATED);
});

test("the honest booking caveat is stated verbatim", async ({ page }) => {
  await page.goto("/");
  // Owner-approved canon. It is the page's clearest statement that booking
  // does not exist yet, so it is asserted word for word.
  await expect(
    page.getByText(
      "Booking opens after the first curated collection is ready.",
    ),
  ).toBeVisible();
});

test("hero CTAs lead to the waitlist page for each audience", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Join the traveller waitlist" }).click();
  await expect(page).toHaveURL(/\/waitlist$/);
  await expect(page.getByRole("tab", { name: /travelling/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await page.goto("/");
  await page
    .getByRole("link", { name: "Apply as a founding operator" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/waitlist\?audience=provider$/);
  await expect(
    page.getByRole("tab", { name: /run experiences/i }),
  ).toHaveAttribute("aria-selected", "true");
});

/*
  /waitlist used to be a permanent redirect onto these anchors. Browsers cache
  308s indefinitely, so both must keep working even now that the real page
  exists — and campaign traffic converts on the page it lands on.

  Each anchor gets its own test, and therefore its own fresh page. Visiting
  them one after another in a single test is a same-document navigation, which
  is not the path a visitor following a cached redirect actually takes.
*/
test("the homepage still registers in place at #register", async ({ page }) => {
  await page.goto("/#register");
  await expect(
    page.getByRole("tabpanel", { name: /travelling/i }),
  ).toBeVisible();
});

test("#providers still opens the operator form", async ({ page }) => {
  await page.goto("/#providers");
  await expect(
    page.getByRole("tab", { name: /run experiences/i }),
  ).toHaveAttribute("aria-selected", "true");
});

test("traveller form surfaces validation errors without a network call", async ({
  page,
}) => {
  await page.goto("/#register");
  // Submitting empty must fail client-side: block any accidental API call.
  await page.route("**/v1/leads", (route) => route.abort());
  await page
    .getByRole("tabpanel", { name: /travelling/i })
    .getByRole("button", { name: "Join the waitlist" })
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
  await panel.getByRole("button", { name: "Join the waitlist" }).click();

  await expect(panel.getByRole("status")).toContainText(
    /You[’']re on the Yuvoy waitlist/,
  );
  // A future promise, never "check your inbox" — there is no autoresponder.
  await expect(panel.getByRole("status")).toContainText(
    /We[’']ll message you when the first Andaman experiences are ready\./,
  );
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
  await panel.getByRole("button", { name: "Join the waitlist" }).click();

  await expect(panel.getByRole("alert")).toContainText(/couldn't save/i);
  await expect(panel.getByText(/on the yuvoy waitlist/i)).toHaveCount(0);
});

test("campaign route renders with noindex and canonical to home", async ({
  page,
}) => {
  await page.goto("/go/ferry");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "See the experience",
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
  // /experiences is a real page again, but the seeded detail slugs it used to
  // publish — which carried invented prices and review counts, and are still
  // in Google's index — must keep answering 410 so they get dropped rather
  // than recrawled. /journal and /philosophy remain retired entirely.
  for (const path of [
    "/experiences/sunrise-scuba-dive",
    "/experiences/anything-else",
    "/philosophy",
  ]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(410);
  }

  // ...and the index pages themselves are emphatically not 410 any more.
  expect((await request.get("/experiences")).status()).toBe(200);
  expect((await request.get("/journal")).status()).toBe(200);
});
