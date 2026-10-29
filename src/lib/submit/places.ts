import type { components } from "@/lib/api/schema";

export type PlaceList = components["schemas"]["PlaceList"];

/** One choice for "Where is it?". */
export interface PlaceOption {
  /** The `DestinationKey` sent as `destinationKey`. */
  key: string;
  /** "{place}, {region}": the destination's name, then its market's. */
  label: string;
  /** The market's IANA zone, which decides the place's "today". */
  timezone: string;
}

/**
 * The places an event can be sent for: the destinations of `discover`
 * markets, in the order the API lists them.
 *
 * A bookable market is where operators sell, and the API refuses an event
 * there (`details.destinationKey`), so it is never offered. An empty result
 * means the form has nowhere to send an event, and the page shows "soon"
 * rather than a picker with nothing in it.
 */
export function discoverPlaces(
  list: PlaceList | null | undefined,
): PlaceOption[] {
  const markets = Array.isArray(list?.markets) ? list.markets : [];
  return markets
    .filter((market) => market.mode === "discover")
    .flatMap((market) =>
      (market.destinations ?? []).map((destination) => ({
        key: destination.key,
        label: `${destination.name}, ${market.name}`,
        timezone: market.timezone,
      })),
    );
}
