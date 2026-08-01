import { test, expect } from "@playwright/test";

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
  test("?audience=provider preselects the operator form", async ({ page }) => {
    const response = await page.goto("/waitlist?audience=provider");
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("tab", { name: /run experiences/i }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(page.getByLabel(/business name/i)).toBeVisible();
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
    expect(await page.textContent("body")).not.toMatch(FABRICATED);

    await page.goto("/waitlist?audience=provider");
    expect(await page.textContent("body")).not.toMatch(FABRICATED);
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
    await panel.getByLabel("WhatsApp number").fill("+919000000000");
    await panel.getByText("Diving & water").click();
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
    await expect(
      footer.getByRole("link", { name: /join waitlist/i }),
    ).toHaveCount(0);
  });
});
