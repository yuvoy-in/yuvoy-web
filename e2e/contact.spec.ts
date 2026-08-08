import { test, expect, type Page } from "./support/session";

/**
 * The contact form, live since 2026-08-07 (`yuvoy-in/yuvoy-api#5`).
 *
 * It shipped rendered-but-`disabled` behind a "Coming soon" badge for as long
 * as `POST /v1/messages` did not exist, on the rule that a form which throws
 * the message away is worse than no form. What these assert is the other half
 * of that rule: now that it can send, every outcome says truthfully what
 * happened to the message.
 */

const form = (page: Page) => page.locator("#message");

/** The endpoint's success shape: 202, and an acknowledgement of nothing more. */
async function stubAccepted(page: Page, seen: { body?: unknown }) {
  await page.route("**/v1/messages", async (route) => {
    seen.body = route.request().postDataJSON();
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({
        id: "00000000-0000-0000-0000-000000000000",
        status: "received",
        createdAt: new Date().toISOString(),
      }),
    });
  });
}

test.describe("/contact message form", () => {
  test("sends what the endpoint asks for, and says only that it arrived", async ({
    page,
  }) => {
    await page.goto("/contact");
    const seen: { body?: unknown } = {};
    await stubAccepted(page, seen);

    await form(page).getByLabel("Name").fill("Test Person");
    await form(page).getByLabel("Email").fill("test@example.com");
    await form(page)
      .getByLabel("I’m contacting about")
      .selectOption("partnership");
    await form(page).getByLabel("Message").fill("Is the ferry QR code yours?");
    await form(page).getByRole("button", { name: "Send" }).click();

    await expect(form(page).getByRole("status")).toContainText(
      /a person will read this/i,
    );

    expect(seen.body).toMatchObject({
      name: "Test Person",
      email: "test@example.com",
      topic: "partnership",
      message: "Is the ferry QR code yours?",
    });
    // A message is not a lead: no marketing consent, no market, no audience.
    expect(Object.keys(seen.body as object).sort()).toEqual([
      "email",
      "message",
      "name",
      "topic",
    ]);
  });

  /*
    No reply-time promise, anywhere. The site publishes none — the API answers
    202 rather than 201 for the same reason — and the moment a confirmation
    invents one it becomes the thing the team is measured against.
  */
  test("promises no reply time", async ({ page }) => {
    await page.goto("/contact");
    const seen: { body?: unknown } = {};
    await stubAccepted(page, seen);

    await form(page).getByLabel("Name").fill("Test Person");
    await form(page).getByLabel("Email").fill("test@example.com");
    await form(page).getByLabel("Message").fill("A question.");
    await form(page).getByRole("button", { name: "Send" }).click();

    const status = form(page).getByRole("status");
    await expect(status).toBeVisible();
    await expect(status).not.toContainText(
      /within|24|48|hours?|business day|reply by/i,
    );
  });

  test("catches its own mistakes without calling the API", async ({ page }) => {
    await page.goto("/contact");
    // Any request at all is a failure of client-side validation.
    let called = false;
    await page.route("**/v1/messages", (route) => {
      called = true;
      return route.abort();
    });

    await form(page).getByRole("button", { name: "Send" }).click();

    await expect(form(page).getByText("Enter your name.")).toBeVisible();
    await expect(
      form(page).getByText("Enter your email address."),
    ).toBeVisible();
    await expect(form(page).getByText("Write your message.")).toBeVisible();
    expect(called, "a request was sent for an empty form").toBe(false);
  });

  /*
    The failure the visitor most needs the truth about: nothing was sent. It
    must also leave them a way through to a person, because a broken form is
    not an acceptable end of the road for somebody with a question.
  */
  test("says nothing was sent when the API is down, and offers the address", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.route("**/v1/messages", (route) =>
      route.fulfill({ status: 503, body: "" }),
    );

    await form(page).getByLabel("Name").fill("Test Person");
    await form(page).getByLabel("Email").fill("test@example.com");
    await form(page).getByLabel("Message").fill("A question.");
    await form(page).getByRole("button", { name: "Send" }).click();

    const alert = form(page).getByRole("alert").first();
    await expect(alert).toContainText(/nothing was sent/i);
    await expect(
      alert.getByRole("link", { name: "info@yuvoy.in" }),
    ).toHaveAttribute("href", "mailto:info@yuvoy.in");
  });

  test("puts a server field error on the field it names", async ({ page }) => {
    await page.goto("/contact");
    await page.route("**/v1/messages", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "invalid_request",
            message: "Some details need another look.",
            details: { email: "That address is not deliverable." },
          },
        }),
      }),
    );

    await form(page).getByLabel("Name").fill("Test Person");
    await form(page).getByLabel("Email").fill("test@example.com");
    await form(page).getByLabel("Message").fill("A question.");
    await form(page).getByRole("button", { name: "Send" }).click();

    await expect(
      form(page).getByText("That address is not deliverable."),
    ).toBeVisible();
  });
});
