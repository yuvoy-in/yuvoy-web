import { test, expect } from "./support/session";
import { pageText } from "./support/text";

const FABRICATED = /₹|\breviews?\b|\bratings?\b/i;

test.describe("/waitlist", () => {
  test("is a real page, not a redirect", async ({ page }) => {
    const response = await page.goto("/waitlist");
    expect(response?.status()).toBe(200);
    // It used to be a 308 onto a homepage anchor. It must land on itself now.
    await expect(page).toHaveURL(/\/waitlist$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Join the waitlist",
    );
  });

  test("defaults to the traveller audience", async ({ page }) => {
    await page.goto("/waitlist");
    await expect(
      page.getByRole("tab", { name: /travelling/i }),
    ).toHaveAttribute("aria-selected", "true");
  });

  /*
    The printed-material contract. `?audience=provider` is the URL shape on
    operator QR codes and handouts, and it used to be served by a permanent
    redirect that browsers cache indefinitely. Anyone holding that paper must
    still reach the operator form — this is a compatibility requirement, not
    polish.
  */
  /*
    While `OPERATOR_FORM_LIVE` is false the application is a notice rather than a
    form: the deployed API still requires fields this form stopped asking for
    (yuvoy-in/yuvoy-api#4), so submitting would 400 every applicant. What has to
    hold either way is that `#apply` exists, says what is happening, and offers a
    channel that reaches a person today. Swap these assertions back to the form's
    fields in the change that flips the flag.
  */
  test("?audience=provider preselects the operator form", async ({ page }) => {
    const response = await page.goto("/waitlist?audience=provider");
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("tab", { name: /run experiences/i }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#panel-provider")).toContainText(/coming soon/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Apply as a founding operator",
    );
  });

  test("an unknown audience falls back to traveller rather than failing", async ({
    page,
  }) => {
    const response = await page.goto("/waitlist?audience=nonsense");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("tab", { name: /travelling/i }),
    ).toHaveAttribute("aria-selected", "true");
  });

  test("claims no price, rating or review", async ({ page }) => {
    await page.goto("/waitlist");
    expect(await pageText(page)).not.toMatch(FABRICATED);

    await page.goto("/waitlist?audience=provider");
    expect(await pageText(page)).not.toMatch(FABRICATED);
  });

  test("submits through the existing lead endpoint", async ({ page }) => {
    await page.goto("/waitlist");

    let submitted: Record<string, unknown> | null = null;
    await page.route("**/v1/leads", async (route) => {
      submitted = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-id",
          audience: "traveller",
          status: "recorded",
          createdAt: new Date().toISOString(),
        }),
      });
    });

    const panel = page.getByRole("tabpanel", { name: /travelling/i });
    await panel.getByLabel("Name").fill("Test Person");
    await panel.getByLabel("Email").fill("test@example.com");
    await panel.getByLabel("WhatsApp number").fill("9000000000");
    await panel.getByText(/I agree to the/).click();
    await panel.getByRole("button", { name: "Join the waitlist" }).click();

    await expect(panel.getByRole("status")).toContainText(
      /You[’']re on the Yuvoy waitlist/,
    );
    expect(submitted).toMatchObject({ audience: "traveller", source: "web" });
  });

  test("does not repeat the footer call to action beneath the form", async ({
    page,
  }) => {
    await page.goto("/waitlist");
    const footer = page.getByRole("contentinfo");
    // The footer's closing CTA block, not its site map: the map may list the
    // waitlist as a route, but the page must not ask twice.
    await expect(
      footer.getByRole("heading", { name: /be first to experience yuvoy/i }),
    ).toHaveCount(0);
  });
});
