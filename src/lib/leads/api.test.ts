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
