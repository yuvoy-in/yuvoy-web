import { test, expect } from "./support/session";
import {
  ID,
  ID_SECOND,
  REFERENCE,
  CODE_MESSAGE,
  NEW_CODE_MESSAGE,
  DONE_MESSAGE,
  NOT_FOUND,
  WITH_TEAM,
  WRONG_CODE,
  FAILED,
  OFFLINE,
  today,
  refusal,
  receipt,
  STUB,
  stubApi,
  button,
  field,
  openForm,
  fillEvent,
  consentBox,
  send,
  toCodeStep,
  confirmCode,
  expectFieldError,
  expectEventKept,
  axeViolations,
} from "./support/submit-kit";

/**
 * `/submit`: an organiser sends one event, proves the email with a code, and
 * gets a reference (yuvoy-web#177, R3-T3). The issue's cases 1 to 22, in its
 * order; case 23 is a real send on dev and is done by hand.
 *
 * Every call is stubbed with `page.route` against the suite's placeholder API
 * origin (`NEXT_PUBLIC_API_BASE_URL=http://api.test`, playwright.config.ts).
 * The limits and the 10-minute code life are stub sequences, not real time.
 *
 * The stubs answer in the API's real sentences where the case is about the
 * page showing them, and in words the API never uses where the case is about
 * the page not reading them (case 21).
 */

