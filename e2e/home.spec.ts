import { test, expect, type Page } from "./support/session";
import { pageText } from "./support/text";

/**
 * Nothing on the page may claim a price, a rating or a review count — with
 * one owner-approved exception: the Season One phone preview, which is
 * visibly labelled as a preview and carries `data-preview` on its wrapper
 * (see docs/DESIGN_SYSTEM.md §8). The guard therefore asserts two things:
 * the rule holds everywhere *outside* that wrapper, and the label that
 * justifies the exception is actually present.
 */
const FABRICATED = /₹|\breviews?\b|\bratings?\b/i;

async function textOutsidePreview(page: Page): Promise<string> {
  return page.evaluate(() => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("[data-preview]").forEach((n) => n.remove());
    return clone.textContent ?? "";
  });
}

/** The homepage's registration section, which no longer has tabs. */
const registerForm = (page: Page) => page.locator("#register");

test("landing tells its story in headlines", async ({ page }) => {
  await page.goto("/");

  // The billboard test: the acts, readable as headings alone, in order.
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Watch real experiences. Make one yours.",
  );
  for (const heading of [
    /from too many tabs to one simple place/i,
    /opening in the andaman islands/i,
    /you run the experience/i,
    /be first to experience yuvoy/i,
    /not sure where to start/i,
  ]) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});

/*
  The homepage answers "what, where and how" before the form. Those three
  sections are the whole reason the strategy act (three islands, one season,
  100% operator-filmed) came off the page: it argued a launch wedge at someone
  who had not yet been told what the product does or where it works.
*/
test("the homepage says what Yuvoy is, where it opens and what you can do", async ({
  page,
}) => {
  await page.goto("/");
  // `pageText`, not `page.textContent("body")`: the helper waits for the
  // route to have rendered, and a one-shot read can otherwise capture
  // `loading.tsx` while the dev server is still compiling.
  const body = await pageText(page);

  // Where. Every destination, from the data layer, linked.
  for (const slug of ["havelock", "neil-island", "port-blair"]) {
    await expect(
      page.locator(`a[href="/destinations/${slug}"]`).first(),
    ).toBeVisible();
  }

  // What kind of day, and how to browse it, is /explore's job as of
  // 2026-08-07 — the homepage points there rather than answering it a third
  // time, so the way out is what must exist here.
  await expect(
    page.locator('a[href="/explore"], a[href^="/explore#"]').first(),
  ).toBeVisible();

  // Who runs the experiences, named once, with one way out to their page.
  expect(body).toMatch(/you run the experience/i);
});

/*
  Two things came off this page on 2026-08-07 and must not drift back: the
  category grid, which /explore now carries with its photography, and the
  "Don't be a tourist. Experience more." sign-off, which repeated the tagline
  already drawn into the wordmark a screen below it.
*/
test("the homepage does not repeat what /explore and the mark already say", async ({
  page,
}) => {
  await page.goto("/");
  const body = await pageText(page);

  expect(body).not.toMatch(/don.t be a tourist/i);
  expect(body).not.toMatch(/choose the kind of day/i);
});

/*
  The homepage is addressed to travellers, and names the other audience once.

  The operator pitch moved to /operators on 2026-08-04 because a traveller was
  reading a case aimed at someone else on the way to a form that then asked
  which of the two they were. A three-sentence introduction and a way out is
  not that pitch — so what is asserted here is the boundary, not the absence:
  no operator form, no audience picker, no operator tooling argument, and a
  single exit to the page that carries all of it.
*/
test("the homepage speaks to travellers and points operators elsewhere", async ({
  page,
}) => {
  await page.goto("/");

  // No audience picker: there is nothing to choose between here.
  await expect(page.getByRole("tab")).toHaveCount(0);

  // The operator case itself is not argued here.
  const body = await pageText(page);
  expect(body).not.toMatch(/Season One roster/i);
  expect(body).not.toMatch(/Experience OS/i);
  expect(body).not.toMatch(/six apps/i);

  // But the way out exists, once, and lands on the application.
  const operatorCta = page.getByRole("link", {
    name: /apply as a founding operator/i,
  });
  await expect(operatorCta).toHaveCount(1);
  await expect(operatorCta).toHaveAttribute("href", "/operators#apply");

  // The traveller form is the one that renders, with its own fields.
  await expect(registerForm(page).getByLabel("Name")).toBeVisible();
  await expect(registerForm(page).getByLabel("Business name")).toHaveCount(0);
});

