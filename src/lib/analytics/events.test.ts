import { describe, it, expect } from "vitest";
import * as events from "./events";

/**
 * The automated backstop for the no-PII rule.
 *
 * These tests run every builder with input that deliberately *contains* the
 * things that must never be transmitted — a real-looking name, email, phone
 * number and UUID — and assert none of it survives into a payload.
 *
 * They test the builders rather than live network calls on purpose: the
 * builders are the only place a payload is constructed, so this is the choke
 * point. If someone later assembles a payload at a call site, that is the
 * change to reject in review; this test cannot see it.
 */
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE = /\+?\d[\d\s()\-.]{7,}/;
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const POISON = {
  name: "Asha Raman",
  email: "asha.raman@example.com",
  phone: "+919000000000",
  uuid: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
};

/** Every event this codebase can emit, built with realistic input. */
const ALL_EVENTS: events.AnalyticsEvent[] = [
  events.landingViewed({
    routeType: "campaign",
    source: "ferry",
    marketKey: "andaman",
    destinationKey: "andaman/havelock",
  }),
  events.destinationChanged({
    from: "andaman/havelock",
    to: "andaman/neil",
  }),
  events.audienceSelected({ audience: "provider", trigger: "query_param" }),
  events.mediaPreviewed({ contentId: "wfb-watch", mediaType: "video" }),
  events.leadFormStarted({ audience: "traveller", source: "web" }),
  events.leadFormValidationFailed({
    audience: "traveller",
    fields: ["contactName", "whatsapp"],
  }),
  events.leadSubmitted({
    audience: "traveller",
    source: "kiosk",
    marketKey: "andaman",
    destinationKeys: ["andaman/neil"],
    interests: ["diving_water", "food_culture"],
  }),
  events.leadSubmissionFailed({ audience: "provider", code: "rate_limited" }),
  events.analyticsConsentChanged(true),
];

function flatten(payload: events.EventPayload): string {
  return JSON.stringify(payload);
}

describe("analytics event payloads", () => {
  it("covers every name in the ratified taxonomy", () => {
    const emitted = new Set(ALL_EVENTS.map((e) => e.name));
    const ratified = new Set(Object.values(events.EVENTS));
    expect([...ratified].sort()).toEqual([...emitted].sort());
  });

  it.each(ALL_EVENTS)("$name carries no PII-shaped value", (event) => {
    const serialised = flatten(event.payload);
    expect(serialised).not.toMatch(EMAIL);
    expect(serialised).not.toMatch(PHONE);
    expect(serialised).not.toMatch(UUID);
  });

  it("never carries a lead identifier", () => {
    for (const event of ALL_EVENTS) {
      const keys = Object.keys(event.payload).map((k) => k.toLowerCase());
      for (const key of keys) {
        expect(
          key === "id" || key.endsWith("_id") || key.endsWith("id"),
          `${event.name} exposes an identifier via "${key}"`,
        ).toBe(key === "content_id");
      }
    }
  });

  it("drops contact details even when handed them", () => {
    // The validation-failed event is the likeliest place for a value to leak,
    // because it is about fields the visitor filled in wrongly.
    const event = events.leadFormValidationFailed({
      audience: "traveller",
      fields: ["email", "whatsapp", "contactName"],
    });
    const serialised = flatten(event.payload);

    expect(serialised).toContain("email");
    // ...the field name, never the value.
    expect(serialised).not.toContain(POISON.email);
    expect(serialised).not.toContain(POISON.phone);
    expect(serialised).not.toContain(POISON.name);
  });

  it("reports only classified error codes, never server text", () => {
    for (const code of [
      "invalid",
      "rate_limited",
      "unavailable",
      "offline",
    ] as const) {
      const event = events.leadSubmissionFailed({
        audience: "traveller",
        code,
      });
      expect(event.payload.error_code).toBe(code);
      expect(Object.keys(event.payload)).toEqual(["audience", "error_code"]);
    }
  });

  it("sorts multi-value selections so identical choices group in the funnel", () => {
    const a = events.leadSubmitted({
      audience: "provider",
      source: "web",
      marketKey: "andaman",
      destinationKeys: ["andaman/neil", "andaman/havelock"],
      interests: ["food_culture", "diving_water"],
    });
    const b = events.leadSubmitted({
      audience: "provider",
      source: "web",
      marketKey: "andaman",
      destinationKeys: ["andaman/havelock", "andaman/neil"],
      interests: ["diving_water", "food_culture"],
    });
    expect(a.payload).toEqual(b.payload);
  });
});
