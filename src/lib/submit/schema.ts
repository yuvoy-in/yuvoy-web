import { z } from "zod";
import type { components } from "@/lib/api/schema";
import { isPlausibleEmail } from "@/lib/contact/email";
import { endInRun, isDay, startInRange } from "./local-day";
import { WORDS } from "./words";

export type EventSubmissionInput =
  components["schemas"]["EventSubmissionInput"];
type Category = components["schemas"]["Category"];
type Money = components["schemas"]["Money"];

/**
 * The form as typed. Every field is the string the input holds, so nothing is
 * converted until `toSubmissionBody`, and a value kept across the code step is
 * exactly what the organiser left in the box.
 *
 * The names are the contract's on purpose: a `400` names a field in
 * `details`, and that key lands on the input of the same name with no table
 * in between.
 */
export interface SubmissionFormValues {
  title: string;
  department: string;
  destinationKey: string;
  venue: string;
  address: string;
  startsOn: string;
  startTime: string;
  endsOn: string;
  endTime: string;
  /** No price option is chosen until the organiser picks one (point 6 A). */
  isFree: "free" | "paid" | "" | null;
  priceFrom: string;
  priceTo: string;
  officialUrl: string;
  summary: string;
  organiserName: string;
  email: string;
  consent: boolean;
  /** The trap field. Sent as it is, never cleared or checked here. */
  extra: string;
}

export type SubmissionField = keyof SubmissionFormValues;

export const EMPTY_SUBMISSION: SubmissionFormValues = {
  title: "",
  department: "",
  destinationKey: "",
  venue: "",
  address: "",
  startsOn: "",
  startTime: "",
  endsOn: "",
  endTime: "",
  isFree: "",
  priceFrom: "",
  priceTo: "",
  officialUrl: "",
  summary: "",
  organiserName: "",
  email: "",
  consent: false,
  extra: "",
};

/** The handler's limits (`event_submissions.go`), counted as the API counts. */
export const LIMITS = {
  title: [3, 120],
  venue: [2, 200],
  organiserName: [2, 200],
  address: 300,
  summary: 500,
  officialUrl: 2048,
  email: 254,
  rupees: [1, 100_000],
} as const;

const DESTINATION_KEY = /^[a-z][a-z0-9_]*\/[a-z][a-z0-9_]*$/;
const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Characters as the API counts them: Go's rune count, which is code points.
 * `String.length` counts UTF-16 units, so a name with an emoji in it would be
 * refused here at a length the server accepts.
 */
function runes(text: string): number {
  return [...text].length;
}

function between(text: string, [lo, hi]: readonly [number, number]) {
  const n = runes(text);
  return n >= lo && n <= hi;
}

/**
 * Whole rupees as typed, or null for anything that is not one.
 *
 * Commas and spaces go first: organisers write "1,500" and "1,00,000", and
 * the issue writes prices that way too. A decimal, a sign or an exponent is
 * not whole rupees and is refused with the price's own sentence, which is why
 * the input is text with a numeric keypad rather than `type="number"` (that
 * one refuses commas and accepts "1e3"). Point 12 A.
 */
export function parseRupees(raw: string): number | null {
  const digits = raw.replace(/[\s,]/g, "");
  return /^\d+$/.test(digits) ? Number(digits) : null;
}

function rupeesInRange(rupees: number | null): rupees is number {
  return (
    rupees !== null && rupees >= LIMITS.rupees[0] && rupees <= LIMITS.rupees[1]
  );
}

function isWebLink(raw: string): boolean {
  try {
    const url = new URL(raw);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.hostname !== ""
    );
  } catch {
    return false;
  }
}

/**
 * Every refusal the page can make, keyed by field, in the API's words.
 *
 * `today` is the chosen place's local today (`todayIn`), handed in so the
 * check is about the rules and not about the clock. The order inside each
 * field follows the handler, so where two rules fail the sentence shown is
 * the one the server would have sent.
 *
 * Some refusals only the API can make (a blocked host, a place not open to
 * the caller); those arrive in `details` and are shown as sent.
 */
