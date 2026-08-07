import { test, expect } from "./support/session";
import { pageText } from "./support/text";

const FABRICATED = /₹|\breviews?\b|\bratings?\b/i;

const travellerTab = "I'm travelling";
const operatorTab = "I run experiences";

test.describe("/waitlist", () => {
  test("is a real page, not a redirect", async ({ page }) => {
    const response = await page.goto("/waitlist");
    expect(response?.status()).toBe(200);
    // It used to be a 308 onto a homepage anchor. It must land on itself now.
    await expect(page).toHaveURL(/\/waitlist$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Be first to experience Yuvoy.",
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

/*
  The masthead. This route drops the site header — it exists to have a form
  filled in, and the standing bar offered three ways off the page plus a button
  pointing at the page the visitor is already on. What replaces it is the mark,
  centred, and one way back.
*/
test.describe("/waitlist masthead", () => {
  test("carries the mark and a back control, and none of the site nav", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/waitlist");

    const banner = page.getByRole("banner");
    await expect(
      banner.getByRole("link", { name: "Yuvoy home" }),
    ).toBeVisible();
    await expect(banner.getByRole("button", { name: "Back" })).toBeVisible();

    // The site nav is gone at every breakpoint: no routes inline, no call to
    // action pointing at this page, and no menu trigger standing in for them.
    for (const label of ["Explore", "For Operators", "About"]) {
      await expect(banner.getByRole("link", { name: label })).toHaveCount(0);
    }
    await expect(
      banner.getByRole("link", { name: /join waitlist/i }),
    ).toHaveCount(0);
    await expect(banner.getByRole("button", { name: "Open menu" })).toHaveCount(
      0,
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(banner.getByRole("button", { name: "Open menu" })).toHaveCount(
      0,
    );
    await expect(
      banner.getByRole("link", { name: "Yuvoy home" }),
    ).toBeVisible();
  });

  test("the mark is centred on the page, not on what is left over", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/waitlist");

    const bar = (await page.getByRole("banner").boundingBox())!;
    const mark = (await page
      .getByRole("banner")
      .getByRole("img")
      .boundingBox())!;

    const barCentre = bar.x + bar.width / 2;
    const markCentre = mark.x + mark.width / 2;
    expect(
      Math.abs(markCentre - barCentre),
      `mark centre ${markCentre} vs bar centre ${barCentre}`,
    ).toBeLessThan(2);
  });

  /*
    Back means back — not "home". A visitor who reached this page from
    `/explore` returns to `/explore`, which is the whole promise of the
    control and the reason it is not simply a link to `/`.
  */
  test("back returns to where the visitor came from", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/explore");
    await page
      .getByRole("banner")
      .getByRole("link", { name: /join waitlist/i })
      .click();
    await expect(page).toHaveURL(/\/waitlist$/);

    await page
      .getByRole("banner")
      .getByRole("button", { name: "Back" })
      .click();
    await expect(page).toHaveURL(/\/explore$/);
  });

  /*
    The case a plain `history.back()` cannot serve: a visit whose first entry
    is this page — a link opened in a new tab, a scanned QR code, a bookmark.
    `back()` does nothing there, and a control that does nothing reads as a
    broken page.

    Playwright's initial `about:blank` makes `history.length` 2 here, which is
    precisely why the control does not trust that number on its own — a real
    direct arrival and a blank first entry are indistinguishable by count.
  */
  test("back goes home when the page was opened directly", async ({ page }) => {
    await page.goto("/waitlist");

    await page
      .getByRole("banner")
      .getByRole("button", { name: "Back" })
      .click();
    await expect(page).toHaveURL(/\/$/);
  });
});

/*
  Two tabs of *page*, not two tabs of form. The switch used to change only
  which fields were on screen: the eyebrow, the headline, the promise under it
  and the questions beside it were the traveller's on both sides, so an
  operator was told they were joining a waitlist right up until the submit
  button said otherwise.
*/
test.describe("/waitlist audience tabs", () => {
  test("switching sides changes the whole page, not just the form", async ({
    page,
  }) => {
    await page.goto("/waitlist");

    const main = page.getByRole("main");
    await expect(main).toContainText("Early access");
    await expect(main).toContainText("Can I book today?");
    await expect(
      main.getByRole("button", { name: "Join the waitlist" }),
    ).toBeVisible();

    await page.getByRole("tab", { name: operatorTab }).click();

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Apply as a founding operator",
    );
    await expect(main).toContainText("Applying");
    await expect(main).toContainText("Does applying cost anything?");
    // The traveller's side is gone entirely, not merely hidden behind it.
    await expect(main).not.toContainText("Early access");
    await expect(main).not.toContainText("Can I book today?");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    // The address bar follows the tab, so the page can be shared or reloaded
    // on the side the visitor is actually looking at.
    await expect(page).toHaveURL(/\/waitlist\?audience=provider$/);

    await page.getByRole("tab", { name: travellerTab }).click();
    await expect(page).toHaveURL(/\/waitlist$/);
  });

  /*
    The tab must not be a history entry. The back control promises to leave the
    page; pushing a state per tab would have it walk back through every side
    the visitor tried first.
  */
  test("switching sides does not stack up history entries", async ({
    page,
  }) => {
    await page.goto("/");
    await page.goto("/waitlist");

    await page.getByRole("tab", { name: operatorTab }).click();
    await page.getByRole("tab", { name: travellerTab }).click();
    await page.getByRole("tab", { name: operatorTab }).click();

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });

  /*
    The long-lived operator anchor. `/waitlist` was once a permanent (308)
    redirect onto `/#providers`, browsers cache 308s indefinitely, and the URL
    was printed on operator materials.
  */
  test("#providers opens the operator side", async ({ page }) => {
    await page.goto("/waitlist#providers");

    await expect(
      page.getByRole("tab", { name: /run experiences/i }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Apply as a founding operator",
    );
  });

  /*
    A tablist is a single tab stop with arrow keys inside it, not two tab
    stops. Anything else puts the switch between the visitor and the first
    field for every keyboard user.
  */
  test("is one tab stop, driven by the arrow keys", async ({ page }) => {
    await page.goto("/waitlist");

    const traveller = page.getByRole("tab", { name: travellerTab });
    const operator = page.getByRole("tab", { name: operatorTab });

    await expect(traveller).toHaveAttribute("tabindex", "0");
    await expect(operator).toHaveAttribute("tabindex", "-1");

    await traveller.focus();
    await page.keyboard.press("ArrowRight");
    await expect(operator).toBeFocused();
    await expect(operator).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Apply as a founding operator",
    );

    await page.keyboard.press("ArrowLeft");
    await expect(traveller).toBeFocused();
    await expect(traveller).toHaveAttribute("aria-selected", "true");
  });
});
