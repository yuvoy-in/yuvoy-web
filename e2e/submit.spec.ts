import type { Locator } from "@playwright/test";

import { addDays } from "../src/lib/submit/local-day";
import { test, expect } from "./support/session";
import {
  ID,
  REFERENCE,
  CODE_MESSAGE,
  DONE_MESSAGE,
  SOON,
  PAUSED,
  today,
  PLACES,
  refusal,
  STUB,
  reply,
  stubApi,
  button,
  field,
  openForm,
  FREE_EVENT,
  fillEvent,
  consentBox,
  send,
  toCodeStep,
  confirmCode,
  expectFieldError,
  expectEventKept,
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

/* ------------------------------------------------------------------ cases */

test.describe("/submit, the organiser form", () => {
  // 1. Closed.
  for (const [what, config] of [
    ["off", { releases: { checkedCities: "off" } }],
    ["staff", { releases: { checkedCities: "staff" } }],
    ["early", { releases: { checkedCities: "early" } }],
    ["missing", { releases: {} }],
    ["no releases", {}],
  ] as const) {
    test(`1. closed with checkedCities ${what}: soon, and no form`, async ({
      page,
    }) => {
      await stubApi(page, { config });
      await page.goto("/submit");
      await expect(page.getByText(SOON)).toBeVisible();
      await expect(field(page, "Event name")).toHaveCount(0);
    });
  }

  test("1. a 404 on submit shows the same soon state", async ({ page }) => {
    await openForm(page, { submit: STUB.closed });
    await fillEvent(page);
    await send(page);
    await expect(page.getByText(SOON)).toBeVisible();
    await expect(field(page, "Event name")).toHaveCount(0);
  });

  // 2. Paused.
  test("2. paused: a 503 on submit shows the API's sentence and keeps every field", async ({
    page,
  }) => {
    await openForm(page, { submit: STUB.paused });
    await fillEvent(page);
    await send(page);
    await expect(
      page.getByRole("alert").filter({ hasText: PAUSED }),
    ).toBeVisible();
    await expectEventKept(page);
  });

  test("2. paused: a 503 on the code and the resend shows the sentence", async ({
    page,
  }) => {
    await openForm(page, { verify: STUB.paused, resend: STUB.paused });
    await toCodeStep(page);

    await confirmCode(page, "123456");
    await expect(
      page.getByRole("alert").filter({ hasText: PAUSED }),
    ).toBeVisible();

    await button(page, "Send a new code").click();
    await expect(
      page.getByRole("alert").filter({ hasText: PAUSED }),
    ).toBeVisible();

    await button(page, "Back to the form").click();
    await expectEventKept(page);
  });

  // 3. Places.
  test("3. places: only discover destinations, as {place}, {region}", async ({
    page,
  }) => {
    await openForm(page);
    const options = await field(page, "Where is it?")
      .locator("option:not([value=''])")
      .allTextContents();
    expect(options).toEqual([
      "Indiranagar, Bengaluru",
      "Koramangala, Bengaluru",
    ]);
  });

  test("3. places: none to discover is the soon state", async ({ page }) => {
    await stubApi(page, { places: { markets: [PLACES.markets[0]] } });
    await page.goto("/submit");
    await expect(page.getByText(SOON)).toBeVisible();
    await expect(field(page, "Event name")).toHaveCount(0);
  });

  test("3. places or the kinds of thing unreadable: the load failure, and Try again", async ({
    page,
  }) => {
    let up = false;
    await stubApi(page);
    // Registered last, so it answers first: Playwright runs the newest route.
    await page.route("**/v1/places", (route) =>
      up
        ? reply(route, { status: 200, body: PLACES })
        : reply(route, refusal(503, "unavailable", "Catalog down.")),
    );
    await page.goto("/submit");

    await expect(
      page.getByText(
        "We couldn't load the form. Check your connection and try again.",
      ),
    ).toBeVisible();
    await expect(field(page, "Event name")).toHaveCount(0);

    up = true;
    await button(page, "Try again").click();
    await expect(field(page, "Event name")).toBeVisible();
  });

  // 4. A free one-day event, end to end.
  test("4. an organiser sends an event and confirms the code", async ({
    page,
  }) => {
    const seen = await openForm(page);
    await toCodeStep(page);

    // Only the contract's fields, and no empty optional one.
    expect(seen.submits).toHaveLength(1);
    expect(seen.submits[0]).toEqual({
      destinationKey: "bengaluru/indiranagar",
      title: "Sunday jazz at the lake",
      department: "events",
      startsOn: FREE_EVENT().startsOn,
      venue: "The Lake Stage",
      isFree: true,
      officialUrl: "https://example.org/jazz",
      organiserName: "Lake Arts Trust",
      email: "events@example.org",
      consent: true,
      extra: "",
    });

    // The receipt's message as sent, and never the development code.
    await expect(page.getByText(CODE_MESSAGE)).toBeVisible();
    await expect(page.locator("main")).not.toContainText("999999");

    await confirmCode(page, "123456");
    expect(seen.verifies).toEqual([{ id: ID, code: "123456" }]);
    await expect(page.getByText(DONE_MESSAGE)).toBeVisible();
    await expect(
      page.getByText(`Your reference is ${REFERENCE}.`),
    ).toBeVisible();
  });

  // 5. A paid event over three days.
  test("5. a paid event over three days carries both prices in paise", async ({
    page,
  }) => {
    const seen = await openForm(page);
    const start = addDays(today(), 10);
    await toCodeStep(page, {
      startsOn: start,
      startTime: "18:00",
      endsOn: addDays(start, 2),
      endTime: "22:00",
      price: "Paid",
      lowest: "1,500",
      highest: "3,000",
    });

    expect(seen.submits[0]).toMatchObject({
      startsOn: start,
      startTime: "18:00",
      endsOn: addDays(start, 2),
      endTime: "22:00",
      isFree: false,
      priceFrom: { amountMinor: 150000, currency: "INR" },
      priceTo: { amountMinor: 300000, currency: "INR" },
    });
  });

  // 6. Every field error in the page, before any call.
  test("6. every field error is announced", async ({ page }) => {
    const seen = await openForm(page);
    await send(page);

    const radio = page.getByRole("radio", { name: "Free", exact: true });
    const expected: [Locator, string][] = [
      [
        field(page, "Event name"),
        "Give the event a name of 3 to 120 characters.",
      ],
      [
        field(page, "What kind of thing is it?"),
        "Pick what kind of thing it is.",
      ],
      [field(page, "Where is it?"), "Pick where it is."],
      [field(page, "Venue"), "Name the venue."],
      [field(page, "Date"), "Pick a date from today up to a year ahead."],
      [radio, "Say whether it is free or paid."],
      [
        field(page, "Link to the event page"),
        "Paste a link that starts with https:// or http://.",
      ],
      [field(page, "Organiser name"), "Name the organiser."],
      [
        field(page, "Your email"),
        "Enter an email address we can send a code to.",
      ],
      [consentBox(page), "Tick this to confirm you can list the event."],
    ];
    for (const [input, sentence] of expected) {
      await expectFieldError(page, input, sentence);
    }
    // Focus goes to the first field that needs the organiser.
    await expect(field(page, "Event name")).toBeFocused();

    // The rules that span two fields.
    await fillEvent(page, {
      startTime: "18:00",
      endTime: "17:00",
      price: "Paid",
      lowest: "",
    });
    await send(page);
    await expectFieldError(
      page,
      field(page, "End time (optional)"),
      "The end time must be after the start time.",
    );
    await expectFieldError(
      page,
      field(page, "Lowest ticket price (₹)"),
      "Enter the lowest ticket price in rupees, from 1 to 1,00,000.",
    );

    const start = FREE_EVENT().startsOn;
    await fillEvent(page, {
      endsOn: addDays(start, -1),
      price: "Paid",
      lowest: "500",
      highest: "100",
    });
    await send(page);
    await expectFieldError(
      page,
      field(page, "End date (optional)"),
      "The end date can't be before the start, or more than 30 days after it.",
    );
    await expectFieldError(
      page,
      field(page, "Highest ticket price (₹, optional)"),
      "The highest price can't be below the lowest.",
    );

    expect(seen.submits, "a request was sent for a refused form").toEqual([]);
  });

  // 7. Refusals only the API can make.
  test("7. the API's own refusals sit against their fields", async ({
    page,
  }) => {
    const blocked =
      "We can't link to that site. Paste the organiser's own page or the venue's page.";
    await openForm(page, {
      submit: STUB.fieldRefused({
        officialUrl: blocked,
        destinationKey: "Pick where it is.",
      }),
    });
    await fillEvent(page, { link: "https://blocked.example/listing" });
    await send(page);

    await expectFieldError(
      page,
      field(page, "Where is it?"),
      "Pick where it is.",
    );
    await expectFieldError(
      page,
      field(page, "Link to the event page"),
      blocked,
    );
    // The first refused field in the form's order takes focus.
    await expect(field(page, "Where is it?")).toBeFocused();
    await expectEventKept(page);
  });

  // 8. Dates at the edges.
  test("8. dates at the edges, in the place's own today", async ({ page }) => {
    const seen = await openForm(page);
    const day = today();

    await toCodeStep(page, { startsOn: day });
    expect(seen.submits[0].startsOn).toBe(day);
    await button(page, "Back to the form").click();

    const startsOn = field(page, "Date");
    for (const refused of [addDays(day, -1), addDays(day, 366)]) {
      await startsOn.fill(refused);
      await send(page);
      await expectFieldError(
        page,
        startsOn,
        "Pick a date from today up to a year ahead.",
      );
    }

    const start = addDays(day, 3);
    await startsOn.fill(start);
    await field(page, "End date (optional)").fill(addDays(start, 31));
    await send(page);
    await expectFieldError(
      page,
      field(page, "End date (optional)"),
      "The end date can't be before the start, or more than 30 days after it.",
    );

    // One day: an end time equal to the start is refused.
    await field(page, "End date (optional)").fill("");
    await field(page, "Start time (optional)").fill("18:00");
    await field(page, "End time (optional)").fill("18:00");
    await send(page);
    await expectFieldError(
      page,
      field(page, "End time (optional)"),
      "The end time must be after the start time.",
    );
    expect(seen.submits).toHaveLength(1);

    // Two days: the same times are fine.
    await field(page, "End date (optional)").fill(addDays(start, 1));
    await send(page);
    await expect(
      page.getByRole("heading", { name: "Check your email" }),
    ).toBeVisible();
    expect(seen.submits[1]).toMatchObject({
      startsOn: start,
      endsOn: addDays(start, 1),
      startTime: "18:00",
      endTime: "18:00",
    });
  });

  // 9. Prices at the edges.
  test("9. prices at the edges", async ({ page }) => {
    const seen = await openForm(page);

    await toCodeStep(page, { price: "Paid", lowest: "1" });
    expect(seen.submits[0].priceFrom).toEqual({
      amountMinor: 100,
      currency: "INR",
    });
    await button(page, "Back to the form").click();

    const lowest = field(page, "Lowest ticket price (₹)");
    await lowest.fill("1,00,000");
    await send(page);
    await expect(
      page.getByRole("heading", { name: "Check your email" }),
    ).toBeVisible();
    expect(seen.submits[1].priceFrom).toEqual({
      amountMinor: 10000000,
      currency: "INR",
    });
    await button(page, "Back to the form").click();

    const lowestSentence =
      "Enter the lowest ticket price in rupees, from 1 to 1,00,000.";
    for (const refused of ["0", "1,00,001", ""]) {
      await lowest.fill(refused);
      await send(page);
      await expectFieldError(page, lowest, lowestSentence);
    }

    await lowest.fill("500");
    await field(page, "Highest ticket price (₹, optional)").fill("499");
    await send(page);
    await expectFieldError(
      page,
      field(page, "Highest ticket price (₹, optional)"),
      "The highest price can't be below the lowest.",
    );
    expect(seen.submits).toHaveLength(2);

    // Free sends no price, even with prices typed before the switch.
    await page.getByRole("radio", { name: "Free", exact: true }).check();
    await send(page);
    await expect(
      page.getByRole("heading", { name: "Check your email" }),
    ).toBeVisible();
    expect(seen.submits[2].isFree).toBe(true);
    expect(seen.submits[2]).not.toHaveProperty("priceFrom");
    expect(seen.submits[2]).not.toHaveProperty("priceTo");
  });
});
