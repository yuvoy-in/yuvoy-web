import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadSubmitForm, resendCode, submitEvent, verifyCode } from "./api";
import type { EventSubmissionInput } from "./schema";

const INPUT: EventSubmissionInput = {
  destinationKey: "bengaluru/indiranagar",
  title: "Sunday jazz at the lake",
  department: "events",
  startsOn: "2026-11-02",
  venue: "The Lake Stage",
  isFree: true,
  officialUrl: "https://example.org/jazz",
  organiserName: "Lake Arts Trust",
  email: "events@example.org",
  consent: true,
  extra: "",
};

const ID = "6f1c2b0e-8a4d-4c1e-9d55-0d3f0a9c7b21";

function json(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

/**
 * An error envelope whose words are deliberately nothing like the API's, so
 * a test can only pass when the outcome came from the status and the code
 * (issue case 21).
 */
function refusal(code: string, message = "Words the page must not read.") {
  return { error: { code, message } };
}

const RECEIPT = {
  id: ID,
  reference: "ES-3F9A12C0",
  codeSentTo: "e•••@example.org",
  expiresAt: "2026-10-30T10:10:00Z",
  message:
    "We sent a 6-digit code to e•••@example.org. It works for 10 minutes.",
};

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.test");
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("submitEvent", () => {
  it("posts the body as JSON from the browser to /v1/event-submissions", async () => {
    vi.mocked(fetch).mockResolvedValue(json(202, RECEIPT));
    await submitEvent(INPUT);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("http://api.test/v1/event-submissions");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual(INPUT);
  });

  it("keeps the id, reference and message of a 202, and never devCode", async () => {
    vi.mocked(fetch).mockResolvedValue(
      json(202, { ...RECEIPT, devCode: "123456" }),
    );
    const res = await submitEvent(INPUT);
    expect(res).toEqual({
      kind: "sent",
      receipt: { id: ID, reference: "ES-3F9A12C0", message: RECEIPT.message },
    });
    expect(JSON.stringify(res)).not.toContain("123456");
  });

  it("puts a 400's details on their fields", async () => {
    vi.mocked(fetch).mockResolvedValue(
      json(400, {
        error: {
          code: "invalid_input",
          message: "Some details need another look.",
          details: {
            officialUrl:
              "We can't link to that site. Paste the organiser's own page or the venue's page.",
          },
        },
      }),
    );
    const res = await submitEvent(INPUT);
    expect(res).toEqual({
      kind: "invalid",
      message: "Some details need another look.",
      fields: {
        officialUrl:
          "We can't link to that site. Paste the organiser's own page or the venue's page.",
      },
    });
  });

  it("keeps a 400 with no details as a message for the whole form", async () => {
    vi.mocked(fetch).mockResolvedValue(
      json(400, refusal("invalid_input", "Send the event as one object.")),
    );
    expect(await submitEvent(INPUT)).toEqual({
      kind: "invalid",
      message: "Send the event as one object.",
      fields: {},
    });
  });

  it("reads a 404 as the release closed under the page", async () => {
    vi.mocked(fetch).mockResolvedValue(json(404, refusal("not_found")));
    expect(await submitEvent(INPUT)).toEqual({ kind: "closed" });
  });

  it("reads a 429 with Retry-After as throttled for that many seconds", async () => {
    vi.mocked(fetch).mockResolvedValue(
      json(429, refusal("rate_limited", "Too many today."), {
        "Retry-After": "3600",
      }),
    );
    expect(await submitEvent(INPUT)).toEqual({
      kind: "throttled",
      message: "Too many today.",
      retryAfter: 3600,
    });
  });

  it("reads a 429 with no Retry-After as throttled, with no wait", async () => {
    vi.mocked(fetch).mockResolvedValue(
      json(429, refusal("rate_limited", "too many event submissions")),
    );
    expect(await submitEvent(INPUT)).toEqual({
      kind: "throttled",
      message: "too many event submissions",
      retryAfter: undefined,
    });
  });

  it("reads a 503 unavailable as paused, with the sentence as sent", async () => {
    vi.mocked(fetch).mockResolvedValue(
      json(503, refusal("unavailable", "Paused, in any words.")),
    );
    expect(await submitEvent(INPUT)).toEqual({
      kind: "paused",
      message: "Paused, in any words.",
    });
  });

  it("reads a 503 that is not the API's as a failure", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("<html>", { status: 503 }));
    expect(await submitEvent(INPUT)).toEqual({
      kind: "failed",
      message: undefined,
    });
  });

  it("reads a rejected fetch as a failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await submitEvent(INPUT)).toEqual({ kind: "failed" });
  });

  it("does not call at all while offline", async () => {
    vi.stubGlobal("navigator", { onLine: false });
    expect(await submitEvent(INPUT)).toEqual({ kind: "offline" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("removes a long dash from the API's words and nothing else", async () => {
    vi.mocked(fetch).mockResolvedValue(
      json(503, refusal("unavailable", "Paused — try again later.")),
    );
    expect(await submitEvent(INPUT)).toEqual({
      kind: "paused",
      message: "Paused. Try again later.",
    });
  });
});

describe("resendCode", () => {
  it("posts with no body to the submission's code route", async () => {
    vi.mocked(fetch).mockResolvedValue(
      json(202, { ...RECEIPT, message: "A new code." }),
    );
    const res = await resendCode(ID);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe(`http://api.test/v1/event-submissions/${ID}/code`);
    expect(init?.body).toBeUndefined();
    expect(res).toEqual({
      kind: "sent",
      receipt: { id: ID, reference: "ES-3F9A12C0", message: "A new code." },
    });
  });

  it("reads 404 as gone and 409 as already with our team", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      json(404, refusal("not_found", "Not found, in any words.")),
    );
    expect(await resendCode(ID)).toEqual({
      kind: "gone",
      message: "Not found, in any words.",
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      json(409, refusal("conflict", "With the team, in any words.")),
    );
    expect(await resendCode(ID)).toEqual({
      kind: "with_team",
      message: "With the team, in any words.",
    });
  });

  it("reads a 429 as throttled", async () => {
    vi.mocked(fetch).mockResolvedValue(
      json(429, refusal("rate_limited", "Too many codes.")),
    );
    expect((await resendCode(ID)).kind).toBe("throttled");
  });
});

describe("verifyCode", () => {
  it("posts the code and reads a 200 as confirmed", async () => {
    vi.mocked(fetch).mockResolvedValue(
      json(200, {
        reference: "ES-3F9A12C0",
        state: "submitted",
        message: "Thanks. Your event is with our team.",
      }),
    );
    const res = await verifyCode(ID, "123456");
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe(`http://api.test/v1/event-submissions/${ID}/verify`);
    expect(JSON.parse(String(init?.body))).toEqual({ code: "123456" });
    expect(res).toEqual({
      kind: "confirmed",
      confirmation: {
        reference: "ES-3F9A12C0",
        message: "Thanks. Your event is with our team.",
      },
    });
  });

  it("reads each refusal by status and code", async () => {
    const cases: [number, string, string][] = [
      [401, "unauthorized", "wrong_code"],
      [404, "not_found", "gone"],
      [409, "conflict", "with_team"],
      [429, "rate_limited", "throttled"],
      [503, "unavailable", "paused"],
    ];
    for (const [status, code, kind] of cases) {
      vi.mocked(fetch).mockResolvedValueOnce(json(status, refusal(code)));
      const res = await verifyCode(ID, "123456");
      expect(res.kind, `${status} ${code}`).toBe(kind);
      expect(res).toMatchObject({ message: "Words the page must not read." });
    }
  });

  it("puts a 400 on the code field", async () => {
    vi.mocked(fetch).mockResolvedValue(
      json(400, {
        error: {
          code: "invalid_input",
          message: "Enter the 6-digit code from the email.",
          details: { code: "Enter the 6-digit code from the email." },
        },
      }),
    );
    expect(await verifyCode(ID, "12")).toMatchObject({
      kind: "invalid",
      fields: { code: "Enter the 6-digit code from the email." },
    });
  });

  it("does not take a status alone when the code says otherwise", async () => {
    vi.mocked(fetch).mockResolvedValue(
      json(401, refusal("token_expired", "Some other refusal.")),
    );
    expect(await verifyCode(ID, "123456")).toEqual({
      kind: "failed",
      message: "Some other refusal.",
    });
  });
});

describe("loadSubmitForm", () => {
  const CONFIG_OPEN = { releases: { checkedCities: "all" } };
  const PLACES = {
    markets: [
      {
        key: "bengaluru",
        name: "Bengaluru",
        mode: "discover",
        timezone: "Asia/Kolkata",
        currency: "INR",
        destinations: [
          {
            key: "bengaluru/indiranagar",
            name: "Indiranagar",
            kind: "local",
            visibleTo: "all",
          },
        ],
      },
    ],
  };
  const VOCABULARY = {
    categories: [{ key: "events", label: "Events" }],
    activityTypes: [],
    destinations: [],
  };

  function answer(
    config: Response | Error,
    places: Response | Error,
    vocabulary: Response | Error,
  ) {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      const pick = url.endsWith("/v1/app-config")
        ? config
        : url.endsWith("/v1/places")
          ? places
          : vocabulary;
      if (pick instanceof Error) throw pick;
      return pick;
    });
  }

  it("opens with the discover places and the categories in the order sent", async () => {
    answer(json(200, CONFIG_OPEN), json(200, PLACES), json(200, VOCABULARY));
    expect(await loadSubmitForm()).toEqual({
      kind: "open",
      places: [
        {
          key: "bengaluru/indiranagar",
          label: "Indiranagar, Bengaluru",
          timezone: "Asia/Kolkata",
        },
      ],
      categories: [{ key: "events", label: "Events" }],
    });
  });

  it("is soon when the release is not all, or cannot be read", async () => {
    answer(
      json(200, { releases: { checkedCities: "staff" } }),
      json(200, PLACES),
      json(200, VOCABULARY),
    );
    expect(await loadSubmitForm()).toEqual({ kind: "soon" });

    answer(new TypeError("down"), json(200, PLACES), json(200, VOCABULARY));
    expect(await loadSubmitForm()).toEqual({ kind: "soon" });
  });

  it("is an error when places or the vocabulary cannot be read", async () => {
    answer(json(200, CONFIG_OPEN), json(503, {}), json(200, VOCABULARY));
    expect(await loadSubmitForm()).toEqual({ kind: "error" });

    answer(json(200, CONFIG_OPEN), json(200, PLACES), new TypeError("down"));
    expect(await loadSubmitForm()).toEqual({ kind: "error" });
  });

  it("is soon when there is no discover place", async () => {
    answer(
      json(200, CONFIG_OPEN),
      json(200, { markets: [{ ...PLACES.markets[0], mode: "bookable" }] }),
      json(200, VOCABULARY),
    );
    expect(await loadSubmitForm()).toEqual({ kind: "soon" });
  });
});
