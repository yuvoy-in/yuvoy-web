import { describe, expect, it } from "vitest";
import {
  placeServerErrors,
  providerSchema,
  travellerSchema,
} from "./lead-forms-schema";

/**
 * yuvoy-web#190. The host application route refuses a name shorter than 2
 * characters with a 400 that names no field, so the form checks it first, and
 * a 400 like that shows the API's sentence instead of doing nothing.
 */
const HOST = {
  contactName: "Asha Menon",
  businessName: "Nemo Reef Divers",
  email: "asha@example.com",
  whatsapp: "+919000000000",
  privacyAccepted: true as const,
  marketingOptIn: false,
};

function messagesFor(values: unknown, field: string): string[] {
  const res = providerSchema.safeParse(values);
  if (res.success) return [];
  const issues = res.error.issues.filter((i) => i.path[0] === field);
  return issues.map((i) => i.message);
}

describe("the host form's name minimums", () => {
  it("refuses a one character name", () => {
    const values = { ...HOST, contactName: "A" };
    const said = messagesFor(values, "contactName");
    expect(said).toEqual(["Name must be at least 2 characters."]);
  });

  it("refuses a one character business name", () => {
    const values = { ...HOST, businessName: "N" };
    const said = messagesFor(values, "businessName");
    expect(said).toEqual(["Business name must be at least 2 characters."]);
  });

  it("still says enter your name first when it is empty", () => {
    const values = { ...HOST, contactName: "  " };
    const said = messagesFor(values, "contactName");
    expect(said[0]).toBe("Enter your name.");
  });

  it("takes two characters", () => {
    const values = { ...HOST, contactName: "Al", businessName: "Bo" };
    expect(providerSchema.safeParse(values).success).toBe(true);
  });

  it("leaves the traveller waitlist at one character", () => {
    // `/v1/leads`, which the traveller form calls, keeps minLength 1.
    const values = {
      contactName: "A",
      email: "a@example.com",
      whatsapp: "",
      privacyAccepted: true,
      marketingOptIn: false,
    };
    expect(travellerSchema.safeParse(values).success).toBe(true);
  });
});

describe("placeServerErrors", () => {
  const KNOWN = Object.keys(HOST);

  it("shows the API's sentence when a 400 names no field", () => {
    const said = "application: who should we ask for?";
    const placed = placeServerErrors({}, KNOWN, said);
    expect(placed.onFields).toEqual([]);
    expect(placed.shown).toEqual([said]);
  });

  it("puts a named field's message on that field, not the sentence", () => {
    const fields = { businessName: "Too short." };
    const placed = placeServerErrors(fields, KNOWN, "Look again.");
    expect(placed.onFields).toEqual([["businessName", "Too short."]]);
    expect(placed.shown).toEqual([]);
  });

  it("puts the contact rule on the email input", () => {
    const fields = { contact: "Give us a way to reach you." };
    const placed = placeServerErrors(fields, KNOWN, "Look again.");
    expect(placed.onFields).toEqual([["email", "Give us a way to reach you."]]);
    expect(placed.shown).toEqual([]);
  });

  it("shows a field this form does not render, without the sentence", () => {
    const fields = { market: "Unknown market." };
    const placed = placeServerErrors(fields, KNOWN, "Look again.");
    expect(placed.onFields).toEqual([]);
    expect(placed.shown).toEqual(["Unknown market."]);
  });
});
