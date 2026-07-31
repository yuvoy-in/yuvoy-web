import { test, expect } from "@playwright/test";

/**
 * Live smoke test against the deployed API — no stubbing, no mocks.
 *
 * The rest of the suite stubs `/v1/leads`, which proves the UI handles each
 * response shape but says nothing about whether the real backend is reachable,
 * whether CORS permits this origin, or whether a submission actually persists.
 * This closes that gap.
 *
 * It writes real rows to the real database, so it is opt-in:
 *
 *   LIVE_API_E2E=1 NEXT_PUBLIC_API_BASE_URL=https://api.yuvoy.in pnpm test:e2e
 *
 * Rows it creates carry the phone prefix +91900000009* and the name "E2E Live
 * Check" so they are trivially identifiable and removable.
 */
const LIVE = process.env.LIVE_API_E2E === "1";

test.describe("live API", () => {
  test.skip(
    !LIVE,
    "opt-in: set LIVE_API_E2E=1 to run against the deployed API",
  );

  test("a traveller registration reaches the deployed API", async ({
    page,
  }) => {
    const requests: { url: string; status: number }[] = [];
    page.on("response", async (res) => {
      if (res.url().includes("/v1/leads")) {
        requests.push({ url: res.url(), status: res.status() });
      }
    });

    await page.goto("/#register");
    const panel = page.getByRole("tabpanel", { name: /travelling/i });

    // Unique per run so reruns exercise the create path, not the update path.
    const phone = `+9190000000${String(Date.now()).slice(-2)}`;

    await panel.getByLabel("Name").fill("E2E Live Check");
    await panel.getByLabel("WhatsApp number").fill(phone);
    await panel.getByText("Diving & water").click();
    await panel.getByText(/I agree to the/).click();
    await panel.getByRole("button", { name: "Register interest" }).click();

    await expect(panel.getByRole("status")).toContainText(/registered/i, {
      timeout: 20_000,
    });

    // The success state must have been earned by a real 2xx, not by a UI path
    // that reports success without the network agreeing.
    expect(requests.length).toBeGreaterThan(0);
    expect([200, 201]).toContain(requests[0].status);
    expect(requests[0].url).toContain("api.yuvoy.in");
  });

  test("resubmitting the same contact is accepted as an update", async ({
    page,
  }) => {
    const statuses: number[] = [];
    page.on("response", (res) => {
      if (res.url().includes("/v1/leads")) statuses.push(res.status());
    });

    // Fresh number per run: the first submit must create, the second must
    // deduplicate. A fixed number would leave the row behind and make a rerun
    // report 200 twice.
    const phone = `+9190000002${String(Date.now()).slice(-2)}`;

    for (const attempt of [1, 2]) {
      // A unique query forces a real navigation. Re-visiting "/#register"
      // when already there only scrolls, leaving the previous success state
      // on screen and the form fields absent.
      await page.goto(`/?e2e=${attempt}#register`);
      const panel = page.getByRole("tabpanel", { name: /travelling/i });
      await panel.getByLabel("Name").fill(`E2E Live Check ${attempt}`);
      await panel.getByLabel("WhatsApp number").fill(phone);
      await panel.getByText("Diving & water").click();
      await panel.getByText(/I agree to the/).click();
      await panel.getByRole("button", { name: "Register interest" }).click();
      await expect(panel.getByRole("status")).toContainText(
        /registered|updated/i,
        {
          timeout: 20_000,
        },
      );
    }

    expect(statuses).toHaveLength(2);
    expect(statuses[0]).toBe(201); // created
    expect(statuses[1]).toBe(200); // deduplicated
  });

  test("a provider registration from a QR route carries its source", async ({
    page,
  }) => {
    let sent: Record<string, unknown> | undefined;
    page.on("request", (req) => {
      if (req.url().includes("/v1/leads") && req.method() === "POST") {
        sent = JSON.parse(req.postData() ?? "{}");
      }
    });

    // Arriving from the printed ferry QR code, then registering as a provider.
    await page.goto("/go/ferry#providers");
    await page.getByRole("tab", { name: /run experiences/i }).click();
    const panel = page.getByRole("tabpanel", { name: /run experiences/i });

    const phone = `+9190000001${String(Date.now()).slice(-2)}`;
    await panel.getByLabel("Your name").fill("E2E Live Contact");
    await panel.getByLabel("Business name").fill("E2E Live Dive Co");
    await panel.getByLabel("WhatsApp number").fill(phone);
    // Both are required by the contract: at least one coverage destination
    // and exactly one primary interest.
    await panel
      .getByRole("group", { name: /where you operate/i })
      .getByText("Havelock")
      .click();
    await panel
      .getByRole("group", { name: /what you mainly offer/i })
      .getByText("Diving & water")
      .click();
    await panel.getByText(/I agree to the/).click();
    await panel.getByRole("button", { name: /register my business/i }).click();

    await expect(panel.getByRole("status")).toContainText(/registered|touch/i, {
      timeout: 20_000,
    });

    // Attribution must survive the journey from QR route to API payload,
    // otherwise campaign spend cannot be told apart from organic traffic.
    expect(sent?.audience).toBe("provider");
    expect(sent?.source).toBe("ferry");
  });
});
