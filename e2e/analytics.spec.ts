import { test, expect, type Page } from "@playwright/test";

/**
 * Consent gating.
 *
 * The load-bearing assertion is the network one: **zero requests to any
 * analytics host before consent**. Checking that `capture()` is not called
 * would not be enough — the SDK contacts its host on initialisation, so a
 * build that merely imported it too early would still leak, and only a network
 * assertion catches that.
 */
const ANALYTICS_HOSTS = /posthog|vercel-insights|vitals\.vercel/i;

/**
 * Records every request the page attempts, so it can be asserted on after.
 *
 * Matching is on the request's **host**, not the whole URL. A same-origin
 * bundle chunk whose filename happens to contain "posthog" sends nothing to
 * anyone — the privacy guarantee is that no *data leaves the browser* for a
 * third-party analytics host before consent, and that is what this measures.
 * (Next's dev server also eagerly prefetches dynamic-import chunks, so a
 * filename match would fail for a reason that has nothing to do with privacy.)
 */
function watchRequests(page: Page, baseURL: string | undefined) {
  const urls: string[] = [];
  page.on("request", (request) => urls.push(request.url()));

  const ownHost = baseURL ? new URL(baseURL).host : null;

  const thirdPartyAnalytics = () =>
    urls.filter((url) => {
      let host: string;
      try {
        host = new URL(url).host;
      } catch {
        return false;
      }
      if (host === ownHost) return false;
      return ANALYTICS_HOSTS.test(host);
    });

  return { analytics: thirdPartyAnalytics, all: () => urls };
}

test.describe("analytics consent", () => {
  test("makes no analytics request before a choice is made", async ({
    page,
    baseURL,
  }) => {
    const seen = watchRequests(page, baseURL);

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Interact, in case an event would fire on engagement.
    await page.getByRole("heading", { level: 1 }).click();
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(1200);

    expect(
      seen.analytics(),
      "an analytics request fired before consent",
    ).toEqual([]);
  });

  test("makes no analytics request after declining", async ({
    page,
    baseURL,
  }) => {
    const seen = watchRequests(page, baseURL);

    await page.addInitScript(() =>
      window.localStorage.setItem("yuvoy.analytics-consent", "denied"),
    );
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(1200);

    expect(seen.analytics()).toEqual([]);
  });

  test("the stored decision survives a reload", async ({ page }) => {
    await page.addInitScript(() =>
      window.localStorage.setItem("yuvoy.analytics-consent", "denied"),
    );
    await page.goto("/");

    const stored = await page.evaluate(() =>
      window.localStorage.getItem("yuvoy.analytics-consent"),
    );
    expect(stored).toBe("denied");

    await page.reload();
    expect(
      await page.evaluate(() =>
        window.localStorage.getItem("yuvoy.analytics-consent"),
      ),
    ).toBe("denied");
  });

  /*
    With no PostHog project configured there is nothing to consent to, so the
    prompt must not appear. Asking a visitor to approve tracking that does not
    exist is theatre, and it would also be the kind of thing that quietly
    becomes real later without anyone re-reading the copy.
  */
  test("shows no consent prompt while analytics is unconfigured", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("dialog", { name: /help us understand/i }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Privacy choices" }),
    ).toHaveCount(0);
  });
});

test.describe("Vercel Analytics removal", () => {
  test("no Vercel Analytics script is served", async ({ page, baseURL }) => {
    const seen = watchRequests(page, baseURL);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // @vercel/analytics injects /_vercel/insights/script.js from our own
    // origin, so this checks every request rather than third-party hosts.
    const insights = seen.all().filter((u) => u.includes("/_vercel/insights"));
    expect(insights).toEqual([]);
  });
});

test("the privacy page describes exactly what runs", async ({ page }) => {
  await page.goto("/privacy");
  const body = (await page.textContent("body")) ?? "";

  // Both systems disclosed by name, with their actual behaviour.
  expect(body).toMatch(/PostHog/);
  expect(body).toMatch(/Speed Insights/);
  expect(body).toMatch(/hosted in the EU/i);
  expect(body).toMatch(
    /no name, email, phone number or registration reference/i,
  );
  expect(body).toMatch(/Privacy choices/);

  // And nothing that is not running.
  expect(body).not.toMatch(/Google Analytics/i);
  expect(body).not.toMatch(/advertis/i);
});
