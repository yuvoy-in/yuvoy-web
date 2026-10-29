import { describe, expect, it } from "vitest";
import { addDays } from "./local-day";
import {
  EMPTY_SUBMISSION,
  checkSubmission,
  parseRupees,
  submissionSchema,
  toSubmissionBody,
  type SubmissionFormValues,
} from "./schema";
import { WORDS } from "./words";

const TODAY = "2026-10-30";
const E = WORDS.errors;

/** A free one-day event that passes every check. */
const VALID: SubmissionFormValues = {
  ...EMPTY_SUBMISSION,
  title: "Sunday jazz at the lake",
  department: "events",
  destinationKey: "bengaluru/indiranagar",
  venue: "The Lake Stage",
  startsOn: addDays(TODAY, 3),
  isFree: "free",
  officialUrl: "https://example.org/jazz",
  organiserName: "Lake Arts Trust",
  email: "events@example.org",
  consent: true,
};

const paid = (priceFrom: string, priceTo = "") =>
  ({ ...VALID, isFree: "paid", priceFrom, priceTo }) as SubmissionFormValues;

function errorsFor(values: Partial<SubmissionFormValues>) {
  return checkSubmission({ ...VALID, ...values }, TODAY);
}

describe("checkSubmission", () => {
  it("passes a complete event", () => {
    expect(checkSubmission(VALID, TODAY)).toEqual({});
  });

  it("refuses an empty form with the issue's words, every field at once", () => {
    expect(checkSubmission(EMPTY_SUBMISSION, TODAY)).toEqual({
      title: E.title,
      department: E.department,
      destinationKey: E.destinationKey,
      startsOn: E.startsOn,
      venue: E.venue,
      isFree: E.isFree,
      officialUrl: E.officialUrl,
      organiserName: E.organiserName,
      email: E.email,
      consent: E.consent,
    });
  });

  it("holds the name to 3 to 120 characters, trimmed", () => {
    expect(errorsFor({ title: "  ab  " }).title).toBe(E.title);
    expect(errorsFor({ title: "abc" }).title).toBeUndefined();
    expect(errorsFor({ title: "a".repeat(120) }).title).toBeUndefined();
    expect(errorsFor({ title: "a".repeat(121) }).title).toBe(E.title);
  });

  it("counts characters as the API does, not UTF-16 units", () => {
    // Three emoji are three characters to Go and six units to String.length.
    expect(errorsFor({ title: "🎷🎺🥁" }).title).toBeUndefined();
  });

  it("holds the venue, the organiser, the address and the summary", () => {
    expect(errorsFor({ venue: "a" }).venue).toBe(E.venue);
    expect(errorsFor({ organiserName: " a " }).organiserName).toBe(
      E.organiserName,
    );
    expect(errorsFor({ address: "a".repeat(301) }).address).toBe(E.address);
    expect(errorsFor({ address: "a".repeat(300) }).address).toBeUndefined();
    expect(errorsFor({ summary: "a".repeat(501) }).summary).toBe(E.summary);
  });

  it("takes only a destination key the API could accept", () => {
    expect(errorsFor({ destinationKey: "Bengaluru" }).destinationKey).toBe(
      E.destinationKey,
    );
  });

  describe("dates", () => {
    it("accepts today and up to 365 days ahead", () => {
      expect(errorsFor({ startsOn: TODAY }).startsOn).toBeUndefined();
      expect(
        errorsFor({ startsOn: addDays(TODAY, 365) }).startsOn,
      ).toBeUndefined();
    });

    it("refuses yesterday and 366 days ahead", () => {
      expect(errorsFor({ startsOn: addDays(TODAY, -1) }).startsOn).toBe(
        E.startsOn,
      );
      expect(errorsFor({ startsOn: addDays(TODAY, 366) }).startsOn).toBe(
        E.startsOn,
      );
    });

    it("refuses an end before the start or 31 days after it", () => {
      const start = addDays(TODAY, 3);
      expect(errorsFor({ endsOn: addDays(start, -1) }).endsOn).toBe(E.endsOn);
      expect(errorsFor({ endsOn: addDays(start, 31) }).endsOn).toBe(E.endsOn);
      expect(errorsFor({ endsOn: addDays(start, 30) }).endsOn).toBeUndefined();
    });

    it("on one day, the end time must come after the start time", () => {
      const same = { startTime: "18:00", endTime: "18:00" };
      expect(errorsFor(same).endTime).toBe(E.endTime);
      expect(errorsFor({ ...same, endsOn: VALID.startsOn }).endTime).toBe(
        E.endTime,
      );
      expect(errorsFor({ startTime: "18:00", endTime: "17:00" }).endTime).toBe(
        E.endTime,
      );
    });

    it("over two days, an end time equal to the start is fine", () => {
      expect(
        errorsFor({
          startTime: "18:00",
          endTime: "18:00",
          endsOn: addDays(VALID.startsOn, 1),
        }).endTime,
      ).toBeUndefined();
    });

    it("refuses a time that is not 00:00 to 23:59", () => {
      expect(errorsFor({ startTime: "24:00" }).startTime).toBe(E.time);
    });
  });

  describe("prices", () => {
    it("accepts 1 and 1,00,000 rupees", () => {
      expect(checkSubmission(paid("1"), TODAY)).toEqual({});
      expect(checkSubmission(paid("1,00,000"), TODAY)).toEqual({});
    });

    it("refuses 0 and 1,00,001 rupees", () => {
      expect(checkSubmission(paid("0"), TODAY).priceFrom).toBe(E.priceFrom);
      expect(checkSubmission(paid("1,00,001"), TODAY).priceFrom).toBe(
        E.priceFrom,
      );
    });

    it("refuses Paid with no lowest price, and a decimal", () => {
      expect(checkSubmission(paid(""), TODAY).priceFrom).toBe(E.priceFrom);
      expect(checkSubmission(paid("99.50"), TODAY).priceFrom).toBe(E.priceFrom);
    });

    it("refuses a highest price below the lowest", () => {
      expect(checkSubmission(paid("500", "499"), TODAY).priceTo).toBe(
        E.priceBelow,
      );
      expect(checkSubmission(paid("500", "500"), TODAY)).toEqual({});
    });

    it("refuses a highest price out of range", () => {
      expect(checkSubmission(paid("500", "1,00,001"), TODAY).priceTo).toBe(
        E.priceTo,
      );
    });

    it("does not check a price on a free event", () => {
      expect(
        checkSubmission({ ...VALID, priceFrom: "0", priceTo: "x" }, TODAY),
      ).toEqual({});
    });

    it("reads commas and spaces, and nothing that is not whole rupees", () => {
      expect(parseRupees("1,500")).toBe(1500);
      expect(parseRupees(" 1 00 000 ")).toBe(100000);
      expect(parseRupees("1e3")).toBeNull();
      expect(parseRupees("-5")).toBeNull();
      expect(parseRupees("")).toBeNull();
    });
  });

  it("takes only an http or https link", () => {
    expect(errorsFor({ officialUrl: "example.org" }).officialUrl).toBe(
      E.officialUrl,
    );
    expect(errorsFor({ officialUrl: "ftp://example.org" }).officialUrl).toBe(
      E.officialUrl,
    );
    expect(
      errorsFor({ officialUrl: "http://example.org" }).officialUrl,
    ).toBeUndefined();
    expect(
      errorsFor({ officialUrl: `https://example.org/${"a".repeat(2048)}` })
        .officialUrl,
    ).toBe(E.officialUrlLength);
  });

  it("takes an email address a code can go to", () => {
    expect(errorsFor({ email: "events@example" }).email).toBe(E.email);
    expect(errorsFor({ email: "not an email" }).email).toBe(E.email);
  });

  it("cannot be sent without the consent box", () => {
    expect(errorsFor({ consent: false }).consent).toBe(E.consent);
  });

  it("never checks the trap field", () => {
    expect(errorsFor({ extra: "a bot was here" })).toEqual({});
  });
});

