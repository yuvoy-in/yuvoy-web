import { test, expect } from "./support/session";

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

/**
 * A number no previous run has used. Uniqueness matters: these tests assert on
 * the create-vs-deduplicate split, so a collision with an earlier run's row
 * turns the first submit into a 200 and fails a passing build. Nine digits of
 * the clock give a fresh number roughly every millisecond.
 */
function uniquePhone(): string {
  return `+919${String(Date.now()).slice(-9)}`;
}

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

    await page.goto("/waitlist");
    const panel = page.getByRole("tabpanel", { name: /travelling/i });

    // Unique per run so reruns exercise the create path, not the update path.
    const phone = uniquePhone();

    await panel.getByLabel("Name").fill("E2E Live Check");
    await panel.getByLabel("WhatsApp number").fill(phone);
    await panel.getByText(/I agree to the/).click();
    await panel.getByRole("button", { name: "Join the waitlist" }).click();

    await expect(panel.getByRole("status")).toContainText(
      /you.re on the yuvoy waitlist/i,
      { timeout: 20_000 },
    );

    // The success state must have been earned by a real 2xx, not by a UI path
    // that reports success without the network agreeing.
    expect(requests.length).toBeGreaterThan(0);
    expect([200, 201]).toContain(requests[0].status);
  });

  test("resubmitting the same contact is accepted as an update", async ({
    page,
  }) => {
    // Fresh number per run: the first submit must create, the second must
    // deduplicate. A fixed number would leave the row behind and make a rerun
    // report 200 twice.
    const phone = uniquePhone();
    const statuses: number[] = [];

    for (const attempt of [1, 2]) {
      // A unique query forces a real navigation. Re-visiting "/waitlist" when
      // already there would just leave the previous success state on screen.
      await page.goto(`/waitlist?e2e=${attempt}`);
      const panel = page.getByRole("tabpanel", { name: /travelling/i });
      await panel.getByLabel("Name").fill(`E2E Live Check ${attempt}`);
      await panel.getByLabel("WhatsApp number").fill(phone);
      await panel.getByText(/I agree to the/).click();

      // Wait on the response itself rather than only the rendered state, so a
      // throttled run is diagnosed instead of timing out on a success message
      // that was never going to appear.
      const [res] = await Promise.all([
        page.waitForResponse((r) => r.url().includes("/v1/leads"), {
          timeout: 20_000,
        }),
        panel.getByRole("button", { name: "Join the waitlist" }).click(),
      ]);
      statuses.push(res.status());

      test.skip(
        res.status() === 429,
        "API rate limit hit — rerun in a minute; this test needs two clean submissions",
      );

      await expect(panel.getByRole("status")).toContainText(
        /you.re on the yuvoy waitlist|already had you/i,
        { timeout: 20_000 },
      );
    }

    expect(statuses).toEqual([201, 200]); // created, then deduplicated
  });

  /*
    This was `test.skip`-gated on `OPERATOR_FORM_LIVE` while the application was
    a notice rather than a form: the deployed API still required fields the
    form had stopped asking for, so there was nothing to submit. That shipped
    on 2026-08-07 (yuvoy-in/yuvoy-api#4) and the gate came off with the flag.
    It is the test that proves a real provider lead reaches the real API, and
    it is the reason this file exists.
  */
  test("a provider registration from a QR route carries its source", async ({
    page,
  }) => {
    let sent: Record<string, unknown> | undefined;
    page.on("request", (req) => {
      if (req.url().includes("/v1/leads") && req.method() === "POST") {
        sent = JSON.parse(req.postData() ?? "{}");
      }
    });

    /*
      Arriving from the printed ferry QR code, on the operator side.

      Since #63 the homepage — and therefore every `/go/<source>` route — is
      travellers-only, so the operator anchor no longer opens a form in place.
      `LegacyProviderAnchor` redirects to `/operators#apply`, where the
      single-audience form renders with no tablist and no tabpanel, so this is
      scoped to the section rather than to a panel (#71).

      **The campaign source now survives that hop** (#70). It rides in the
      query, because a client-side `replace` leaves no referrer for anything
      downstream to infer from, and `/operators` validates it against the
      contract's enum before it can reach the payload. The assertion below was
      left deliberately failing by #71 rather than relaxed to "web"; this is
      the change that turns it green.
    */
    await page.goto("/go/ferry#providers");
    await expect(page).toHaveURL(/\/operators\?source=ferry#apply$/);
    const panel = page.locator("#apply");

    const phone = uniquePhone();
    await panel.getByLabel("Your name").fill("E2E Live Contact");
    await panel.getByLabel("Business name").fill("E2E Live Dive Co");
    await panel.getByLabel("Email").fill(`e2e-${Date.now()}@example.com`);
    await panel.getByLabel("WhatsApp number").fill(phone);
    await panel.getByText(/I agree to the/).click();
    await panel
      .getByRole("button", { name: "Apply as a founding operator" })
      .click();

    await expect(panel.getByRole("status")).toContainText(
      /application received|contact you/i,
      { timeout: 20_000 },
    );

    expect(sent?.audience).toBe("provider");

    /*
      Attribution must survive the journey from QR route to API payload, or
      campaign spend cannot be told apart from organic traffic — and it cannot
      be recovered afterwards, because a client-side redirect leaves no
      referrer to infer from. This is the whole reason `/go/*` exists.
    */
    expect(sent?.source).toBe("ferry");
  });
});
