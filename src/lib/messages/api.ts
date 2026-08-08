import type { components } from "@/lib/api/schema";
import { apiBaseUrl } from "@/lib/api/base-url";

export type MessageInput = components["schemas"]["MessageInput"];
export type MessageAcceptance = components["schemas"]["MessageAcceptance"];

/**
 * Every way sending a message can conclude.
 *
 * Deliberately the same shape as `SubmitResult` in `@/lib/leads/api`, minus
 * the outcome that cannot happen here: there is no `updated`, because messages
 * are never deduplicated. Two questions from one address are two questions
 * (yuvoy-in/yuvoy-api#5), so a second send is a second message and says so.
 */
export type SendResult =
  | { kind: "sent"; acceptance: MessageAcceptance }
  | { kind: "invalid"; message: string; fields: Record<string, string> }
  | { kind: "rate_limited" }
  | { kind: "unavailable" }
  | { kind: "offline" };

/**
 * Sends a message to POST /v1/messages and classifies the outcome.
 *
 * Never throws: the form's job is to tell the visitor the truth about what
 * happened, and every failure mode has a state for that.
 *
 * **`202`, not `201`.** The endpoint acknowledges receipt and promises nothing
 * about a reply, because the site publishes no reply time. Any other 2xx is
 * still treated as sent — a success status the API might add later must not
 * be read as a failure by a client that has not been redeployed.
 */
export async function sendMessage(input: MessageInput): Promise<SendResult> {
  const base = apiBaseUrl();
  if (!base) return { kind: "unavailable" };
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { kind: "offline" };
  }

  let res: Response;
  try {
    res = await fetch(`${base}/v1/messages`, {
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

  if (res.ok) {
    try {
      const acceptance = (await res.json()) as MessageAcceptance;
      return { kind: "sent", acceptance };
    } catch {
      // A 2xx with an unreadable body still means the message was received.
      return {
        kind: "sent",
        acceptance: {
          id: "",
          status: "received",
          createdAt: new Date().toISOString(),
        },
      };
    }
  }

  if (res.status === 429) return { kind: "rate_limited" };

  /*
    400 carries the same envelope and the same `error.details` shape as
    `/v1/leads`, which is why this branch is a copy of that one rather than a
    new protocol. Confirmed on the issue before it shipped: an earlier draft
    said 422, and 422 would have fallen through to `unavailable` below —
    turning every validation mistake into "something on our side isn't
    answering", on a form whose entire point is saying which field is wrong.
  */
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

  // 5xx and anything unexpected: the message was NOT stored. Say so.
  return { kind: "unavailable" };
}