test("invented numbers stay inside the preview", async ({ page }) => {
  await page.goto("/");

  // Exactly one wrapper may carry the exception…
  await expect(page.locator("[data-preview]")).toHaveCount(1);

  // …and the rule holds everywhere else.
  expect(await textOutsidePreview(page)).not.toMatch(FABRICATED);
});

/*
  The why-section tour: the rail is the demo's control surface, so clicking a
  step must mark that step current (the phone itself is aria-hidden
  illustration, which is exactly why the rail has to carry the state). The
  assertion is timing-safe: seeking is synchronous, and the sought act holds
  aria-current for its full multi-second run.
*/
test("the demo rail seeks the flow and reports its position", async ({
  page,
}) => {
  await page.goto("/");

  const bookStep = page.getByRole("button", { name: /^Book/ });
  await bookStep.scrollIntoViewIfNeeded();
  await bookStep.click();
  await expect(bookStep).toHaveAttribute("aria-current", "step");

  const watchStep = page.getByRole("button", { name: /^Watch/ });
  await watchStep.click();
  await expect(watchStep).toHaveAttribute("aria-current", "step");
  await expect(bookStep).not.toHaveAttribute("aria-current", "step");
});

/*
  The page shows a full booking flow, right down to a payment, so it has to
  say plainly that none of it is live yet. Three things carry that, and none
  may quietly go: the frame's caption (DESIGN_SYSTEM §8), its accessible
  name, and the registration section's flat "no". The long-form caveat that
  used to close the why act was dropped on owner direction, 2026-08-06.
*/
test("the page states that nothing is bookable yet", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Sample preview")).toBeVisible();
  await expect(
    page.getByRole("group", { name: /nothing is bookable yet/i }),
  ).toBeVisible();
  // The registration FAQ's first answer, in the DOM whether or not the
  // disclosure is open.
  await expect(
    page.getByText("Yuvoy is currently preparing its first collection", {
      exact: false,
    }),
  ).toBeAttached();
});

/*
  Three questions at the form, not four. The two that went were a defence of
  trusting an unlaunched waitlist and a restatement of the water-safety
  position: both true, neither belonging at the point of conversion. The
  safety position lives on /safety, where someone looking for it will go.
*/
test("the registration FAQ is three questions", async ({ page }) => {
  await page.goto("/");
  await expect(registerForm(page).locator("details")).toHaveCount(3);
});

test("the cover's momentum line states only true facts", async ({ page }) => {
  await page.goto("/");

  /*
    This asserted "3 founding operators signed" was visible, and it was doing
    its job — it is why the claim was findable at all (yuvoy-web#151). But it
    was pinning a claim we cannot stand behind: the owner was asked directly
    on 2026-09-09 and it is not accurate.

    So the check is not deleted, it is inverted. The two facts that ARE true
    are asserted positively, and the retired one is asserted absent, so it
    cannot come back without somebody meaning it.
  */
  await expect(page.getByText("Waitlist open")).toBeVisible();
  await expect(page.getByText("No payment required")).toBeVisible();
  /*
    The banned thing is a COUNT of operators, not the phrase "founding
    operator" — which is a legitimate call to action on this page and across
    the site ("Apply as a founding operator"). A first pass at this check
    banned the phrase and failed on that CTA, which is the right failure for
    the wrong assertion.

    So: no number of operators, signed or otherwise, anywhere the reader meets
    — outside the preview wrapper, which is the owner-approved place for
    illustrative content (DESIGN_SYSTEM §8). A number here is a checkable
    claim about the business, and the last one went stale in five weeks
    without anybody noticing.
  */
  await expect(page.getByText(/\d+\s+founding operators/i)).toHaveCount(0);
  const text = await pageText(page, { excludePreview: true });
  expect(text).not.toMatch(/\b\d+\s+(founding\s+)?operators?\b/i);
});

