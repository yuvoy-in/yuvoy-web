import AxeBuilder from "@axe-core/playwright";
import type { Locator, Request, Route } from "@playwright/test";

import { addDays, todayIn } from "../src/lib/submit/local-day";
import { test, expect, type Page } from "./support/session";

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

const ID = "6f1c2b0e-8a4d-4c1e-9d55-0d3f0a9c7b21";
const ID_SECOND = "0b7d2e4c-1f3a-4e8b-a5c6-9d0e1f2a3b4c";
const REFERENCE = "ES-3F9A12C0";
const CODE_MESSAGE =
  "We sent a 6-digit code to e•••@example.org. It works for 10 minutes.";
const NEW_CODE_MESSAGE =
  "We sent a new 6-digit code to e•••@example.org. It works for 10 minutes.";
const DONE_MESSAGE =
  "Thanks. Your event is with our team. Someone checks every event before it shows, usually within two working days.";

const SOON = "Organisers can send us events soon.";
const NOT_FOUND = "We could not find that submission.";
const PAUSED = "Sending events to Yuvoy is paused for now. Try again later.";
const WITH_TEAM = "This event is already with our team.";
const WRONG_CODE = "That code did not work. Ask for a new one.";
const FAILED = "That didn't send. Check your connection and try again.";
const OFFLINE = "You're offline. Your answers are kept here.";

const ZONE = "Asia/Kolkata";
const today = () => todayIn(ZONE);

/* ------------------------------------------------------------------ stubs */

const OPEN = { releases: { checkedCities: "all", explore: "all" } };

const PLACES = {
  markets: [
    {
      key: "andaman",
      name: "Andaman Islands",
      mode: "bookable",
      timezone: ZONE,
      currency: "INR",
      destinations: [
        {
          key: "andaman/havelock",
          name: "Havelock",
          kind: "travel",
          visibleTo: "all",
        },
      ],
    },
    {
      key: "bengaluru",
      name: "Bengaluru",
      mode: "discover",
      timezone: ZONE,
      currency: "INR",
      destinations: [
        {
          key: "bengaluru/indiranagar",
          name: "Indiranagar",
          kind: "local",
          visibleTo: "all",
        },
        {
          key: "bengaluru/koramangala",
          name: "Koramangala",
          kind: "local",
          visibleTo: "all",
        },
      ],
    },
  ],
};

const VOCABULARY = {
  categories: [
    { key: "events", label: "Events" },
    { key: "food_drink", label: "Food and drink" },
    { key: "arts_creativity", label: "Arts and creativity" },
  ],
  activityTypes: [],
  destinations: [],
};

interface Reply {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
  /** Hold the answer this long, to catch a second tap in flight. */
  delayMs?: number;
}

const refusal = (
  status: number,
  code: string,
  message: string,
  extra: Partial<Reply> = {},
): Reply => ({ status, body: { error: { code, message } }, ...extra });

const receipt = (id = ID, message = CODE_MESSAGE): Reply => ({
  status: 202,
  body: {
    id,
    reference: REFERENCE,
    codeSentTo: "e•••@example.org",
    expiresAt: new Date(Date.now() + 600_000).toISOString(),
    message,
    // Only a development build of the API sends this; the page must not
    // show it or use it.
    devCode: "999999",
  },
});

