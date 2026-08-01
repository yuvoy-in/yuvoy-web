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
  blurb: string;
}

const CONTENT: Record<string, { shortLabel: string; blurb: string }> = {
  "andaman/havelock": {
    shortLabel: "Havelock",
    blurb:
      "The island most people picture: long beaches, established dive operations, and the widest range of days on the water.",
  },
  "andaman/neil": {
    shortLabel: "Neil",
    blurb:
      "Smaller and slower, with shallow reefs and a pace that rewards staying put rather than moving through.",
  },
  "andaman/port_blair": {
    shortLabel: "Port Blair",
    blurb:
      "Where nearly everyone arrives — and where the islands' history, markets and ferry connections all meet.",
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