test("the cover CTA opens the app, carrying attribution", async ({ page }) => {
  /*
    It anchored to `#register` — the waitlist form further down this page —
    which was right for exactly as long as there was nothing to browse. Both
    product hosts are live now, so the cover sends people to the product
    (yuvoy-web#154).

    The href is asserted rather than followed: clicking would leave the origin
    for a different application, and this suite's job is this site.
  */
  await page.goto("/");

  const cover = page.locator("main > section[data-dark-hero]").first();
  const cta = cover.getByRole("link", { name: "Browse experiences" });
  const href = await cta.getAttribute("href");
  const url = new URL(href!);

  expect(url.origin).toBe("https://app.yuvoy.in");
  /*
    The app reads exactly four parameters and drops the object entirely when
    `src` is unrecognised — so a wrong value here records NO attribution, not
    a fallback to `unknown`. `web` only became a legal value in yuvoy-api#135.
  */
  expect(url.searchParams.get("src")).toBe("web");
  expect(url.searchParams.get("placement")).toBe("hero");

  // And the waitlist is still reachable from this page, one act down.
  await expect(registerForm(page).getByLabel("Name")).toBeVisible();
});

/*
  The operator route out of the homepage is the header, at every breakpoint —
  that is the whole reason the homepage can drop the operator pitch.
*/
test("the header sends operators to their own page", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("banner")
    .getByRole("link", { name: "For operators" })
    .click();
  await expect(page).toHaveURL(/\/operators$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /yuvoy helps people find and book it/i,
  );
});

/*
  /waitlist used to be a permanent redirect onto these anchors. Browsers cache
  308s indefinitely, so both must keep resolving somewhere coherent — and
  campaign traffic converts on the page it lands on.

  Each anchor gets its own test, and therefore its own fresh page. Visiting
  them one after another in a single test is a same-document navigation, which
  is not the path a visitor following a cached redirect actually takes.
*/
test("the homepage still registers in place at #register", async ({ page }) => {
  await page.goto("/#register");
  await expect(registerForm(page).getByLabel("Name")).toBeVisible();
});

test("#providers now carries operators to the application itself", async ({
  page,
}) => {
  await page.goto("/#providers");

  // The homepage has no operator form to open any more, so the long-lived
  // anchor must land on the one that does rather than on nothing.
  await expect(page).toHaveURL(/\/operators#apply$/);
  // And it lands on the application itself, not a notice standing in for it
  // (yuvoy-in/yuvoy-api#4 shipped 2026-08-07).
  await expect(page.locator("#apply")).toContainText(/Business name/i);
});

test("traveller form surfaces validation errors without a network call", async ({
  page,
}) => {
  await page.goto("/#register");
  // Submitting empty must fail client-side: block any accidental API call.
  await page.route("**/v1/leads", (route) => route.abort());
  const form = registerForm(page);
  await form.getByRole("button", { name: "Join the waitlist" }).click();

  // Every failing field reports at once. Submitting an empty form used to
  // report the name and the consent box but not the contact, because the
  // contact rule was an object-level refinement that Zod skips once a field
  // has already failed. Email being required outright removed that whole
  // class of bug along with the custom resolver that worked around it.
  await expect(form.getByText("Enter your name.")).toBeVisible();
  await expect(
    form.getByRole("alert").filter({ hasText: /enter your email address/i }),
  ).toBeVisible();
  await expect(form.getByText(/accept the privacy policy/i)).toBeVisible();
});

test("traveller form success state (API stubbed)", async ({ page }) => {
  await page.goto("/#register");
  await page.route("**/v1/leads", (route) =>
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: "test-id",
        audience: "traveller",
        status: "recorded",
        createdAt: new Date().toISOString(),
      }),
    }),
  );

  const form = registerForm(page);
  await form.getByLabel("Name").fill("Test Person");
  await form.getByLabel("Email").fill("test@example.com");
  await form.getByLabel("WhatsApp number").fill("9000000000");
  await form.getByText(/I agree to the/).click();
  await form.getByRole("button", { name: "Join the waitlist" }).click();

  await expect(form.getByRole("status")).toContainText(
    /You[’']re on the Yuvoy waitlist/,
  );
  // A future promise, never "check your inbox" — there is no autoresponder.
  // Expressed per destination rather than per market, so it does not have to
  // be rewritten the day a second one opens.
  await expect(form.getByRole("status")).toContainText(
    /We will get in touch when experiences for your destination are ready\./,
  );
});

