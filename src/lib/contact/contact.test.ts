import { describe, expect, it } from "vitest";
import {
  countryByIso2,
  countryForE164,
  formatForDisplay,
  nationalPart,
  phoneIssue,
  toE164,
} from "@/lib/contact/phone";
import { COUNTRIES, OTHER_COUNTRY } from "@/lib/contact/countries";
import { isPlausibleEmail, suggestEmail } from "@/lib/contact/email";

const india = countryByIso2("IN");
const uk = countryByIso2("GB");

describe("toE164", () => {
  it("joins the dial code to the national number", () => {
    expect(toE164(india, "9000000000")).toBe("+919000000000");
  });

  it("strips everything a person might type between digits", () => {
    expect(toE164(india, "90000 00000")).toBe("+919000000000");
    expect(toE164(india, "(90000) 00000")).toBe("+919000000000");
    expect(toE164(india, "90000-00000")).toBe("+919000000000");
  });

  /*
    The trunk zero is the single most common thing people type, because it is
    what is printed on their own paperwork. Rejecting it loses the signup.
  */
  it("drops the national trunk prefix", () => {
    expect(toE164(uk, "07400 000000")).toBe("+447400000000");
  });

  it("is empty for an empty national part, never a bare dial code", () => {
    expect(toE164(india, "")).toBe("");
    expect(toE164(india, "   ")).toBe("");
  });

  it("takes the whole international number in Other mode", () => {
    expect(toE164(OTHER_COUNTRY, "+380 44 000 0000")).toBe("+380440000000");
  });

  /*
    People paste. Appending the selected country's dial code to a number that
    already carries one produces `+91919000000000`: silently wrong, long
    enough to pass a naive check, and only discovered when the message never
    arrives.
  */
  it("does not double the country code when a full number is pasted", () => {
    expect(toE164(india, "+919000000000")).toBe("+919000000000");
    expect(toE164(india, "+91 90000 00000")).toBe("+919000000000");
    // Pasted while a different country is selected: the paste wins.
    expect(toE164(uk, "+919000000000")).toBe("+919000000000");
  });

  it("understands the 00 international access prefix", () => {
    expect(toE164(india, "00919000000000")).toBe("+919000000000");
    expect(toE164(uk, "00 91 90000 00000")).toBe("+919000000000");
  });

  /*
    The trunk zero and the access prefix must not be confused. `07400 000000`
    is a national UK number; `0044 7400 000000` is an international one.
  */
  it("keeps the trunk zero distinct from the access prefix", () => {
    expect(toE164(uk, "07400000000")).toBe("+447400000000");
    expect(toE164(uk, "00447400000000")).toBe("+447400000000");
  });
});

describe("countryForE164", () => {
  /*
    The bug this prevents: `+91` is a prefix of nothing, but `+9` opens eight
    different codes, and a first-match lookup files every Maldivian number
    (+960) under India (+91).
  */
  it("matches the longest dial code, not the first", () => {
    expect(countryForE164("+9607700000")?.iso2).toBe("MV");
    expect(countryForE164("+919000000000")?.iso2).toBe("IN");
    expect(countryForE164("+971500000000")?.iso2).toBe("AE");
    expect(countryForE164("+94710000000")?.iso2).toBe("LK");
  });

  it("returns null for a code that is not in the table", () => {
    expect(countryForE164("+298000000")).toBeNull();
  });
});

describe("phoneIssue", () => {
  it("passes a correct number for several countries", () => {
    expect(phoneIssue("+919000000000")).toBeNull(); // IN, 10
    expect(phoneIssue("+447400000000")).toBeNull(); // GB, 10
    expect(phoneIssue("+12010000000")).toBeNull(); // US, 10
    expect(phoneIssue("+6580000000")).toBeNull(); // SG, 8
  });

  it("treats empty as the caller's problem, not an error", () => {
    expect(phoneIssue("")).toBeNull();
  });

  it("catches a dropped digit, and names the country", () => {
    const issue = phoneIssue("+91900000000");
    expect(issue).toMatch(/too short for India/i);
    expect(issue).toMatch(/10 digits/);
  });

  it("catches a doubled digit", () => {
    expect(phoneIssue("+9190000000000")).toMatch(/too long for India/i);
  });

  it("catches a country code with nothing after it", () => {
    expect(phoneIssue("+91")).toMatch(/after the country code/i);
  });

  it("enforces the E.164 ceiling even for unknown codes", () => {
    expect(phoneIssue("+2981234567890123456")).toMatch(/too long/i);
  });

  it("accepts a plausible number under an unlisted country code", () => {
    expect(phoneIssue("+298123456")).toBeNull();
  });

  it("rejects anything that is not a plus followed by digits", () => {
    expect(phoneIssue("919000000000")).toMatch(/digits only/i);
    expect(phoneIssue("+91 90000 00000")).toMatch(/digits only/i);
  });
});

