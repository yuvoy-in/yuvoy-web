import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { submitLead, type LeadInput } from "./api";

const INPUT: LeadInput = {
  audience: "traveller",
  contactName: "Test Person",
  whatsapp: "+919000000000",
  privacyAccepted: true,
  marketingOptIn: false,
  marketKey: "andaman",
  source: "web",
  primaryDestinationKey: "andaman/havelock",
  interests: ["diving_water"],
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("submitLead", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.test");
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("classifies a 201 as recorded", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(201, {
        id: "x",
        audience: "traveller",
        status: "recorded",
        createdAt: "2026-07-31T00:00:00Z",
      }),
    );
    const res = await submitLead(INPUT);
    expect(res.kind).toBe("recorded");
  });

  it("classifies a 200 with status updated as updated", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(200, {
        id: "x",
        audience: "traveller",
        status: "updated",
        createdAt: "2026-07-31T00:00:00Z",
      }),
    );
    const res = await submitLead(INPUT);
    expect(res.kind).toBe("updated");
  });

  it("maps 400 field details onto the form", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(400, {
        error: {
          code: "invalid_input",
          message: "Some details need another look.",
          details: { whatsapp: "Include your country code, for example +91." },
        },
      }),
    );
    const res = await submitLead(INPUT);
    expect(res.kind).toBe("invalid");
    if (res.kind === "invalid") {
      expect(res.fields.whatsapp).toMatch(/country code/);
    }
  });

  it("classifies 429 as rate_limited", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(429, { error: {} }));
    expect((await submitLead(INPUT)).kind).toBe("rate_limited");
  });

  it("classifies 503 as unavailable — never fake success", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(503, { error: {} }));
    expect((await submitLead(INPUT)).kind).toBe("unavailable");
  });

  it("classifies a network failure as unavailable", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("fetch failed"));
    expect((await submitLead(INPUT)).kind).toBe("unavailable");
  });

  it("reports unavailable when no API base URL is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    // Re-import so the module reads the stubbed env.
    vi.resetModules();
    const { submitLead: freshSubmit } = await import("./api");
    expect((await freshSubmit(INPUT)).kind).toBe("unavailable");
    expect(fetch).not.toHaveBeenCalled();
  });
});

/*
  Base-URL normalisation.

  A schemeless value is not a hypothetical: `NEXT_PUBLIC_API_BASE_URL` was set
  to `api.yuvoy.in` in production, which made fetch() resolve it as a relative
  path — every submission posted to https://<site>/api.yuvoy.in/v1/leads and
  404'd, presenting to visitors as an API outage.
*/
describe("submitLead base URL handling", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  async function urlFor(configured: string): Promise<string> {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", configured);
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(201, {
        id: "x",
        audience: "traveller",
        status: "recorded",
        createdAt: "2026-07-31T00:00:00Z",
      }),
    );
    await submitLead(INPUT);
    // The latest call — this helper is used more than once per test.
    return vi.mocked(fetch).mock.calls.at(-1)![0] as string;
  }

  it("adds a missing scheme rather than posting to a relative path", async () => {
    expect(await urlFor("api.yuvoy.in")).toBe("https://api.yuvoy.in/v1/leads");
  });

  it("leaves an explicit scheme alone", async () => {
    expect(await urlFor("https://api.yuvoy.in")).toBe(
      "https://api.yuvoy.in/v1/leads",
    );
    expect(await urlFor("http://api.test")).toBe("http://api.test/v1/leads");
  });

  it("strips trailing slashes so the path never doubles up", async () => {
    expect(await urlFor("https://api.yuvoy.in//")).toBe(
      "https://api.yuvoy.in/v1/leads",
    );
  });

  it("still reports unavailable when nothing is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "   ");
    const result = await submitLead(INPUT);
    expect(result.kind).toBe("unavailable");
    expect(fetch).not.toHaveBeenCalled();
  });
});
