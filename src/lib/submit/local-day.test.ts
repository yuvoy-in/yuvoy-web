import { describe, expect, it } from "vitest";
import {
  addDays,
  endInRun,
  isDay,
  startBounds,
  startInRange,
  todayIn,
} from "./local-day";

describe("todayIn", () => {
  it("is the place's day, not the browser's", () => {
    // 23:30 UTC is 05:00 the next morning in India.
    const now = new Date("2026-10-29T23:30:00Z");
    expect(todayIn("Asia/Kolkata", now)).toBe("2026-10-30");
    expect(todayIn("UTC", now)).toBe("2026-10-29");
  });

  it("falls back to UTC for a zone it does not know", () => {
    const now = new Date("2026-10-29T23:30:00Z");
    expect(todayIn("Not/AZone", now)).toBe("2026-10-29");
  });
});

describe("days", () => {
  it("moves across months, years and a leap day", () => {
    expect(addDays("2026-10-30", 2)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-10-30", -1)).toBe("2026-10-29");
  });

  it("knows a real day from a shape", () => {
    expect(isDay("2026-10-30")).toBe(true);
    expect(isDay("2026-02-30")).toBe(false);
    expect(isDay("30/10/2026")).toBe(false);
    expect(isDay("")).toBe(false);
  });
});

describe("the start date", () => {
  const today = "2026-10-30";

  it("allows today up to 365 days ahead", () => {
    expect(startBounds(today)).toEqual({ min: today, max: "2027-10-30" });
    expect(startInRange(today, today)).toBe(true);
    expect(startInRange(addDays(today, 365), today)).toBe(true);
  });

  it("refuses yesterday and 366 days ahead", () => {
    expect(startInRange(addDays(today, -1), today)).toBe(false);
    expect(startInRange(addDays(today, 366), today)).toBe(false);
  });
});

describe("the end date", () => {
  const start = "2026-11-10";

  it("allows the start day up to 30 days after it", () => {
    expect(endInRun(start, start)).toBe(true);
    expect(endInRun(start, addDays(start, 30))).toBe(true);
  });

  it("refuses a day before the start, and 31 days after it", () => {
    expect(endInRun(start, addDays(start, -1))).toBe(false);
    expect(endInRun(start, addDays(start, 31))).toBe(false);
  });
});
