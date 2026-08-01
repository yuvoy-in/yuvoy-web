import { LAUNCH_MARKET, type Destination } from "@/lib/leads/registry";

/**
 * Editorial copy for the launch destinations.
 *
 * Names and keys come from `LAUNCH_MARKET` in the lead registry — the single
 * source of truth the API contract also uses — so a destination can never be
 * labelled one way in the form and another way in the content. Only the prose
 * lives here.
 *
 * Descriptions state geography and character only. **No operator names, no
 * prices, no counts of anything** — the same rule that applies everywhere else
 * on the site.
 */
export interface DestinationContent extends Destination {
  /** Short name for tight contexts (cards, breadcrumbs). */
  shortLabel: string;
  /**
   * URL segment under /destinations. **Deliberately not derived from `key`
   * by string manipulation** — `andaman/neil` reads better as `neil-island`
   * and `andaman/port_blair` must not become `port_blair` in a URL. An
   * explicit table is obvious to read and trivial to extend for a second
   * market; a clever transform would be neither.
   */
  slug: string;
  blurb: string;
  /** Longer editorial copy for the destination's own page. */
  body: string[];
  /** What the first season is likely to focus on here. Not a catalogue. */
  focus: string[];
}

const CONTENT: Record<string, Omit<DestinationContent, keyof Destination>> = {
  "andaman/havelock": {
    shortLabel: "Havelock",
    slug: "havelock",
    blurb:
      "The island most people picture: long beaches, established dive operations, and the widest range of days on the water.",
    body: [
      "Havelock — Swaraj Dweep on the ferry timetable — is where most visitors to the Andamans spend their days on the water. It has the longest-running dive operations in the islands, the widest choice of boats, and beaches that carry a reputation well beyond India.",
      "It is also where the gap we are building for is most obvious. There is genuinely excellent diving and boat work here, run by people who have been doing it for years, and almost none of it can be found or arranged before you arrive.",
    ],
    focus: [
      "Reef and open-water diving",
      "Half- and full-day boat trips",
      "Beach and shoreline walks",
    ],
  },
  "andaman/neil": {
    shortLabel: "Neil",
    slug: "neil-island",
    blurb:
      "Smaller and slower, with shallow reefs and a pace that rewards staying put rather than moving through.",
    body: [
      "Neil — Shaheed Dweep — is the quieter island, and the one people most often wish they had given more time. It is small enough to cross in an afternoon, with shallow reefs that suit snorkelling and first dives.",
      "Because it is smaller, it is also where a single well-run day makes the most difference to a trip. That is the kind of day we want to be able to show you before you commit to it.",
    ],
    focus: [
      "Shallow reefs and snorkelling",
      "First dives and try-dives",
      "Slow island days",
    ],
  },
  "andaman/port_blair": {
    shortLabel: "Port Blair",
    slug: "port-blair",
    blurb:
      "Where nearly everyone arrives — and where the islands' history, markets and ferry connections all meet.",
    body: [
      "Port Blair is the arrival point: the airport, the harbour, and the ferries onward. Most itineraries treat it as a night to get through rather than a place to spend time in.",
      "It is also where the islands' history and food actually live. The days we are most interested in here are the ones people currently skip because nobody told them the day existed.",
    ],
    focus: [
      "History and heritage walks",
      "Food, markets and kitchens",
      "Harbour and departure days",
    ],
  },
};

export const DESTINATIONS: DestinationContent[] =
  LAUNCH_MARKET.destinations.map((destination) => {
    const content = CONTENT[destination.key];
    if (!content) {
      // A destination added to the registry without copy would otherwise
      // render a blank card. Fail loudly at build time instead.
      throw new Error(
        `No destination copy for "${destination.key}". Add it to src/lib/site/destinations.ts.`,
      );
    }
    return { ...destination, ...content };
  });

/** Look a destination up by its URL segment. Returns undefined for unknown slugs. */
export function destinationBySlug(
  slug: string,
): DestinationContent | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}

/** `/destinations/<slug>` for a destination. */
export function destinationHref(destination: DestinationContent): string {
  return `/destinations/${destination.slug}`;
}