/** The scenarios the issue asks the mocks to cover, by name. */
const STUB = {
  accepted: receipt(),
  resent: receipt(ID, NEW_CODE_MESSAGE),
  done: {
    status: 200,
    body: { reference: REFERENCE, state: "submitted", message: DONE_MESSAGE },
  } as Reply,
  fieldRefused: (details: Record<string, string>): Reply => ({
    status: 400,
    body: {
      error: {
        code: "invalid_input",
        message: "Some details need another look.",
        details,
      },
    },
  }),
  wrongCode: refusal(401, "unauthorized", WRONG_CODE),
  withTeam: refusal(409, "conflict", WITH_TEAM),
  unknownId: refusal(404, "not_found", NOT_FOUND),
  closed: refusal(404, "not_found", NOT_FOUND),
  paused: refusal(503, "unavailable", PAUSED),
  throttledDay: refusal(
    429,
    "rate_limited",
    "Too many submissions from you today. Try again tomorrow.",
    { headers: { "Retry-After": "3600" } },
  ),
  throttledFast: refusal(
    429,
    "rate_limited",
    "too many event submissions. Slow down and try again shortly",
  ),
  throttledCodes: refusal(
    429,
    "rate_limited",
    "Too many codes for this address. Try again in an hour.",
  ),
  throttledTries: refusal(
    429,
    "rate_limited",
    "Too many tries. Try again in an hour.",
  ),
};

type Answer<A extends unknown[]> = Reply | ((...args: A) => Reply | "abort");

interface Script {
  config?: unknown;
  places?: unknown;
  vocabulary?: unknown;
  submit?: Answer<[n: number, body: Record<string, unknown>]>;
  resend?: Answer<[n: number, id: string]>;
  verify?: Answer<[n: number, id: string, code: string]>;
}

interface Seen {
  submits: Record<string, unknown>[];
  resends: string[];
  verifies: { id: string; code: string }[];
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET, POST",
  "access-control-expose-headers": "Retry-After",
};

async function reply(route: Route, answer: Reply | "abort") {
  if (answer === "abort") return route.abort("failed");
  if (answer.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, answer.delayMs));
  }
  return route.fulfill({
    status: answer.status,
    contentType: "application/json",
    headers: { ...CORS, ...answer.headers },
    body: answer.body === undefined ? "" : JSON.stringify(answer.body),
  });
}

/** A browser's preflight, answered so the POST behind it goes ahead. */
const preflight = (request: Request) => request.method() === "OPTIONS";

function idOf(request: Request): string {
  return new URL(request.url()).pathname.split("/")[3] ?? "";
}

/**
 * Every route the page calls, answered from `script`, with every POST it
 * makes recorded. Set before `goto`: the three reads happen on mount.
 */
async function stubApi(page: Page, script: Script = {}): Promise<Seen> {
  const seen: Seen = { submits: [], resends: [], verifies: [] };
  const get = (body: unknown) => (route: Route) =>
    reply(route, { status: 200, body });

  await page.route("**/v1/app-config", get(script.config ?? OPEN));
  await page.route("**/v1/places", get(script.places ?? PLACES));
  await page.route(
    "**/v1/catalog/vocabulary",
    get(script.vocabulary ?? VOCABULARY),
  );

  await page.route("**/v1/event-submissions", (route, request) => {
    if (preflight(request)) return reply(route, { status: 204 });
    const body = request.postDataJSON() as Record<string, unknown>;
    seen.submits.push(body);
    const answer = script.submit ?? STUB.accepted;
    return reply(
      route,
      typeof answer === "function" ? answer(seen.submits.length, body) : answer,
    );
  });

  await page.route("**/v1/event-submissions/*/code", (route, request) => {
    if (preflight(request)) return reply(route, { status: 204 });
    const id = idOf(request);
    seen.resends.push(id);
    const answer = script.resend ?? STUB.resent;
    return reply(
      route,
      typeof answer === "function" ? answer(seen.resends.length, id) : answer,
    );
  });

  await page.route("**/v1/event-submissions/*/verify", (route, request) => {
    if (preflight(request)) return reply(route, { status: 204 });
    const id = idOf(request);
    const { code } = request.postDataJSON() as { code: string };
    seen.verifies.push({ id, code });
    const answer = script.verify ?? STUB.done;
    return reply(
      route,
      typeof answer === "function"
        ? answer(seen.verifies.length, id, code)
        : answer,
    );
  });

  return seen;
}

/* ---------------------------------------------------------------- the page */

