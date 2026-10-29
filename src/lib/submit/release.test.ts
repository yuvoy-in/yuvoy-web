import { describe, expect, it } from "vitest";
import { organiserFormOpen } from "./release";

/**
 * This site has no sign-in, so `all` is the only stage that opens the form
 * here (yuvoy-web#177). Everything else, including no answer at all, keeps it
 * closed and the page shows "soon".
 */
describe("organiserFormOpen", () => {
  it("opens on all", () => {
    expect(organiserFormOpen({ releases: { checkedCities: "all" } })).toBe(
      true,
    );
  });

  for (const stage of ["off", "staff", "early"] as const) {
    it(`stays closed at ${stage}`, () => {
      expect(organiserFormOpen({ releases: { checkedCities: stage } })).toBe(
        false,
      );
    });
  }

  it("stays closed with no checkedCities key", () => {
    expect(organiserFormOpen({ releases: { explore: "all" } })).toBe(false);
  });

  it("stays closed with no releases at all", () => {
    expect(organiserFormOpen({})).toBe(false);
  });

  it("stays closed with no config", () => {
    expect(organiserFormOpen(null)).toBe(false);
    expect(organiserFormOpen(undefined)).toBe(false);
  });
});
