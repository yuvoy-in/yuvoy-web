import { test, expect } from "./support/session";
import type { Locator, Page } from "@playwright/test";

/**
 * Only the visible copy of a control.
 *
 * `/operators` renders the form once; `/waitlist` renders both audiences and
 * hides one. Filtering on visibility is what the waitlist suite already does,
 * and it keeps a locator here from matching the hidden twin if these pages
 * ever share a shell.
 */
const rendered = (locator: Locator) => locator.filter({ visible: true });

/**
 * The operators form files an APPLICATION, not only a marketing lead.
 *
 * yuvoy-web#144. `POST /v1/operator-applications` had been in the contract
 * throughout and no front end anywhere called it, so there was no path from a
 * business filling in this form to an operator existing. **Two real businesses
 * sat in `leads` from 8 and 17 August**, unread — nobody ignored them, the
 * onboarding queue was never told they were there.
 *
 * The form said "somebody will call". Nobody could.
 */

interface Captured {
  applications: Record<string, unknown>[];
  leads: Record<string, unknown>[];
}

/**
 * Intercepts both writes.
 *
 * Registered on the applications route FIRST: Playwright matches the most
 * recently added route, and `**\/v1/leads` would not catch the other anyway —
 * but ordering them explicitly means a future glob that overlaps cannot
 * silently swallow the assertion this file exists to make.
 */
async function captureWrites(
  page: Page,
  opts: { application?: number; lead?: number } = {},
): Promise<Captured> {
  const seen: Captured = { applications: [], leads: [] };

  await page.route("**/v1/operator-applications", async (route) => {
    seen.applications.push(route.request().postDataJSON());
    const status = opts.application ?? 202;
    await route.fulfill({
      status,
      contentType: "application/json",
      body:
        status === 202
          ? JSON.stringify({ received: true, next: "call" })
          : JSON.stringify({ error: { message: "Nope.", details: {} } }),
    });
  });

  await page.route("**/v1/leads", async (route) => {
    seen.leads.push(route.request().postDataJSON());
    const status = opts.lead ?? 201;
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({
        id: "lead-id",
        audience: "provider",
        status: "recorded",
        createdAt: new Date().toISOString(),
      }),
    });
  });

  return seen;
}

async function fillApplication(page: Page) {
  const form = rendered(
    page.locator("form").filter({ hasText: /Business name/i }),
  );
  await form.getByLabel("Your name").fill("Asha Menon");
  await form.getByLabel("Business name").fill("Nemo Reef Divers");
  await form.getByLabel("Email").fill("asha@example.com");
  await form.getByLabel("WhatsApp number").fill("9000000000");
  await form.getByText(/I agree to the/).click();
  return form;
}

test("an application reaches the onboarding queue, not just the mailing list", async ({
  page,
}) => {
  await page.goto("/operators");
  const seen = await captureWrites(page);

  const form = await fillApplication(page);
  await form
    .getByRole("button", { name: /Apply|Send|Submit/i })
    .first()
    .click();

  await expect(page.getByRole("status")).toBeVisible();

  /*
    The assertion the original issue was about. Before it, `applications` was
    empty and `leads` had the row — and the form said somebody would call.
  */
  expect(seen.applications).toHaveLength(1);
  expect(seen.applications[0]).toMatchObject({
    businessName: "Nemo Reef Divers",
    contactName: "Asha Menon",
    phone: "+919000000000",
    email: "asha@example.com",
  });

  /*
    ONE WRITE, and the consent travels on it — yuvoy-web#157.

    This used to assert a SECOND request to `/leads`, because that was the only
    place `privacyAccepted` was recorded. Two independent writes with no
    transaction between them meant either could fail alone, and the failure
    that mattered left an application with no consent record on a site whose
    privacy policy says we hold one.

    `POST /operator-applications` now takes the consent itself and writes the
    application, the lead, its consent record and the ops alert in one
    transaction, linked. So the assertion inverts: the consent is ON the
    application, and there is no second call to half-fail.
  */
  expect(seen.applications[0]).toMatchObject({
    privacyAccepted: true,
    marketingOptIn: false,
  });
  expect(seen.leads).toHaveLength(0);
});

