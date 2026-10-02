import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { LiveListing } from "@/lib/api/live-listing";
import { POSTER_HOST } from "@/lib/api/listing-poster";
import { ListingPanel } from "./live-listing";

/**
 * yuvoy-web#171. The why act shows a real listing from the API, or says where
 * the listings are. Nothing on it may be invented: every word on the card is
 * a field the API sent, and with no listing there is no card at all.
 */
const POSTER = `https://${POSTER_HOST}/6d198ca2c35edc71cbb85de546721d96/thumbnails/thumbnail.jpg`;

const LISTING: LiveListing = {
  slug: "havelock-night-kayak-bioluminescence",
  title: "Night kayak, bioluminescence in the creek",
  activity: "Kayaking",
  place: "Havelock (Swaraj Dweep)",
  operator: { name: "Blue Dunghi Divers", verified: true },
  price: { amountMinor: 250000, currency: "INR" },
  priceUnit: "per person",
  poster: { url: POSTER, alt: "" },
};

describe("ListingPanel with a listing", () => {
  it("opens that listing in the app, from anywhere on the screen", () => {
    const { container } = render(<ListingPanel listing={LISTING} />);

    const link = screen.getByRole("link", {
      name: "Night kayak, bioluminescence in the creek, in the Yuvoy app",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://app.yuvoy.in/e/havelock-night-kayak-bioluminescence?src=web&placement=listing",
    );
    // One way in. The drawn button is decoration over the same target.
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(container.querySelectorAll("[data-live-listing]")).toHaveLength(1);
  });

  it("prints the API's fields and nothing it did not send", () => {
    const { container } = render(<ListingPanel listing={LISTING} />);
    const card = within(
      container.querySelector("[data-live-listing]") as HTMLElement,
    );

    expect(card.getByText("Kayaking · Havelock (Swaraj Dweep)")).toBeVisible();
    expect(card.getByText("Blue Dunghi Divers")).toBeVisible();
    expect(card.getByText("Verified")).toBeVisible();
    expect(card.getByText("₹2,500")).toBeVisible();
    expect(card.getByText("per person")).toBeVisible();
    expect(card.getByText("A real listing on Yuvoy")).toBeVisible();

    // What the tour used to invent, and what a cached page would get wrong.
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/seats? left|Ref\b|YV-\d|Sample preview/i);
    expect(text).not.toMatch(/\bNext open\b|\b\d{1,2} (Oct|Nov|Dec)\b/);
  });

  it("serves the poster through this site's optimiser", () => {
    render(<ListingPanel listing={LISTING} />);
    const img = document.querySelector("[data-live-listing] img");
    expect(img?.getAttribute("src")).toContain(
      `/_next/image?url=${encodeURIComponent(POSTER)}`,
    );
  });

  it("says Verified only when the API does", () => {
    render(
      <ListingPanel
        listing={{
          ...LISTING,
          operator: { name: "Somebody New", verified: false },
        }}
      />,
    );
    expect(screen.getByText("Somebody New")).toBeVisible();
    expect(screen.queryByText("Verified")).toBeNull();
  });

  it("prints no price, and no unit, when the listing has none", () => {
    const { container } = render(
      <ListingPanel listing={{ ...LISTING, price: null, priceUnit: null }} />,
    );
    expect(container.textContent).not.toMatch(/₹|per person/);
  });

  it("prints the unit the API phrased, not one of its own", () => {
    render(
      <ListingPanel
        listing={{
          ...LISTING,
          price: { amountMinor: 750000, currency: "INR" },
          priceUnit: "for the group",
        }}
      />,
    );
    expect(screen.getByText("₹7,500")).toBeVisible();
    expect(screen.getByText("for the group")).toBeVisible();
    expect(screen.queryByText("per person")).toBeNull();
  });
});

describe("ListingPanel with no listing", () => {
  it("draws no card and says where the listings are", () => {
    const { container } = render(<ListingPanel listing={null} />);

    expect(container.querySelector("[data-live-listing]")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).not.toMatch(/₹|Verified/);
    expect(
      screen.getByRole("link", { name: "Browse experiences" }),
    ).toHaveAttribute(
      "href",
      "https://app.yuvoy.in/?src=web&placement=listing",
    );
  });
});

describe("the steps", () => {
  it("are the three moves, and no longer controls", () => {
    render(<ListingPanel listing={null} />);

    const steps = screen.getByRole("list", { name: "How it works" });
    expect(
      within(steps)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual([
      "WatchReal videos of the experience.",
      "UnderstandClear details you can trust.",
      "BookPick a day, and pay at the counter on the day.",
    ]);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
