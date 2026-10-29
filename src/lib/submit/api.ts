import type { operations } from "@/lib/api/schema";
import { apiBaseUrl } from "@/lib/api/base-url";
import { dedash } from "@/lib/format/dedash";
import { discoverPlaces, type PlaceList, type PlaceOption } from "./places";
import { organiserFormOpen, type AppConfig } from "./release";
import type { EventSubmissionInput } from "./schema";

/**
 * The browser's half of R3-T3: an organiser sends one event, proves the
 * email with a code, and gets a reference (yuvoy-web#177).
 *
 * ## Every call is made from the browser
 *
 * Never from a Next server route. The API counts its per-address limits
 * (ten a day per caller) by the address the request comes from; from a
 * server route every visitor would share the server's address and its ten.
 * The `X-Yuvoy-Client-IP` header that would fix that needs a server secret
 * this site does not hold.
 *
 * ## Status and `error.code`, never words
 *
 * Each outcome is decided by the status and the envelope's `code`. The API's
 * sentences are passed through as sent (through `dedash`, which changes
 * punctuation only) and are on @gamallasaiteja's words question, so they may
 * change with no change here (issue case 21). A status whose `code` is not the
 * one the contract gives it is `failed`, with whatever sentence came with it.
 *
 * Like `submitLead`, nothing here throws: the page's job is to say what
 * happened, and every way a call can end has a state for it.
 */

type SubmitReceipt =
  operations["submitEvent"]["responses"][202]["content"]["application/json"];
type VerifyConfirmation =
  operations["verifyEventSubmission"]["responses"][200]["content"]["application/json"];
type Vocabulary =
  operations["getPublicVocabulary"]["responses"][200]["content"]["application/json"];
type ErrorCode = NonNullable<
  operations["submitEvent"]["responses"][400]["content"]["application/json"]["error"]["code"]
>;

export type VocabularyTerm = Vocabulary["categories"][number];

/**
 * What the page keeps from a receipt. Not `codeSentTo`, not `expiresAt`, and
 * never `devCode`: that appears only from a development build of the API, and
 * a page built on it would work on dev and nowhere else.
 */
export interface Receipt {
  id: string;
  reference: string;
  message: string;
}

export interface Confirmation {
  reference: string;
  message: string;
}

/** The outcomes every one of the three calls shares. */
type Shared =
  /** `503 unavailable`: the form is switched off (`feature:organiser_form`). */
  | { kind: "paused"; message: string }
  /** `429 rate_limited`, with `Retry-After` in seconds when the API set it. */
  | { kind: "throttled"; message: string; retryAfter?: number }
  | { kind: "offline" }
  /** The network, or an answer the contract does not describe. */
  | { kind: "failed"; message?: string };

export type SubmitEventResult =
  | { kind: "sent"; receipt: Receipt }
  | { kind: "invalid"; message?: string; fields: Record<string, string> }
  /** `404`: `checkedCities` is not open to this visitor (a stale config). */
  | { kind: "closed" }
  | Shared;

export type ResendResult =
  | { kind: "sent"; receipt: Receipt }
  /** `404`: unknown, made up, older than 7 days, or closed. One sentence for all. */
  | { kind: "gone"; message: string }
  /** `409 conflict`: already confirmed, so already with our team. */
  | { kind: "with_team"; message: string }
  | Shared;

export type VerifyResult =
  | { kind: "confirmed"; confirmation: Confirmation }
  | { kind: "invalid"; message?: string; fields: Record<string, string> }
  /** `401 unauthorized`: wrong, expired or used. Each try counts. */
  | { kind: "wrong_code"; message: string }
  | { kind: "gone"; message: string }
  | { kind: "with_team"; message: string }
  | Shared;

interface ApiError {
  code?: ErrorCode | string;
  message?: string;
  details: Record<string, string>;
}

/** The error envelope, cleaned, or an empty one when the body is not JSON. */
async function readError(res: Response): Promise<ApiError> {
  const details: Record<string, string> = {};
  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string; details?: unknown };
    };
    const error = body?.error;
    if (error?.details && typeof error.details === "object") {
      for (const [field, text] of Object.entries(error.details)) {
        if (typeof text === "string") details[field] = dedash(text);
      }
    }
    return {
      code: typeof error?.code === "string" ? error.code : undefined,
      message:
        typeof error?.message === "string" && error.message
          ? dedash(error.message)
          : undefined,
      details,
    };
  } catch {
    return { details };
  }
}

/** Whole seconds from `Retry-After`, or undefined when it is absent or odd. */
function retryAfter(res: Response): number | undefined {
  const seconds = Number(res.headers.get("Retry-After"));
  return Number.isFinite(seconds) && seconds > 0
    ? Math.ceil(seconds)
    : undefined;
}

/** Only a browser that says so: a runtime with no `onLine` is not offline. */
function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * The outcomes the three calls read alike: 429, 503 and anything else.
 * Called last, after each call has taken the statuses that are its own.
 */
function shared(res: Response, error: ApiError): Shared {
  if (res.status === 429 && error.code === "rate_limited") {
    return {
      kind: "throttled",
      message: error.message ?? "",
      retryAfter: retryAfter(res),
    };
  }
  if (res.status === 503 && error.code === "unavailable" && error.message) {
    return { kind: "paused", message: error.message };
  }
  return { kind: "failed", message: error.message };
}

/** One POST, or the reason it never got an answer. */
async function post(
  path: string,
  body?: unknown,
): Promise<Response | { kind: "offline" } | { kind: "failed" }> {
  const base = apiBaseUrl();
  if (!base) return { kind: "failed" };
  if (isOffline()) return { kind: "offline" };
  try {
    return await fetch(`${base}${path}`, {
      method: "POST",
      ...(body === undefined
        ? {}
        : {
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          }),
    });
  } catch {
    // fetch itself rejecting means the network or the host is unreachable.
    return isOffline() ? { kind: "offline" } : { kind: "failed" };
  }
}