/*
  The API contract has always said a traveller supplies "at least one of
  whatsapp or email". The form required a number from everyone until
  2026-08-06, which turned away anyone unwilling to hand a phone number to a
  site that cannot yet sell them anything.
*/
test("traveller form accepts an email address instead of a number", async ({
  page,
}) => {
  await page.goto("/#register");

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

  const form = registerForm(page);
  await form.getByLabel("Name").fill("Test Person");
  await form.getByLabel("Email").fill("someone@example.com");
  await form.getByText(/I agree to the/).click();
  await form.getByRole("button", { name: "Join the waitlist" }).click();

  await expect(form.getByRole("status")).toBeVisible();
  // Omitted, not sent empty: "at least one of" is a contract rule about
  // presence, and an empty string is a value.
  expect(submitted).toMatchObject({ email: "someone@example.com" });
  expect(submitted).not.toHaveProperty("whatsapp");
});

/*
  Email is required and WhatsApp is not (owner direction, 2026-08-07): email
  is the channel the launch announcement is actually sent on, and a number is
  what the conversation afterwards runs on. Submitting without an address must
  fail client-side, and must say so on the field.
*/
test("traveller form refuses to submit without an email address", async ({
  page,
}) => {
  await page.goto("/#register");
  await page.route("**/v1/leads", (route) => route.abort());

  const form = registerForm(page);
  await form.getByLabel("Name").fill("Test Person");
  // Deliberately no email. A WhatsApp number alone is not enough any more,
  // so it is filled to prove the rejection is about the address and not
  // about the form simply being empty.
  await form.getByLabel("WhatsApp number").fill("9000000000");
  await form.getByText(/I agree to the/).click();
  await form.getByRole("button", { name: "Join the waitlist" }).click();

  await expect(
    form.getByRole("alert").filter({ hasText: /enter your email address/i }),
  ).toBeVisible();
});

test("unavailable API produces a truthful failure, never fake success", async ({
  page,
}) => {
  await page.goto("/#register");
  await page.route("**/v1/leads", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  );

  const form = registerForm(page);
  await form.getByLabel("Name").fill("Test Person");
  await form.getByLabel("Email").fill("test@example.com");
  await form.getByLabel("WhatsApp number").fill("9000000000");
  await form.getByText(/I agree to the/).click();
  await form.getByRole("button", { name: "Join the waitlist" }).click();

  await expect(form.getByRole("alert")).toContainText(/couldn't save/i);
  await expect(form.getByText(/on the yuvoy waitlist/i)).toHaveCount(0);
});

test("campaign route renders with noindex and canonical to home", async ({
  page,
}) => {
  await page.goto("/go/ferry");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Watch real experiences. Make one yours.",
  );
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /^https?:\/\/[^/]+\/?$/, // the site root, never /go/<source>
  );
});

test("retired routes answer 410, not 404", async ({ request }) => {
  // The seeded experience detail slugs carried invented prices and review
  // counts and are still in Google's index, so they must keep answering 410
  // and get dropped rather than recrawled. /philosophy remains retired.
  for (const path of [
    "/experiences/sunrise-scuba-dive",
    "/experiences/anything-else",
    "/philosophy",
  ]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(410);
  }

  // The consolidated routes are redirects, not 410s: they had real content
  // that now lives on /explore, and a 410 would throw away the link equity.
  expect((await request.get("/experiences")).status()).toBe(200);
  expect((await request.get("/journal")).status()).toBe(200);
});
