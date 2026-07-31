import type { components } from "@/lib/api/schema";

export type LeadInput = components["schemas"]["LeadInput"];
export type LeadAcceptance = components["schemas"]["LeadAcceptance"];

/**
 * Where the Go API lives. Empty in environments where the backend is not yet
 * deployed — submission then reports `unavailable` truthfully instead of
 * pretending to succeed. Read at call time: Next inlines NEXT_PUBLIC_* values
 * either way, and tests can stub the env per case.
 */
function apiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
}

/** Every way a submission can conclude. The form renders each one honestly. */
export type SubmitResult =
  | { kind: "recorded"; acceptance: LeadAcceptance }
  | { kind: "updated"; acceptance: LeadAcceptance }
  | { kind: "invalid"; message: string; fields: Record<string, string> }
  | { kind: "rate_limited" }
  | { kind: "unavailable" }
  | { kind: "offline" };

/**
 * Submits a lead to POST /v1/leads and classifies the outcome.
 *
 * This function never throws: the form's job is to tell the visitor the truth
 * about what happened, and every failure mode has a state for that.
 */
export async function submitLead(input: LeadInput): Promise<SubmitResult> {
  const base = apiBaseUrl();
  if (!base) {
    return { kind: "unavailable" };
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { kind: "offline" };
  }

  let res: Response;
  try {
    res = await fetch(`${base}/v1/leads`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // fetch itself rejecting means the network or the host is unreachable.
    return typeof navigator !== "undefined" && !navigator.onLine
      ? { kind: "offline" }
      : { kind: "unavailable" };
  }

  if (res.status === 201 || res.status === 200) {
    try {
      const acceptance = (await res.json()) as LeadAcceptance;
      return acceptance.status === "updated"
        ? { kind: "updated", acceptance }
        : { kind: "recorded", acceptance };
    } catch {
      // A 2xx with an unreadable body still means the lead was recorded.
      return {
        kind: "recorded",
        acceptance: {
          id: "",
          audience: input.audience,
          status: "recorded",
          createdAt: new Date().toISOString(),
        },
      };
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

  // 5xx and anything unexpected: the lead was NOT saved. Say so.
  return { kind: "unavailable" };
}