test("a decline is never sent as privacyAccepted: false", async ({ page }) => {
  /*
    `privacyAccepted` is a TRI-STATE server-side: omitted behaves as the
    endpoint always did, `true` writes both rows, and **`false` is refused with
    400** — recording a marketing contact for somebody who declined is the one
    outcome it must not produce.

    This form cannot be submitted without the box ticked, so the only two
    shapes that can reach the API are `true` and absent. Sending `false` as a
    default would turn a decline into a refused submission the applicant could
    not explain.
  */
  await page.goto("/operators");
  const seen = await captureWrites(page);

  const form = rendered(
    page.locator("form").filter({ hasText: /Business name/i }),
  );
  await form.getByLabel("Your name").fill("Asha Menon");
  await form.getByLabel("Business name").fill("Nemo Reef Divers");
  await form.getByLabel("Email").fill("asha@example.com");
  await form.getByLabel("WhatsApp number").fill("9000000000");
  // The box is deliberately NOT ticked.
  await form
    .getByRole("button", { name: /Apply|Send|Submit/i })
    .first()
    .click();

  expect(seen.applications).toHaveLength(0);
  expect(seen.leads).toHaveLength(0);
});

test("a failed application is reported as a failure", async ({ page }) => {
  /*
    There is no longer a half-success to disentangle — one call, one
    transaction, so either everything exists or nothing does (yuvoy-web#157).
    What has to stay right is the reporting: an applicant who is NOT in the
    queue must not be told they are, which is the exact promise that went
    unkept for a month.

    This test used to land a lead behind the failed application to prove the
    application decided the message. That scenario cannot occur any more, and
    asserting it would be testing a shape the code no longer has.
  */
  await page.goto("/operators");
  await captureWrites(page, { application: 503 });

  const form = await fillApplication(page);
  await form
    .getByRole("button", { name: /Apply|Send|Submit/i })
    .first()
    .click();

  /*
    Scoped to the form's own notice: Next renders an empty route announcer with
    the same role, so a page-wide `getByRole("alert")` is ambiguous.

    And the copy is the point — "Nothing was saved" is the truthful half. The
    lead DID land; the application did not, and the application is what decides
    whether anybody rings.
  */
  const notice = form.getByRole("alert");
  await expect(notice).toBeVisible();
  await expect(notice).toContainText(/Nothing was saved|isn.t answering/i);
  await expect(page.getByRole("status")).toHaveCount(0);
});

/*
  "A recorded application is a success even if the mailing list write fails"
  was here and is gone — yuvoy-web#157.

  It covered the other half of the two-write shape: they ARE in the queue, and
  a failed newsletter write is not their problem. That half-success is now
  impossible rather than handled — the lead is written in the same transaction
  as the application — so the test was asserting a state the system can no
  longer reach. Deleted rather than left passing vacuously against a request
  nothing makes.
*/

test("the operator form asks for a number, because an application needs one", async ({
  page,
}) => {
  /*
    `POST /operator-applications` requires `phone` — "the three fields needed
    to have a conversation: the business, a person, and a number that can be
    dialled". The traveller waitlist is untouched and still email-only.

    Submitting without one must fail HERE rather than at the API, so the
    applicant can fix it while they are still looking at the form.
  */
  await page.goto("/operators");
  const seen = await captureWrites(page);

  const form = rendered(
    page.locator("form").filter({ hasText: /Business name/i }),
  );
  await form.getByLabel("Your name").fill("Asha Menon");
  await form.getByLabel("Business name").fill("Nemo Reef Divers");
  await form.getByLabel("Email").fill("asha@example.com");
  await form.getByText(/I agree to the/).click();
  await form
    .getByRole("button", { name: /Apply|Send|Submit/i })
    .first()
    .click();

  await expect(form.getByText(/number we can call you on/i)).toBeVisible();
  expect(seen.applications).toHaveLength(0);
  expect(seen.leads).toHaveLength(0);
});

test("the traveller waitlist still needs no phone number", async ({ page }) => {
  // The relaxation that shipped on 2026-08-07 stands where it was aimed.
  await page.goto("/waitlist");
  const panel = rendered(page.getByRole("tabpanel", { name: /travelling/i }));
  await expect(panel.getByText(/optional/i).first()).toBeVisible();
});
