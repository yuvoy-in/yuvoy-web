/**
 * The stubs and form steps `submit.spec.ts` and `submit-sending.spec.ts` share
 * (yuvoy-web#177).
 */
import AxeBuilder from "@axe-core/playwright";
import type { Locator, Request, Route } from "@playwright/test";

import { addDays, todayIn } from "../../src/lib/submit/local-day";
import { expect, type Page } from "./session";

export const ID = "6f1c2b0e-8a4d-4c1e-9d55-0d3f0a9c7b21";
export const ID_SECOND = "0b7d2e4c-1f3a-4e8b-a5c6-9d0e1f2a3b4c";
export const REFERENCE = "ES-3F9A12C0";
export const CODE_MESSAGE =
  "We sent a 6-digit code to e•••@example.org. It works for 10 minutes.";
export const NEW_CODE_MESSAGE =
  "We sent a new 6-digit code to e•••@example.org. It works for 10 minutes.";
export const DONE_MESSAGE =
  "Thanks. Your event is with our team. Someone checks every event before it shows, usually within two working days.";

export const SOON = "Organisers can send us events soon.";
export const NOT_FOUND = "We could not find that submission.";
export const PAUSED =
  "Sending events to Yuvoy is paused for now. Try again later.";
export const WITH_TEAM = "This event is already with our team.";
export const WRONG_CODE = "That code did not work. Ask for a new one.";
export const FAILED = "That didn't send. Check your connection and try again.";
export const OFFLINE = "You're offline. Your answers are kept here.";

export const ZONE = "Asia/Kolkata";
export const today = () => todayIn(ZONE);

/* ------------------------------------------------------------------ stubs */

export const OPEN = { releases: { checkedCities: "all", explore: "all" } };

export const PLACES = {
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

export const VOCABULARY = {
  categories: [
    { key: "events", label: "Events" },
    { key: "food_drink", label: "Food and drink" },
    { key: "arts_creativity", label: "Arts and creativity" },
  ],
  activityTypes: [],
  destinations: [],
};

export interface Reply {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
  /** Hold the answer this long, to catch a second tap in flight. */
  delayMs?: number;
}

export const refusal = (
  status: number,
  code: string,
  message: string,
  extra: Partial<Reply> = {},
): Reply => ({ status, body: { error: { code, message } }, ...extra });

export const receipt = (id = ID, message = CODE_MESSAGE): Reply => ({
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
export const STUB = {
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

export type Answer<A extends unknown[]> =
  Reply | ((...args: A) => Reply | "abort");

export interface Script {
  config?: unknown;
  places?: unknown;
  vocabulary?: unknown;
  submit?: Answer<[n: number, body: Record<string, unknown>]>;
  resend?: Answer<[n: number, id: string]>;
  verify?: Answer<[n: number, id: string, code: string]>;
}

export interface Seen {
  submits: Record<string, unknown>[];
  resends: string[];
  verifies: { id: string; code: string }[];
}

export const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET, POST",
  "access-control-expose-headers": "Retry-After",
};

export async function reply(route: Route, answer: Reply | "abort") {
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
export const preflight = (request: Request) => request.method() === "OPTIONS";

export function idOf(request: Request): string {
  return new URL(request.url()).pathname.split("/")[3] ?? "";
}

/**
 * Every route the page calls, answered from `script`, with every POST it
 * makes recorded. Set before `goto`: the three reads happen on mount.
 */
export async function stubApi(page: Page, script: Script = {}): Promise<Seen> {
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

export const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
export const field = (page: Page, label: string) =>
  page.getByLabel(label, { exact: true });

export async function openForm(page: Page, script: Script = {}): Promise<Seen> {
  const seen = await stubApi(page, script);
  await page.goto("/submit");
  await expect(field(page, "Event name")).toBeVisible();
  return seen;
}

export interface EventInput {
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

export const FREE_EVENT = (): EventInput => ({
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

export async function fillEvent(page: Page, input: Partial<EventInput> = {}) {
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

export const consentBox = (page: Page) =>
  page.getByRole("checkbox", {
    name: "I organise this event, or I have the organiser's permission to list it.",
  });

export async function send(page: Page) {
  await button(page, "Send to Yuvoy").click();
}

export async function toCodeStep(page: Page, input: Partial<EventInput> = {}) {
  await fillEvent(page, input);
  await send(page);
  await expect(
    page.getByRole("heading", { name: "Check your email" }),
  ).toBeVisible();
}

export async function confirmCode(page: Page, code: string) {
  // Wait out the last answer first: a wrong code empties the box when it
  // lands, and would empty this one too.
  await expect(button(page, "Confirm")).toBeEnabled();
  await field(page, "Code").fill(code);
  await button(page, "Confirm").click();
}

export function escape(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Shown against the field, named by it, and announced. */
export async function expectFieldError(
  page: Page,
  input: Locator,
  sentence: string,
) {
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAccessibleDescription(new RegExp(escape(sentence)));
  await expect(
    page.getByRole("alert").filter({ hasText: sentence }),
  ).toBeVisible();
}

/** What the person typed is still there. */
export async function expectEventKept(page: Page, title = FREE_EVENT().title) {
  await expect(field(page, "Event name")).toHaveValue(title);
  await expect(field(page, "Your email")).toHaveValue("events@example.org");
  await expect(consentBox(page)).toBeChecked();
}

export const WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
];

export async function axeViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();
  return violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id} @ ${n.target.join(" ")}: ${v.help}`),
  );
}
