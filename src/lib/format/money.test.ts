import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("prints whole rupees without decimals", () => {
    expect(formatMoney({ amountMinor: 450000, currency: "INR" })).toBe(
      "₹4,500",
    );
  });

  it("groups the way India reads a number", () => {
    expect(formatMoney({ amountMinor: 12345600, currency: "INR" })).toBe(
      "₹1,23,456",
    );
  });

  it("keeps paise when there are any", () => {
    expect(formatMoney({ amountMinor: 450050, currency: "INR" })).toBe(
      "₹4,500.50",
    );
  });

  it("knows a currency with no minor unit", () => {
    expect(formatMoney({ amountMinor: 500, currency: "JPY" })).toContain("500");
    expect(formatMoney({ amountMinor: 500, currency: "JPY" })).not.toContain(
      ".",
    );
  });
});
