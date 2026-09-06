import type { operations } from "@/lib/api/schema";
import { apiBaseUrl } from "@/lib/api/base-url";

/**
 * Taken from the generated operation rather than hand-written.
 *
 * The last time this form and the API disagreed about a body, every complete
 * application was answered `400` and the form stood down behind a "coming
 * soon" notice for a fortnight (yuvoy-api#4). Deriving the type means the
 * disagreement is a build failure instead.
 */
export type OperatorApplicationInput =
  operations["submitOperatorApplication"]["requestBody"]["content"]["application/json"];

/** Every way an application can conclude. The form renders each one honestly. */
export type ApplicationResult =
  | { kind: "received"; next?: string }
  | { kind: "invalid"; message: string; fields: Record<string, string> }
  | { kind: "rate_limited" }
  | { kind: "unavailable" }
  | { kind: "offline" };

/**
 * Files an operator application — `POST /v1/operator-applications`.
 *
 * ## Why this exists at all, and what it is not
 *
 * The operators form filed a **marketing lead** and nothing else. `/leads` is
 * a mailing list; the onboarding queue reads applications, and no front end
 * anywhere called this endpoint. So there was no path from a business filling
 * in the form to an operator existing — **two real businesses sat in `leads`
 * from 8 and 17 August**, unread, because the queue was never told they were
 * there (yuvoy-web#144).
 *
 * "This creates an application, **not an operator**. An application is a claim
 * somebody typed into a form; an operator is a business we have checked."
 *
 * ## Why the form still posts a lead as well
 *
 * The two endpoints are not alternatives, and the tempting cleanup — move the
 * form across and drop `/leads` — loses two things that only live there:
 *
 *  1. **The consent record.** `privacyAccepted` and `marketingOptIn` are
 *     fields on `LeadInput` and on nothing else. A form that asks somebody to
 *     accept a privacy policy and then records the acceptance nowhere is worse
 *     than one that never asked.
 *  2. **The launch announcement list.** Email is "the one contact detail we
 *     ask everybody for … what the launch announcement will actually be sent
 *     on" (owner, 2026-08-07). An applicant should get that too.
 *
 * So an application is filed **in addition**, and the application is the one
 * whose failure the form reports — because it is the one a human acts on.
 *
 * Never throws: the form's job is to tell the applicant the truth about what
 * happened, and every failure mode has a state for it. Same contract as
 * `submitLead`, deliberately, so the two read alike at the call site.
 */
export async function submitOperatorApplication(
  input: OperatorApplicationInput,
): Promise<ApplicationResult> {
  const base = apiBaseUrl();
  if (!base) return { kind: "unavailable" };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { kind: "offline" };
  }

  let res: Response;
  try {
    res = await fetch(`${base}/v1/operator-applications`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    return typeof navigator !== "undefined" && !navigator.onLine
      ? { kind: "offline" }
      : { kind: "unavailable" };
  }

  /*
    202, not 201. "Received. Somebody will call." — the row is in a review
    queue, and the response deliberately carries no identifier: "there is
    nothing a stranger could do with one, and handing out ids for rows in a
    review queue is one more authorization boundary to get right later."

    200 is accepted alongside it rather than assumed away: a proxy that
    rewrites a 202 would otherwise turn a filed application into a failure the
    applicant is told about.
  */
  if (res.status === 202 || res.status === 200) {
    try {
      const body = (await res.json()) as { received?: boolean; next?: string };
      return { kind: "received", next: body.next };
    } catch {
      // A 2xx with an unreadable body still means it was received.
      return { kind: "received" };
    }
  }

  if (res.status === 429) return { kind: "rate_limited" };

  if (res.status === 400) {
    const fields: Record<string, string> = {};
    let message = "Some details need another look.";
    try {
      const body = (await res.json()) as {
        error?: { message?: string; details?: Record<string, unknown> };
      };
      if (body.error?.message) message = body.error.message;
      for (const [k, v] of Object.entries(body.error?.details ?? {})) {
        if (typeof v === "string") fields[k] = v;
      }
    } catch {
      // fall through with the generic message
    }
    return { kind: "invalid", message, fields };
  }

  // 5xx and anything unexpected: it was NOT filed. Say so.
  return { kind: "unavailable" };
}