const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
const field = (page: Page, label: string) =>
  page.getByLabel(label, { exact: true });

async function openForm(page: Page, script: Script = {}): Promise<Seen> {
  const seen = await stubApi(page, script);
  await page.goto("/submit");
  await expect(field(page, "Event name")).toBeVisible();
  return seen;
}

interface EventInput {
  title: string;
  kind: string;
  place: string;
  venue: string;
  address?: string;
  startsOn: string;
  startTime?: string;
  endsOn?: string;
  endTime?: string;
  price: "Free" | "Paid";
  lowest?: string;
  highest?: string;
  link: string;
  summary?: string;
  organiser: string;
  email: string;
  consent: boolean;
}

const FREE_EVENT = (): EventInput => ({
  title: "Sunday jazz at the lake",
  kind: "Events",
  place: "Indiranagar, Bengaluru",
  venue: "The Lake Stage",
  startsOn: addDays(today(), 3),
  price: "Free",
  link: "https://example.org/jazz",
  organiser: "Lake Arts Trust",
  email: "events@example.org",
  consent: true,
});

async function fillEvent(page: Page, input: Partial<EventInput> = {}) {
  const e = { ...FREE_EVENT(), ...input };
  await field(page, "Event name").fill(e.title);
  await field(page, "What kind of thing is it?").selectOption({
    label: e.kind,
  });
  await field(page, "Where is it?").selectOption({ label: e.place });
  await field(page, "Venue").fill(e.venue);
  await field(page, "Address or area (optional)").fill(e.address ?? "");
  await field(page, "Date").fill(e.startsOn);
  await field(page, "Start time (optional)").fill(e.startTime ?? "");
  await field(page, "End date (optional)").fill(e.endsOn ?? "");
  await field(page, "End time (optional)").fill(e.endTime ?? "");
  await page.getByRole("radio", { name: e.price, exact: true }).check();
  if (e.price === "Paid") {
    await field(page, "Lowest ticket price (₹)").fill(e.lowest ?? "");
    await field(page, "Highest ticket price (₹, optional)").fill(
      e.highest ?? "",
    );
  }
  await field(page, "Link to the event page").fill(e.link);
  await field(page, "About it, in a sentence or two (optional)").fill(
    e.summary ?? "",
  );
  await field(page, "Organiser name").fill(e.organiser);
  await field(page, "Your email").fill(e.email);
  await consentBox(page).setChecked(e.consent);
}

const consentBox = (page: Page) =>
  page.getByRole("checkbox", {
    name: "I organise this event, or I have the organiser's permission to list it.",
  });

async function send(page: Page) {
  await button(page, "Send to Yuvoy").click();
}

async function toCodeStep(page: Page, input: Partial<EventInput> = {}) {
  await fillEvent(page, input);
  await send(page);
  await expect(
    page.getByRole("heading", { name: "Check your email" }),
  ).toBeVisible();
}

async function confirmCode(page: Page, code: string) {
  // Wait out the last answer first: a wrong code empties the box when it
  // lands, and would empty this one too.
  await expect(button(page, "Confirm")).toBeEnabled();
  await field(page, "Code").fill(code);
  await button(page, "Confirm").click();
}

function escape(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Shown against the field, named by it, and announced. */
async function expectFieldError(page: Page, input: Locator, sentence: string) {
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAccessibleDescription(new RegExp(escape(sentence)));
  await expect(
    page.getByRole("alert").filter({ hasText: sentence }),
  ).toBeVisible();
}

/** What the person typed is still there. */
async function expectEventKept(page: Page, title = FREE_EVENT().title) {
  await expect(field(page, "Event name")).toHaveValue(title);
  await expect(field(page, "Your email")).toHaveValue("events@example.org");
  await expect(consentBox(page)).toBeChecked();
}

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function axeViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();
  return violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id} @ ${n.target.join(" ")}: ${v.help}`),
  );
}

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