test.describe("/submit, the organiser form", () => {
  // 10. Consent.
  test("10. the consent box unticked: the form cannot be sent", async ({
    page,
  }) => {
    const seen = await openForm(page);
    await fillEvent(page, { consent: false });
    await send(page);
    await expectFieldError(
      page,
      consentBox(page),
      "Tick this to confirm you can list the event.",
    );
    expect(seen.submits).toEqual([]);
  });

  // 11. The trap field.
  test("11. the trap field: never seen or reached, read as Leave this empty", async ({
    page,
  }) => {
    await openForm(page);
    const trap = page.getByLabel("Leave this empty", { exact: true });

    await expect(trap).toHaveAttribute("tabindex", "-1");
    await expect(trap).toHaveAttribute("autocomplete", "off");
    // Moved out of view, not `display: none`: it has a box, off the screen.
    await expect(trap).toBeVisible();
    await expect(trap).not.toBeInViewport();

    // Tab through the whole form; focus never lands on it.
    await field(page, "Event name").focus();
    const visited: string[] = [];
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press("Tab");
      visited.push(await page.evaluate(() => document.activeElement?.id ?? ""));
    }
    expect(visited).toContain("submit-email");
    expect(visited).not.toContain("submit-extra");
  });

  test("11. the trap field filled: sent as it is, then a 404 on the code and the resend", async ({
    page,
  }) => {
    const seen = await openForm(page, {
      verify: STUB.unknownId,
      resend: STUB.unknownId,
    });
    await fillEvent(page);
    await page
      .getByLabel("Leave this empty", { exact: true })
      .fill("I am not a person", { force: true });
    await send(page);

    await expect(
      page.getByRole("heading", { name: "Check your email" }),
    ).toBeVisible();
    expect(seen.submits[0].extra).toBe("I am not a person");

    await confirmCode(page, "123456");
    await expect(
      page.getByRole("alert").filter({ hasText: NOT_FOUND }),
    ).toBeVisible();
    await button(page, "Send a new code").click();
    await expect(
      page.getByRole("alert").filter({ hasText: NOT_FOUND }),
    ).toBeVisible();
    expect(seen.resends).toEqual([ID]);
  });

  // 12. A wrong code.
  test("12. a wrong code says so and keeps the form", async ({ page }) => {
    await openForm(page, { verify: STUB.wrongCode });
    await toCodeStep(page);

    await confirmCode(page, "000000");
    await expect(
      page.getByRole("alert").filter({ hasText: WRONG_CODE }),
    ).toBeVisible();
    await expect(field(page, "Code")).toHaveValue("");

    await button(page, "Back to the form").click();
    await expectEventKept(page);
  });

  test("12. five wrong codes, then the right one: still 401 until a new code", async ({
    page,
  }) => {
    let resent = false;
    const seen = await openForm(page, {
      verify: (_n, _id, code) =>
        resent && code === "654321" ? STUB.done : STUB.wrongCode,
      resend: () => {
        resent = true;
        return STUB.resent;
      },
    });
    await toCodeStep(page);

    for (const code of [
      "000001",
      "000002",
      "000003",
      "000004",
      "000005",
      "123456",
    ]) {
      await confirmCode(page, code);
      await expect(
        page.getByRole("alert").filter({ hasText: WRONG_CODE }),
      ).toBeVisible();
      await expect(field(page, "Code")).toHaveValue("");
    }
    expect(seen.verifies).toHaveLength(6);

    await button(page, "Send a new code").click();
    await expect(page.getByText(NEW_CODE_MESSAGE)).toBeVisible();
    await confirmCode(page, "654321");
    await expect(page.getByText(DONE_MESSAGE)).toBeVisible();
  });

  // 13. A new code.
  test("13. a new code replaces the message, and the new code works", async ({
    page,
  }) => {
    const seen = await openForm(page);
    await toCodeStep(page);
    await expect(page.getByText(CODE_MESSAGE)).toBeVisible();

    await button(page, "Send a new code").click();
    await expect(page.getByText(NEW_CODE_MESSAGE)).toBeVisible();
    await expect(page.getByText(CODE_MESSAGE)).toHaveCount(0);
    expect(seen.resends).toEqual([ID]);

    await confirmCode(page, "654321");
    await expect(page.getByText(DONE_MESSAGE)).toBeVisible();
  });

  // 14. An expired code.
  test("14. an expired code is refused, and a new code then works", async ({
    page,
  }) => {
    let resent = false;
    await openForm(page, {
      // Past its 10 minutes the API answers a code exactly as a wrong one.
      verify: () => (resent ? STUB.done : STUB.wrongCode),
      resend: () => {
        resent = true;
        return STUB.resent;
      },
    });
    await toCodeStep(page);

    await confirmCode(page, "123456");
    await expect(
      page.getByRole("alert").filter({ hasText: WRONG_CODE }),
    ).toBeVisible();

    await button(page, "Send a new code").click();
    await expect(page.getByText(NEW_CODE_MESSAGE)).toBeVisible();
    await confirmCode(page, "654321");
    await expect(page.getByText(DONE_MESSAGE)).toBeVisible();
  });

  // 15. Too many.
  test("15. the fourth submission in a day: 429, its sentence, and the button held off", async ({
    page,
  }) => {
    await openForm(page, {
      submit: (n) => (n < 4 ? STUB.accepted : STUB.throttledDay),
    });
    for (let i = 0; i < 3; i++) {
      await toCodeStep(page);
      await button(page, "Back to the form").click();
    }
    await send(page);
    await expect(
      page.getByRole("alert").filter({
        hasText: "Too many submissions from you today. Try again tomorrow.",
      }),
    ).toBeVisible();
    // Retry-After: 3600, so the button stays off for the hour.
    await expect(button(page, "Send to Yuvoy")).toBeDisabled();
    await expectEventKept(page);
  });

  test("15. sent too fast: 429 with no Retry-After shows the sentence as sent", async ({
    page,
  }) => {
    await openForm(page, { submit: STUB.throttledFast });
    await fillEvent(page);
    await send(page);
    await expect(
      page.getByRole("alert").filter({
        hasText: "too many event submissions. Slow down and try again shortly",
      }),
    ).toBeVisible();
    await expect(button(page, "Send to Yuvoy")).toBeEnabled();
  });

  test("15. the sixth code in an hour and the eleventh try: 429 and their sentences", async ({
    page,
  }) => {
    const seen = await openForm(page, {
      resend: (n) => (n < 5 ? STUB.resent : STUB.throttledCodes),
      verify: (n) => (n < 11 ? STUB.wrongCode : STUB.throttledTries),
    });
    await toCodeStep(page);

    const resend = button(page, "Send a new code");
    for (let i = 1; i <= 4; i++) {
      await resend.click();
      await expect.poll(() => seen.resends.length).toBe(i);
      await expect(resend).toBeEnabled();
    }
    await expect(page.getByText(NEW_CODE_MESSAGE)).toBeVisible();
    await expect(page.locator("main").getByRole("alert")).toHaveCount(0);

    await resend.click();
    await expect(
      page.getByRole("alert").filter({
        hasText: "Too many codes for this address. Try again in an hour.",
      }),
    ).toBeVisible();

    for (let i = 1; i <= 10; i++) {
      await confirmCode(page, "000000");
      await expect.poll(() => seen.verifies.length).toBe(i);
      await expect(field(page, "Code")).toHaveValue("");
    }
    await expect(
      page.getByRole("alert").filter({ hasText: WRONG_CODE }),
    ).toBeVisible();
    await confirmCode(page, "000000");
    await expect(
      page.getByRole("alert").filter({
        hasText: "Too many tries. Try again in an hour.",
      }),
    ).toBeVisible();
  });

  // 16. Double confirm.
  test("16. a double tap sends one confirm", async ({ page }) => {
    const seen = await openForm(page, {
      verify: (n) => (n === 1 ? { ...STUB.done, delayMs: 600 } : STUB.withTeam),
    });
    await toCodeStep(page);
    await field(page, "Code").fill("123456");
    await button(page, "Confirm").dblclick();

    await expect(page.getByText(DONE_MESSAGE)).toBeVisible();
    expect(seen.verifies).toHaveLength(1);
  });

  test("16. a second tab's 409 shows the done state, never an error", async ({
    page,
  }) => {
    await openForm(page, { verify: STUB.withTeam });
    await toCodeStep(page);
    await confirmCode(page, "123456");

    await expect(page.getByText(WITH_TEAM)).toBeVisible();
    await expect(
      page.getByText(`Your reference is ${REFERENCE}.`),
    ).toBeVisible();
    await expect(button(page, "Send another event")).toBeVisible();
    // Inside the page's own content: Next's route announcer is an alert too.
    await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  });

  // 17. An unknown id.
  test("17. an unknown id: its sentence, and a way back with every field kept", async ({
    page,
  }) => {
    await openForm(page, { verify: STUB.unknownId });
    await toCodeStep(page);
    await confirmCode(page, "123456");
    await expect(
      page.getByRole("alert").filter({ hasText: NOT_FOUND }),
    ).toBeVisible();

    await button(page, "Back to the form").click();
    await expectEventKept(page);
  });

  // 18. Offline and network failure.
  test("18. offline turns Send off with its sentence, and back on", async ({
    page,
  }) => {
    await openForm(page);
    await fillEvent(page);

    await page.context().setOffline(true);
    await expect(page.getByText(OFFLINE)).toBeVisible();
    await expect(button(page, "Send to Yuvoy")).toBeDisabled();
    await expectEventKept(page);

    await page.context().setOffline(false);
    await expect(page.getByText(OFFLINE)).toHaveCount(0);
    await expect(button(page, "Send to Yuvoy")).toBeEnabled();
  });

  test("18. a failed request keeps every field and says so", async ({
    page,
  }) => {
    await openForm(page, { submit: () => "abort" });
    await fillEvent(page);
    await send(page);
    await expect(
      page.getByRole("alert").filter({ hasText: FAILED }),
    ).toBeVisible();
    await expectEventKept(page);
  });

  // 19. Send another event.
  test("19. Send another event clears the form and starts again", async ({
    page,
  }) => {
    await openForm(page);
    await toCodeStep(page);
    await confirmCode(page, "123456");
    await button(page, "Send another event").click();

    await expect(field(page, "Event name")).toHaveValue("");
    await expect(field(page, "Your email")).toHaveValue("");
    await expect(field(page, "Where is it?")).toHaveValue("");
    await expect(
      page.getByRole("radio", { name: "Free", exact: true }),
    ).not.toBeChecked();
    await expect(consentBox(page)).not.toBeChecked();
  });

  // 20. Two events from one email.
  test("20. two events from one email each confirm with their own id", async ({
    page,
  }) => {
    const seen = await openForm(page, {
      submit: (n) => (n === 1 ? receipt(ID) : receipt(ID_SECOND)),
    });
    await toCodeStep(page);
    await button(page, "Back to the form").click();

    await field(page, "Event name").fill("Monday jazz at the lake");
    await send(page);
    await expect(
      page.getByRole("heading", { name: "Check your email" }),
    ).toBeVisible();

    await confirmCode(page, "123456");
    await expect(page.getByText(DONE_MESSAGE)).toBeVisible();
    expect(seen.submits.map((s) => s.title)).toEqual([
      "Sunday jazz at the lake",
      "Monday jazz at the lake",
    ]);
    // Confirming the second never touched the first.
    expect(seen.verifies).toEqual([{ id: ID_SECOND, code: "123456" }]);
  });

  // 21. Status and code, never words.
  test("21. outcomes follow the status and code, and every sentence is shown as sent", async ({
    page,
  }) => {
    let tries = 0;
    await openForm(page, {
      verify: () =>
        ++tries === 1
          ? refusal(401, "unauthorized", "Codes are fussy today.")
          : refusal(409, "conflict", "Already in, thank you."),
    });
    await toCodeStep(page);

    // A 401 in any words is a wrong code: shown as sent, the box emptied.
    await confirmCode(page, "123456");
    await expect(
      page.getByRole("alert").filter({ hasText: "Codes are fussy today." }),
    ).toBeVisible();
    await expect(field(page, "Code")).toHaveValue("");

    // A 409 in any words is the done state, with those words.
    await confirmCode(page, "123456");
    await expect(page.getByText("Already in, thank you.")).toBeVisible();
    await expect(
      page.getByText(`Your reference is ${REFERENCE}.`),
    ).toBeVisible();
  });

  // 22. Accessibility.
  test("22. no axe violations on the form, the code step or the done state", async ({
    page,
  }) => {
    await openForm(page);
    expect(await axeViolations(page)).toEqual([]);

    await toCodeStep(page);
    expect(await axeViolations(page)).toEqual([]);

    await confirmCode(page, "123456");
    await expect(page.getByText(DONE_MESSAGE)).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });

  test("22. no axe violations with every field error showing", async ({
    page,
  }) => {
    await openForm(page);
    await send(page);
    await expect(page.getByText("Name the venue.")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });

  test("is kept out of the index", async ({ page }) => {
    await stubApi(page);
    await page.goto("/submit");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });
});
