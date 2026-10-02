import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  firstListing,
  LISTING_REVALIDATE_SECONDS,
  readLiveListing,
} from "./live-listing";
import { POSTER_HOST } from "./listing-poster";

const poster = (id: string) =>
  `https://${POSTER_HOST}/${id}/thumbnails/thumbnail.jpg`;

/** The shape `GET /v1/experiences` returned on 2 Oct 2026, one item. */
function listing(overrides: Record<string, unknown> = {}) {
  return {
    id: "e1",
    slug: "havelock-night-kayak-bioluminescence",
    title: "Night kayak, bioluminescence in the creek",
    location: "Havelock (Swaraj Dweep)",
    activityTypeLabel: "Kayaking",
    fromPrice: { amountMinor: 250000, currency: "INR" },
    pricingUnit: "per_person",
    pricingUnitLabel: "per person",
    nextAvailable: "2026-10-06",
    seatsOnNextDisplay: "3 seats left",
    heroMedia: {
      id: "m1",
      kind: "video",
      posterUrl: poster("af4426fca1c75f36a00ce65939a2df5a"),
      aspectRatio: "9:16",
    },
    operator: { id: "o1", name: "Blue Dunghi Divers", verified: true },
    ...overrides,
  };
}

describe("firstListing", () => {
  it("reads the first listing into what the card prints, and nothing else", () => {
    expect(firstListing({ items: [listing()], complete: true })).toEqual({
      slug: "havelock-night-kayak-bioluminescence",
      title: "Night kayak, bioluminescence in the creek",
      activity: "Kayaking",
      place: "Havelock (Swaraj Dweep)",
      operator: { name: "Blue Dunghi Divers", verified: true },
      price: { amountMinor: 250000, currency: "INR" },
      priceUnit: "per person",
      poster: { url: poster("af4426fca1c75f36a00ce65939a2df5a"), alt: "" },
    });
  });

  it("never carries the date or the seats, which a cached page would get wrong", () => {
    const first = firstListing({ items: [listing()] });
    expect(JSON.stringify(first)).not.toMatch(/2026-10-06|seats/);
  });

  it("steps past a listing it cannot show", () => {
    const usable = listing({ slug: "usable" });
    const items = [
      listing({ heroMedia: undefined }),
      listing({ heroMedia: { posterUrl: "https://elsewhere.example/a.jpg" } }),
      listing({
        heroMedia: { posterUrl: poster("x").replace("https:", "http:") },
      }),
      listing({ title: "   " }),
      usable,
    ];
    expect(firstListing({ items })?.slug).toBe("usable");
  });

  it("reads a malformed optional field as absent rather than dropping the listing", () => {
    const first = firstListing({
      items: [
        listing({
          activityTypeLabel: "",
          fromPrice: { amountMinor: 0, currency: "INR" },
        }),
      ],
    });
    expect(first?.activity).toBeNull();
    expect(first?.price).toBeNull();
    // A unit with no price describes nothing.
    expect(first?.priceUnit).toBeNull();
  });

  it("shows Verified only on the API's word", () => {
    const unverified = listing({
      operator: { name: "Somebody New", verified: false },
    });
    expect(firstListing({ items: [unverified] })?.operator.verified).toBe(
      false,
    );
  });

  it("treats an empty list as no listing, not as a failure", () => {
    expect(firstListing({ items: [], complete: true })).toBeNull();
  });

  it("treats a body that is not a page of listings as a failure", () => {
    expect(() => firstListing({ error: "nope" })).toThrow();
    expect(() => firstListing(null)).toThrow();
  });
});

describe("readLiveListing", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "api.yuvoy.in");
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  /** A fresh copy of the module, so its once-per-process log starts unset. */
  async function freshReader() {
    vi.resetModules();
    return (await import("./live-listing")).readLiveListing;
  }

  it("asks the browse list, cached for five minutes and bounded in time", async () => {
    fetchMock.mockResolvedValue(Response.json({ items: [listing()] }));

    const read = await readLiveListing();

    expect(read?.slug).toBe("havelock-night-kayak-bioluminescence");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.yuvoy.in/v1/experiences?limit=10");
    expect(init.next).toEqual({ revalidate: LISTING_REVALIDATE_SECONDS });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("does not ask at all where no API is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    expect(await readLiveListing()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back on every kind of failure, and never throws", async () => {
    /*
      Not even on a production server. `/go/<source>` renders on every
      request with no earlier copy to fall back on, so a throw there is an
      error page; an earlier version threw here and the e2e suite caught it.
    */
    vi.stubEnv("NODE_ENV", "production");
    const read = await freshReader();

    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    await expect(read()).resolves.toBeNull();

    fetchMock.mockRejectedValueOnce(new DOMException("slow", "TimeoutError"));
    await expect(read()).resolves.toBeNull();

    fetchMock.mockResolvedValueOnce(new Response("busy", { status: 503 }));
    await expect(read()).resolves.toBeNull();

    fetchMock.mockResolvedValueOnce(new Response("<html>", { status: 200 }));
    await expect(read()).resolves.toBeNull();

    fetchMock.mockResolvedValueOnce(Response.json({ error: "nope" }));
    await expect(read()).resolves.toBeNull();
  });

  it("logs the first failure once, not once per page view", async () => {
    const read = await freshReader();
    fetchMock.mockResolvedValue(new Response("busy", { status: 503 }));

    await read();
    await read();

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(vi.mocked(console.warn).mock.calls[0].join(" ")).toMatch(/503/);
  });

  it("does not count an empty list as a failure", async () => {
    const read = await freshReader();
    fetchMock.mockResolvedValueOnce(Response.json({ items: [] }));

    expect(await read()).toBeNull();
    expect(console.warn).not.toHaveBeenCalled();
  });
});
