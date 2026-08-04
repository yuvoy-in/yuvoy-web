import { test, expect, type Page } from "@playwright/test";

/**
 * Nothing on the page may claim a price, a rating or a review count — with
 * one owner-approved exception: the Season One phone preview, which is
 * visibly labelled as a preview and carries `data-preview` on its wrapper
 * (see docs/DESIGN_SYSTEM.md §8). The guard therefore asserts two things:
 * the rule holds everywhere *outside* that wrapper, and the label that
 * justifies the exception is actually present.
 */
const FABRICATED = /₹|\breviews?\b|\bratings?\b/i;

async function textOutsidePreview(page: Page): Promise<string> {
  return page.evaluate(() => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("[data-preview]").forEach((n) => n.remove());
    return clone.textContent ?? "";
  });
}

/** The homepage's registration section, which no longer has tabs. */
const registerForm = (page: Page) => page.locator("#register");

test("landing tells its story in headlines", async ({ page }) => {
  await page.goto("/");

  // The billboard test: the acts, readable as headings alone.
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Every trip starts with one question",
  );
  await expect(
    page.getByRole("heading", { name: /the hard part was never booking/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /scroll\. watch\. book\./i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /one destination, done completely/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /be there when it opens/i }),
  ).toBeVisible();
});

/*
  The homepage is for travellers. The operator case has its own page, and the
  header is what points at it — so the homepage must not pitch operators, and
  must not ask an arriving visitor which of the two they are.
*/
test("the homepage speaks only to travellers", async ({ page }) => {
  await page.goto("/");

  // No audience picker: there is nothing to choose between here.
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /six apps/i })).toHaveCount(0);

  const body = (await page.textContent("body")) ?? "";
  expect(body).not.toMatch(/founding operator/i);
  expect(body).not.toMatch(/Season One roster/i);

  // The traveller form is the one that renders, with its own fields.
  await expect(
    registerForm(page).getByLabel("What draws you?", { exact: false }),
  ).toBeVisible();
  await expect(registerForm(page).getByLabel("Business name")).toHaveCount(0);
});

test("the preview is labelled and invented numbers stay inside it", async ({
  page,
}) => {
  await page.goto("/");

  // The exception must announce itself…
  await expect(page.getByText("Season One preview")).toBeVisible();
  await expect(page.locator("[data-preview]")).toHaveCount(1);

  // …and the rule holds everywhere else.
  expect(await textOutsidePreview(page)).not.toMatch(FABRICATED);
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

test("the cover's momentum line states only true facts", async ({ page }) => {
  await page.goto("/");
  // The signed-operator count is a real, owner-confirmed number (2026-08-03).
  // If this fails because reality changed, update BOTH the page and this
  // assertion to the new true number — never delete the check.
  await expect(page.getByText("3 founding operators signed")).toBeVisible();
});

test("the cover CTA lands on the registration form without leaving the page", async ({
  page,
}) => {
  await page.goto("/");

  const cover = page.locator("main > section").first();
  await cover.getByRole("link", { name: "Join the waitlist" }).click();
  await expect(page).toHaveURL(/#register$/);
  await expect(registerForm(page)).toBeInViewport();
});

/*
  The operator route out of the homepage is the header, at every breakpoint —
  that is the whole reason the homepage can drop the operator pitch.
*/
test("the header sends operators to their own page", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("banner")
    .getByRole("link", { name: "For operators" })
    .click();
  await expect(page).toHaveURL(/\/operators$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /show it properly/i,
  );
});

/*
  /waitlist used to be a permanent redirect onto these anchors. Browsers cache
  308s indefinitely, so both must keep resolving somewhere coherent — and
  campaign traffic converts on the page it lands on.

  Each anchor gets its own test, and therefore its own fresh page. Visiting
  them one after another in a single test is a same-document navigation, which
  is not the path a visitor following a cached redirect actually takes.
*/
test("the homepage still registers in place at #register", async ({ page }) => {
  await page.goto("/#register");
  await expect(registerForm(page).getByLabel("Name")).toBeVisible();
});

test("#providers now carries operators to the application itself", async ({
  page,
}) => {
  await page.goto("/#providers");

  // The homepage has no operator form to open any more, so the long-lived
  // anchor must land on the one that does rather than on nothing.
  await expect(page).toHaveURL(/\/operators#apply$/);
  await expect(
    page.locator("#apply").getByLabel("Business name"),
  ).toBeVisible();
});

test("traveller form surfaces validation errors without a network call", async ({
  page,
}) => {
  await page.goto("/#register");
  // Submitting empty must fail client-side: block any accidental API call.
  await page.route("**/v1/leads", (route) => route.abort());
  const form = registerForm(page);
  await form.getByRole("button", { name: "Join the waitlist" }).click();

  await expect(form.getByText("Enter your name.")).toBeVisible();
  await expect(form.getByText("Enter your WhatsApp number.")).toBeVisible();
  await expect(form.getByText(/accept the privacy policy/i)).toBeVisible();
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

  const form = registerForm(page);
  await form.getByLabel("Name").fill("Test Person");
  await form.getByLabel("WhatsApp number").fill("+919000000000");
  await form.getByText("Diving & water").click();
  await form.getByText(/I agree to the/).click();
  await form.getByRole("button", { name: "Join the waitlist" }).click();

  await expect(form.getByRole("status")).toContainText(
    /You[’']re on the Yuvoy waitlist/,
  );
  // A future promise, never "check your inbox" — there is no autoresponder.
  await expect(form.getByRole("status")).toContainText(
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

  const form = registerForm(page);
  await form.getByLabel("Name").fill("Test Person");
  await form.getByLabel("WhatsApp number").fill("+919000000000");
  await form.getByText("Diving & water").click();
  await form.getByText(/I agree to the/).click();
  await form.getByRole("button", { name: "Join the waitlist" }).click();

  await expect(form.getByRole("alert")).toContainText(/couldn't save/i);
  await expect(form.getByText(/on the yuvoy waitlist/i)).toHaveCount(0);
});

test("campaign route renders with noindex and canonical to home", async ({
  page,
}) => {
  await page.goto("/go/ferry");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Every trip starts with one question",
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
