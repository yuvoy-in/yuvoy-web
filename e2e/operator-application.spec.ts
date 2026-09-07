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
    The assertion the whole issue is about. Before this, `applications` was
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
    And the lead still goes. `/leads` is the ONLY place `privacyAccepted` and
    `marketingOptIn` are recorded, and it is the launch announcement list —
    moving the form across cleanly would have quietly dropped the consent
    record for a form that asks somebody to accept a privacy policy.
  */
  expect(seen.leads).toHaveLength(1);
  expect(seen.leads[0]).toMatchObject({
    audience: "provider",
    privacyAccepted: true,
    businessName: "Nemo Reef Divers",
  });
});

test("a failed application is reported, even when the lead was recorded", async ({
  page,
}) => {
  /*
    The failure mode this change introduces, handled on purpose.

    "If it starts posting to a second endpoint, the failure mode changes from
    quietly wrong to visibly broken — which is better, but only if the error
    handling is real."

    A lead that lands behind a failed application means the applicant is NOT in
    the queue. Telling them "somebody will call" there is the exact promise
    that went unkept for a month.
  */
  await page.goto("/operators");
  await captureWrites(page, { application: 503, lead: 201 });

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

test("a recorded application is a success even if the mailing list write fails", async ({
  page,
}) => {
  // The other direction. They ARE in the queue; a failed newsletter write is
  // not their problem and must not be reported as a failed application.
  await page.goto("/operators");
  await captureWrites(page, { application: 202, lead: 503 });

  const form = await fillApplication(page);
  await form
    .getByRole("button", { name: /Apply|Send|Submit/i })
    .first()
    .click();

  await expect(page.getByRole("status")).toBeVisible();
});

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