describe("nationalPart", () => {
  it("round-trips with toE164", () => {
    const e164 = toE164(uk, "07400 000000");
    const part = nationalPart(e164);
    expect(part.country.iso2).toBe("GB");
    expect(part.national).toBe("7400000000");
    expect(toE164(part.country, part.national)).toBe(e164);
  });

  it("falls back to Other for an unrecognised code", () => {
    expect(nationalPart("+298123456").country.iso2).toBe(OTHER_COUNTRY.iso2);
  });
});

describe("formatForDisplay", () => {
  /*
    The success state reads the number back so a typo can still be caught.
    An unbroken run of digits is not proofreadable, which is the whole point.
  */
  it("splits the national number into two readable halves", () => {
    expect(formatForDisplay("+919000000000")).toBe("+91 90000 00000"); // 10
    expect(formatForDisplay("+6580000000")).toBe("+65 8000 0000"); // 8
    expect(formatForDisplay("+33600000000")).toBe("+33 60000 0000"); // 9, odd
    expect(formatForDisplay("+9607700000")).toBe("+960 7700 000"); // 7, odd
  });

  it("leaves a very short number alone rather than splitting it oddly", () => {
    expect(formatForDisplay("+9112345")).toBe("+91 12345");
  });

  it("returns the input unchanged when the code is unknown", () => {
    expect(formatForDisplay("+298123456")).toBe("+298123456");
  });
});

describe("the country table", () => {
  it("has no duplicate ISO codes", () => {
    const seen = new Set(COUNTRIES.map((c) => c.iso2));
    expect(seen.size).toBe(COUNTRIES.length);
  });

  it("has a sane range and an example that fits it, everywhere", () => {
    for (const country of COUNTRIES) {
      expect(country.min, country.iso2).toBeGreaterThan(0);
      expect(country.max, country.iso2).toBeGreaterThanOrEqual(country.min);
      expect(country.dial, country.iso2).toMatch(/^\d+$/);

      // An example that its own country would reject is a placeholder that
      // teaches the visitor to type something invalid.
      const digits = country.example.replace(/\D/g, "").length;
      expect(digits, `${country.iso2} example`).toBeGreaterThanOrEqual(
        country.min,
      );
      expect(digits, `${country.iso2} example`).toBeLessThanOrEqual(
        country.max,
      );
    }
  });

  it("validates every country's own example", () => {
    for (const country of COUNTRIES) {
      const e164 = toE164(country, country.example);
      expect(phoneIssue(e164), `${country.iso2}: ${e164}`).toBeNull();
    }
  });
});

describe("suggestEmail", () => {
  it("corrects the common provider misspellings", () => {
    expect(suggestEmail("me@gmial.com")).toBe("me@gmail.com");
    expect(suggestEmail("me@hotmial.com")).toBe("me@hotmail.com");
    expect(suggestEmail("me@yahooo.com")).toBe("me@yahoo.com");
    expect(suggestEmail("me@outlok.com")).toBe("me@outlook.com");
  });

  it("corrects TLD slips", () => {
    expect(suggestEmail("me@example.con")).toBe("me@example.com");
    expect(suggestEmail("me@example.cmo")).toBe("me@example.com");
  });

  /*
    The suggestion must never fire on a real address. A false suggestion is
    worse than a missed one: it tells somebody their correct address is wrong.
  */
  it("stays silent on correct addresses", () => {
    for (const address of [
      "me@gmail.com",
      "me@yahoo.co.uk",
      "me@example.co", // .co is a real TLD
      "first.last+tag@sub.domain.org",
      "me@yuvoy.in",
    ]) {
      expect(suggestEmail(address), address).toBeNull();
    }
  });

  it("stays silent on anything that is not yet an address", () => {
    expect(suggestEmail("")).toBeNull();
    expect(suggestEmail("me")).toBeNull();
    expect(suggestEmail("me@")).toBeNull();
    expect(suggestEmail("@gmail.com")).toBeNull();
    expect(suggestEmail("me@gmail")).toBeNull();
  });

  it("preserves the local part's case and only lowercases the domain", () => {
    expect(suggestEmail("First.Last@GMIAL.COM")).toBe("First.Last@gmail.com");
  });
});

describe("isPlausibleEmail", () => {
  it("accepts real shapes, including the ones strict regexes reject", () => {
    for (const address of [
      "me@example.com",
      "first.last+tag@sub.example.co.uk",
      "me@yuvoy.in",
      "über@example.com",
      "x@y.zz",
    ]) {
      expect(isPlausibleEmail(address), address).toBe(true);
    }
  });

  it("rejects only what cannot be delivered under any reading", () => {
    for (const address of [
      "",
      "me",
      "me@",
      "@example.com",
      "me@example",
      "me @example.com",
      "me@exa mple.com",
      "me@.com",
      "me@example.",
    ]) {
      expect(isPlausibleEmail(address), address).toBe(false);
    }
  });
});
