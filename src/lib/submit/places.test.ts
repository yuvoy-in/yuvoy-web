import { describe, expect, it } from "vitest";
import { discoverPlaces, type PlaceList } from "./places";

const LIST: PlaceList = {
  markets: [
    {
      key: "andaman",
      name: "Andaman Islands",
      mode: "bookable",
      timezone: "Asia/Kolkata",
      currency: "INR",
      destinations: [
        {
          key: "andaman/havelock",
          name: "Havelock",
          kind: "travel",
          visibleTo: "all",
        },
      ],
    },
    {
      key: "bengaluru",
      name: "Bengaluru",
      mode: "discover",
      timezone: "Asia/Kolkata",
      currency: "INR",
      destinations: [
        {
          key: "bengaluru/indiranagar",
          name: "Indiranagar",
          kind: "local",
          visibleTo: "all",
        },
        {
          key: "bengaluru/koramangala",
          name: "Koramangala",
          kind: "local",
          visibleTo: "all",
        },
      ],
    },
    {
      key: "goa",
      name: "Goa",
      mode: "discover",
      timezone: "Asia/Kolkata",
      currency: "INR",
      destinations: [
        { key: "goa/panaji", name: "Panaji", kind: "local", visibleTo: "all" },
      ],
    },
  ],
};

describe("discoverPlaces", () => {
  it("offers only the destinations of discover markets", () => {
    const keys = discoverPlaces(LIST).map((place) => place.key);
    expect(keys).not.toContain("andaman/havelock");
  });

  it("labels each as {place}, {region}", () => {
    expect(discoverPlaces(LIST)[0]).toEqual({
      key: "bengaluru/indiranagar",
      label: "Indiranagar, Bengaluru",
      timezone: "Asia/Kolkata",
    });
  });

  it("keeps the server's order, markets then destinations", () => {
    expect(discoverPlaces(LIST).map((place) => place.label)).toEqual([
      "Indiranagar, Bengaluru",
      "Koramangala, Bengaluru",
      "Panaji, Goa",
    ]);
  });

  it("is empty when no market is discover, or there is no list", () => {
    expect(discoverPlaces({ markets: [LIST.markets[0]] })).toEqual([]);
    expect(discoverPlaces({ markets: [] })).toEqual([]);
    expect(discoverPlaces(null)).toEqual([]);
  });
});