/** Only the three fields the page uses; `devCode` is dropped here. */
async function readReceipt(res: Response): Promise<Receipt | null> {
  try {
    const body = (await res.json()) as Partial<SubmitReceipt>;
    if (typeof body.id !== "string" || !body.id) return null;
    return {
      id: body.id,
      reference: typeof body.reference === "string" ? body.reference : "",
      message: typeof body.message === "string" ? dedash(body.message) : "",
    };
  } catch {
    return null;
  }
}

/**
 * `POST /v1/event-submissions` (`submitEvent`).
 *
 * A `202` is the same whether the event was stored, the trap field was
 * filled, or our hourly ceiling on new addresses was reached: the last two
 * carry a made-up `id`, and the page cannot tell. That is on purpose.
 */
export async function submitEvent(
  input: EventSubmissionInput,
): Promise<SubmitEventResult> {
  const res = await post("/v1/event-submissions", input);
  if (!(res instanceof Response)) return res;

  if (res.status === 202 || res.status === 200) {
    const receipt = await readReceipt(res);
    // Without an id there is nothing to confirm, so it cannot be "sent".
    return receipt ? { kind: "sent", receipt } : { kind: "failed" };
  }

  const error = await readError(res);
  if (res.status === 400) {
    return { kind: "invalid", message: error.message, fields: error.details };
  }
  if (res.status === 404 && error.code === "not_found") {
    return { kind: "closed" };
  }
  return shared(res, error);
}

/** `POST /v1/event-submissions/{id}/code` (`resendEventSubmissionCode`). No body. */
export async function resendCode(id: string): Promise<ResendResult> {
  const res = await post(
    `/v1/event-submissions/${encodeURIComponent(id)}/code`,
  );
  if (!(res instanceof Response)) return res;

  if (res.status === 202 || res.status === 200) {
    const receipt = await readReceipt(res);
    return receipt ? { kind: "sent", receipt } : { kind: "failed" };
  }

  const error = await readError(res);
  if (res.status === 404 && error.code === "not_found" && error.message) {
    return { kind: "gone", message: error.message };
  }
  if (res.status === 409 && error.code === "conflict" && error.message) {
    return { kind: "with_team", message: error.message };
  }
  return shared(res, error);
}

/** `POST /v1/event-submissions/{id}/verify` (`verifyEventSubmission`). */
export async function verifyCode(
  id: string,
  code: string,
): Promise<VerifyResult> {
  const res = await post(
    `/v1/event-submissions/${encodeURIComponent(id)}/verify`,
    { code },
  );
  if (!(res instanceof Response)) return res;

  if (res.status === 200) {
    try {
      const body = (await res.json()) as Partial<VerifyConfirmation>;
      return {
        kind: "confirmed",
        confirmation: {
          reference: typeof body.reference === "string" ? body.reference : "",
          message: typeof body.message === "string" ? dedash(body.message) : "",
        },
      };
    } catch {
      // A 200 is the code accepted whatever the body says; the page still
      // has the reference from the receipt.
      return {
        kind: "confirmed",
        confirmation: { reference: "", message: "" },
      };
    }
  }

  const error = await readError(res);
  if (res.status === 400) {
    return { kind: "invalid", message: error.message, fields: error.details };
  }
  if (res.status === 401 && error.code === "unauthorized" && error.message) {
    return { kind: "wrong_code", message: error.message };
  }
  if (res.status === 404 && error.code === "not_found" && error.message) {
    return { kind: "gone", message: error.message };
  }
  if (res.status === 409 && error.code === "conflict" && error.message) {
    return { kind: "with_team", message: error.message };
  }
  return shared(res, error);
}

/** What the page can show once the three reads on mount are in. */
export type FormLoad =
  | { kind: "soon" }
  | { kind: "error" }
  | { kind: "open"; places: PlaceOption[]; categories: VocabularyTerm[] };

async function getJson<T>(path: string): Promise<T | null> {
  const base = apiBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}${path}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    return res.status === 200 ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

/**
 * The three reads that decide what `/submit` shows, all in the browser on
 * mount and never at build time.
 *
 * Read together so an open form costs one round trip, then decided in order:
 *
 *  1. App config unread, or `checkedCities` anything but `all`: "soon". A
 *     release that cannot be read must not show the form (it fails closed).
 *  2. Places or the vocabulary unread: the load failure, with "Try again".
 *     The release is open, so "soon" would tell an organiser the form does
 *     not exist yet, which is not the fact (note section 6 point 3).
 *  3. No discover place: "soon", as the issue says.
 *
 * Offline before anything is read is the load failure too: the page cannot
 * know the release, and "soon" would be a guess.
 */
export async function loadSubmitForm(): Promise<FormLoad> {
  if (isOffline()) return { kind: "error" };

  const [config, places, vocabulary] = await Promise.all([
    getJson<AppConfig>("/v1/app-config"),
    getJson<PlaceList>("/v1/places"),
    getJson<Vocabulary>("/v1/catalog/vocabulary"),
  ]);

  if (!organiserFormOpen(config)) return { kind: "soon" };

  const categories = Array.isArray(vocabulary?.categories)
    ? vocabulary.categories
    : null;
  if (!places || !categories || categories.length === 0) {
    return { kind: "error" };
  }

  const options = discoverPlaces(places);
  if (options.length === 0) return { kind: "soon" };

  return { kind: "open", places: options, categories };
}