export function checkSubmission(
  values: SubmissionFormValues,
  today: string,
): Partial<Record<SubmissionField, string>> {
  const errors: Partial<Record<SubmissionField, string>> = {};
  const E = WORDS.errors;

  if (!between(values.title.trim(), LIMITS.title)) errors.title = E.title;
  if (!values.department) errors.department = E.department;
  if (!DESTINATION_KEY.test(values.destinationKey)) {
    errors.destinationKey = E.destinationKey;
  }

  const startOk = startInRange(values.startsOn, today);
  if (!startOk) errors.startsOn = E.startsOn;

  const startTime = values.startTime;
  const endTime = values.endTime;
  if (startTime && !CLOCK.test(startTime)) errors.startTime = E.time;
  if (endTime && !CLOCK.test(endTime)) errors.endTime = E.time;

  // Only against a start that is itself a real day: with no start, the start
  // date's sentence is the one that helps.
  if (values.endsOn && isDay(values.startsOn)) {
    if (!endInRun(values.startsOn, values.endsOn)) errors.endsOn = E.endsOn;
  }

  const oneDay = !values.endsOn || values.endsOn === values.startsOn;
  if (
    oneDay &&
    !errors.startTime &&
    !errors.endTime &&
    startTime &&
    endTime &&
    endTime <= startTime
  ) {
    errors.endTime = E.endTime;
  }

  if (!between(values.venue.trim(), LIMITS.venue)) errors.venue = E.venue;
  if (runes(values.address.trim()) > LIMITS.address) errors.address = E.address;

  if (values.isFree !== "free" && values.isFree !== "paid") {
    errors.isFree = E.isFree;
  } else if (values.isFree === "paid") {
    const from = parseRupees(values.priceFrom);
    if (!rupeesInRange(from)) errors.priceFrom = E.priceFrom;
    if (values.priceTo.trim()) {
      const to = parseRupees(values.priceTo);
      if (!rupeesInRange(to)) errors.priceTo = E.priceTo;
      else if (rupeesInRange(from) && to < from) errors.priceTo = E.priceBelow;
    }
  }

  const link = values.officialUrl.trim();
  if (link.length > LIMITS.officialUrl) {
    errors.officialUrl = E.officialUrlLength;
  } else if (!isWebLink(link)) {
    errors.officialUrl = E.officialUrl;
  }

  if (runes(values.summary.trim()) > LIMITS.summary) errors.summary = E.summary;

  if (!between(values.organiserName.trim(), LIMITS.organiserName)) {
    errors.organiserName = E.organiserName;
  }

  const email = values.email.trim();
  if (!email || email.length > LIMITS.email || !isPlausibleEmail(email)) {
    errors.email = E.email;
  }

  if (values.consent !== true) errors.consent = E.consent;

  return errors;
}

/**
 * The zod schema react-hook-form validates with.
 *
 * Plain shapes, then one refinement that runs `checkSubmission`. The shapes
 * are what the inputs always hold, so they never fail and the refinement
 * always runs: an organiser who pressed "Send to Yuvoy" on an empty form sees
 * every field that needs them at once (issue case 6). Several rules span two
 * fields (the dates, the times, the prices), and keeping them all in one
 * plain function is what lets them be tested without a form.
 *
 * `todayFor` reads the clock at validation time, so a form left open past
 * midnight checks against the new day.
 */
export function submissionSchema(todayFor: (destinationKey: string) => string) {
  return z
    .object({
      title: z.string(),
      department: z.string(),
      destinationKey: z.string(),
      venue: z.string(),
      address: z.string(),
      startsOn: z.string(),
      startTime: z.string(),
      endsOn: z.string(),
      endTime: z.string(),
      isFree: z.enum(["free", "paid", ""]).nullable(),
      priceFrom: z.string(),
      priceTo: z.string(),
      officialUrl: z.string(),
      summary: z.string(),
      organiserName: z.string(),
      email: z.string(),
      consent: z.boolean(),
      extra: z.string(),
    })
    .superRefine((values, ctx) => {
      const errors = checkSubmission(values, todayFor(values.destinationKey));
      for (const [field, message] of Object.entries(errors)) {
        ctx.addIssue({ code: "custom", path: [field], message });
      }
    });
}

function money(rupees: number): Money {
  return { amountMinor: rupees * 100, currency: "INR" };
}

/**
 * The request body, from values `checkSubmission` passed.
 *
 * Only the contract's fields, because the body takes no other
 * (`additionalProperties: false`, and an unknown field is a `400` with no
 * `details`). An empty optional field is left out rather than sent as `""`,
 * as the issue asks. A free event carries no price at all, even one typed
 * before the organiser switched to Free.
 *
 * `extra` is the exception: it is sent with whatever it holds, `""` included
 * (point 5 A), and never trimmed. What a bot put there is the API's business.
 */
export function toSubmissionBody(
  values: SubmissionFormValues,
): EventSubmissionInput {
  const isFree = values.isFree === "free";
  const body: EventSubmissionInput = {
    destinationKey: values.destinationKey,
    title: values.title.trim(),
    // The key came from `getPublicVocabulary`, the API's own list, which is
    // what it checks `department` against (note section 6 point 2).
    department: values.department as Category,
    startsOn: values.startsOn,
    venue: values.venue.trim(),
    isFree,
    officialUrl: values.officialUrl.trim(),
    organiserName: values.organiserName.trim(),
    email: values.email.trim(),
    consent: true,
    extra: values.extra,
  };

  if (values.startTime) body.startTime = values.startTime;
  if (values.endsOn) body.endsOn = values.endsOn;
  if (values.endTime) body.endTime = values.endTime;
  const address = values.address.trim();
  if (address) body.address = address;
  const summary = values.summary.trim();
  if (summary) body.summary = summary;

  if (!isFree) {
    const from = parseRupees(values.priceFrom);
    if (from !== null) body.priceFrom = money(from);
    const to = values.priceTo.trim() ? parseRupees(values.priceTo) : null;
    if (to !== null) body.priceTo = money(to);
  }

  return body;
}