describe("toSubmissionBody", () => {
  it("leaves every empty optional field out and sends extra as it is", () => {
    expect(toSubmissionBody(VALID)).toEqual({
      destinationKey: "bengaluru/indiranagar",
      title: "Sunday jazz at the lake",
      department: "events",
      startsOn: VALID.startsOn,
      venue: "The Lake Stage",
      isFree: true,
      officialUrl: "https://example.org/jazz",
      organiserName: "Lake Arts Trust",
      email: "events@example.org",
      consent: true,
      extra: "",
    });
  });

  it("passes the trap field through untouched", () => {
    expect(toSubmissionBody({ ...VALID, extra: "  filled  " }).extra).toBe(
      "  filled  ",
    );
  });

  it("trims what the API trims", () => {
    const body = toSubmissionBody({
      ...VALID,
      title: "  Sunday jazz  ",
      address: "  ",
      summary: " Live. ",
    });
    expect(body.title).toBe("Sunday jazz");
    expect(body).not.toHaveProperty("address");
    expect(body.summary).toBe("Live.");
  });

  it("sends prices in paise, INR", () => {
    const body = toSubmissionBody(paid("1,500", "3,000"));
    expect(body.isFree).toBe(false);
    expect(body.priceFrom).toEqual({ amountMinor: 150000, currency: "INR" });
    expect(body.priceTo).toEqual({ amountMinor: 300000, currency: "INR" });
  });

  it("sends no price at all for a free event, even one typed before", () => {
    const body = toSubmissionBody({
      ...VALID,
      isFree: "free",
      priceFrom: "1500",
      priceTo: "3000",
    });
    expect(body).not.toHaveProperty("priceFrom");
    expect(body).not.toHaveProperty("priceTo");
  });

  it("sends the times and the end date when given", () => {
    const body = toSubmissionBody({
      ...VALID,
      startTime: "18:00",
      endsOn: addDays(VALID.startsOn, 2),
      endTime: "22:00",
    });
    expect(body).toMatchObject({
      startTime: "18:00",
      endsOn: addDays(VALID.startsOn, 2),
      endTime: "22:00",
    });
  });
});

describe("submissionSchema", () => {
  it("reports every refusal against its field", async () => {
    const result = await submissionSchema(() => TODAY).safeParseAsync(
      EMPTY_SUBMISSION,
    );
    expect(result.success).toBe(false);
    const paths = result.error!.issues.map((issue) => issue.path.join("."));
    expect(paths).toEqual(
      expect.arrayContaining(["title", "email", "consent", "isFree"]),
    );
  });

  it("asks for today in the chosen place", async () => {
    const asked: string[] = [];
    await submissionSchema((key) => {
      asked.push(key);
      return TODAY;
    }).safeParseAsync(VALID);
    expect(asked).toEqual(["bengaluru/indiranagar"]);
  });
});
