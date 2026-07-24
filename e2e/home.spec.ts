import { test, expect } from "@playwright/test";

test("home leads to the waitlist", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "tourist",
  );
  await page.getByRole("link", { name: "Join the waitlist" }).first().click();
  await expect(page).toHaveURL(/\/waitlist/);
  await expect(
    page.getByRole("heading", { name: "Join the waitlist." }),
  ).toBeVisible();
});

test("waitlist rejects an empty email", async ({ page }) => {
  await page.goto("/waitlist");
  await page.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(page.getByRole("alert")).toContainText(/email/i);
});
