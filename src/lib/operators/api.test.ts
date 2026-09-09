import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  submitOperatorApplication,
  type OperatorApplicationInput,
} from "./api";

const INPUT: OperatorApplicationInput = {
  businessName: "Nemo Reef Divers",
  contactName: "Asha Menon",
  phone: "+919000000000",
  email: "asha@example.com",
  market: "andaman",
  source: "web",
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * The endpoint the operators form never called.
 *
 * `POST /v1/operator-applications` has been in the contract throughout and no
 * front end anywhere posted to it, so there was no path from a business
 * filling in the form to an operator existing — two real businesses sat in
 * `leads` from 8 and 17 August, unread (yuvoy-web#144).
 */
describe("submitOperatorApplication", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.test");
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("posts to the applications endpoint, not to leads", async () => {
    /*
      The whole bug, as one assertion. The form was posting a well-formed body
      to the wrong URL and being told it had worked.
    */
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(202, { received: true, next: "call" }),
    );
    await submitOperatorApplication(INPUT);

    const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.test/v1/operator-applications");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toMatchObject({
      businessName: "Nemo Reef Divers",
      contactName: "Asha Menon",
      phone: "+919000000000",
    });
  });

  it("classifies a 202 as received", async () => {
    // 202, not 201: "Received. Somebody will call." It is a review queue.
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(202, { received: true, next: "call" }),
    );
    const res = await submitOperatorApplication(INPUT);
    expect(res).toEqual({ kind: "received", next: "call" });
  });

  it("accepts a 200 too, rather than calling a filed application a failure", async () => {
    // A proxy that rewrites the 202 must not turn a real application into an
    // error the applicant is told about.
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { received: true }));
    expect((await submitOperatorApplication(INPUT)).kind).toBe("received");
  });

  it("treats a 2xx with an unreadable body as received", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("not json", { status: 202 }),
    );
    expect((await submitOperatorApplication(INPUT)).kind).toBe("received");
  });

  it("maps a 400 to field messages the form can render", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(400, {
        error: {
          message: "Some details need another look.",
          details: { phone: "That number looks too short for India." },
        },
      }),
    );
    const res = await submitOperatorApplication(INPUT);
    expect(res).toEqual({
      kind: "invalid",
      message: "Some details need another look.",
      fields: { phone: "That number looks too short for India." },
    });
  });

  it("classifies a 429 as rate limited", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(429, {}));
    expect((await submitOperatorApplication(INPUT)).kind).toBe("rate_limited");
  });

  it("says a 5xx did NOT file the application", async () => {
    /*
      The direction that matters. Telling a business "somebody will call" when
      nothing was written is how they wait a month for a call that was never
      going to come — which is the shape of the bug this endpoint fixes.
    */
    vi.mocked(fetch).mockResolvedValue(jsonResponse(503, {}));
    expect((await submitOperatorApplication(INPUT)).kind).toBe("unavailable");
  });

  it("never throws when fetch itself rejects", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));
    expect((await submitOperatorApplication(INPUT)).kind).toBe("unavailable");
  });

  it("says offline rather than unavailable when the browser knows it is", async () => {
    vi.stubGlobal("navigator", { onLine: false });
    expect((await submitOperatorApplication(INPUT)).kind).toBe("offline");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("is unavailable, not silently fine, with no API base configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    expect((await submitOperatorApplication(INPUT)).kind).toBe("unavailable");
    expect(fetch).not.toHaveBeenCalled();
  });
});

/**
 * One call, one transaction — yuvoy-web#157.
 *
 * The form made two independent writes with no transaction between them, and
 * the failure that mattered left an application with NO consent record on a
 * site whose privacy policy says we hold one. Nobody would have noticed until
 * somebody asked us to prove it.
 */
describe("the consent travels with the application", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.test"));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("sends privacyAccepted so one call writes both rows", async () => {
    let body: Record<string, unknown> = {};
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        body = JSON.parse(String(init.body));
        return jsonResponse(202, { received: true });
      }),
    );

    await submitOperatorApplication({
      ...INPUT,
      privacyAccepted: true,
      marketingOptIn: false,
    });

    expect(body.privacyAccepted).toBe(true);
    expect(body.marketingOptIn).toBe(false);
  });

  it("never sends privacyAccepted: false", async () => {
    /*
      It is a TRI-STATE server-side and `false` is refused with `400` —
      recording a marketing contact for somebody who declined is the one
      outcome it must not produce. The form cannot be submitted without the
      box ticked, so the only two shapes that can reach the API are `true` and
      absent, and a default of `false` would have turned a decline into a
      refused submission the applicant could not explain.
    */
    let body: Record<string, unknown> = {};
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        body = JSON.parse(String(init.body));
        return jsonResponse(202, { received: true });
      }),
    );

    await submitOperatorApplication(INPUT);

    expect(body.privacyAccepted).toBeUndefined();
    expect("privacyAccepted" in body).toBe(false);
  });

  it("still reports a 400 as an invalid submission", async () => {
    // `false` is the only new way to earn one, and this form cannot send it —
    // but a server that refuses for any reason must still reach the applicant
    // as something they can act on rather than as a dead button.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(400, {
          error: { message: "Consent is required.", details: {} },
        }),
      ),
    );

    const result = await submitOperatorApplication({
      ...INPUT,
      privacyAccepted: true,
    });

    expect(result.kind).toBe("invalid");
  });
});
