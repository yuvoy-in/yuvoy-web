import { describe, expect, it } from "vitest";
import { dedash } from "./dedash";

const EM = "\u2014";

describe("dedash, on the strings yuvoy-api actually sends", () => {
  it("splits two independent clauses with a full stop", () => {
    expect(
      dedash(`you already have five photographs ${EM} remove one first`),
    ).toBe("you already have five photographs. Remove one first");
    expect(
      dedash(
        `this booking was already paid online ${EM} there is nothing to collect`,
      ),
    ).toBe("this booking was already paid online. There is nothing to collect");
  });

  it("never turns a refund instruction into our own next step", () => {
    expect(
      dedash(
        `Cancel the bookings you cannot take first ${EM} we will refund them and tell them why.`,
      ),
    ).toBe(
      "Cancel the bookings you cannot take first. We will refund them and tell them why.",
    );
  });

  it("uses a comma where a full stop would leave a fragment", () => {
    expect(
      dedash(
        `The bookings you already have still stand ${EM} including anyone mid-checkout.`,
      ),
    ).toBe(
      "The bookings you already have still stand, including anyone mid-checkout.",
    );
  });

  it("turns a matched pair into a real aside", () => {
    expect(
      dedash(
        `A staff login runs the day ${EM} today's manifest, who has arrived ${EM} and does not carry the figure.`,
      ),
    ).toBe(
      "A staff login runs the day (today's manifest, who has arrived) and does not carry the figure.",
    );
  });

  it("writes a range with a hyphen", () => {
    expect(dedash(`2023 ${EM} 2024`)).toBe("2023-2024");
  });

  it("never stacks punctuation, and drops a dash used as decoration", () => {
    expect(dedash(`paid online, ${EM} there is nothing to collect`)).toBe(
      "paid online, there is nothing to collect",
    );
    expect(dedash(`${EM} nothing was charged`)).toBe("nothing was charged");
  });

  it("leaves text without one exactly as it was", () => {
    const clean = "Sales are paused right now. We will tell you when it lifts.";
    expect(dedash(clean)).toBe(clean);
  });

  it("writes an en-dash range with a plain hyphen too", () => {
    expect(dedash("10\u201311 years")).toBe("10-11 years");
  });
});
