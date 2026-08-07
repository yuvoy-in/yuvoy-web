import { LAUNCH_MARKET, type Destination } from "@/lib/leads/registry";
import type { LaunchStatus } from "@/lib/site/launch";

/**
 * Every destination Yuvoy talks about, as data.
 *
 * **This file is the only place a destination is described.** The homepage
 * triptych, the Explore page, the destination pages and the OG cards all read
 * from it, so a description that changes here changes everywhere it appears.
 * Copying a blurb into a page file is the bug this shape exists to prevent.
 *
 * Names and keys come from `LAUNCH_MARKET` in the lead registry — the single
 * source of truth the API contract also uses — so a destination can never be
 * labelled one way in the form and another way in the content.
 *
 * **Adding a second market is an entry here plus one in the registry.** No
 * component knows that Andaman is the current launch; they know a destination
 * has a `launchStatus`, and the copy follows from it.
 *
 * Descriptions state geography and character only. **No operator names, no
 * prices, no counts of anything** — the same rule that applies everywhere else
 * on the site.
 */

/**
 * A photograph for a destination panel.
 *
 * **Optional on purpose.** Until real, licensed destination photography is
 * supplied, panels render as an editorial type plate on forest, which is a
 * deliberate composition rather than an empty frame. Filling this field turns
 * the same panel into a full-bleed image with a scrim: one field, no redesign,
 * no second component to keep in sync.
 */
export interface HeroMedia {
  src: string;
  /**
   * Describes the place, not the photograph. Empty string is wrong here: a
   * destination image carries meaning, so it is never decorative.
   */
  alt: string;
}

export interface DestinationContent extends Destination {
  /** Short name, and what the site calls the place. */
  name: string;
  /**
   * The name on the ferry timetable, shown once per page at most. This is the
   * registry's label, so the site can never rename a destination out from
   * under the form or the API contract.
   */
  officialName: string;
  /**
   * URL segment under /destinations. **Deliberately not derived from `key`
   * by string manipulation** — `andaman/neil` reads better as `neil-island`
   * and `andaman/port_blair` must not become `port_blair` in a URL. An
   * explicit table is obvious to read and trivial to extend for a second
   * market; a clever transform would be neither.
   */
  slug: string;
  /** The market this sits in, as a reader would say it. */
  region: string;
  launchStatus: LaunchStatus;
  /** One sentence. Used in the triptych, the Explore grid and the OG card. */
  shortDescription: string;
  /** One sentence, practical, for the destination page's own opening. */
  introDescription: string;
  /** Longer editorial copy for the destination's own page. */
  fullDescription: string[];
  heroMedia?: HeroMedia;
  /** The kinds of day this place is known for. Not a catalogue. */
  categories: string[];
  /**
   * The value this destination submits as on the waitlist form. Named
   * separately from `key` because the form field is a contract with the
   * backend and the content layer must not quietly redefine it.
   */
  waitlistDestinationValue: string;
}

type DestinationCopy = Omit<
  DestinationContent,
  keyof Destination | "waitlistDestinationValue" | "officialName"
>;

const CONTENT: Record<string, DestinationCopy> = {
  "andaman/havelock": {
    name: "Havelock",
    slug: "havelock",
    region: "Andaman Islands",
    launchStatus: "first-launch",
    shortDescription:
      "Diving, snorkelling, boat days and the widest range of water experiences.",
    introDescription:
      "Known for established dive operations, beaches and the widest range of days on the water.",
    fullDescription: [
      "Havelock, Swaraj Dweep on the ferry timetable, is where most visitors to the Andamans spend their days on the water. It has the longest-running dive operations in the islands, the widest choice of boats, and beaches that carry a reputation well beyond India.",
      "It is also where the gap we are building for is most obvious. There is genuinely excellent diving and boat work here, run by people who have been doing it for years, and almost none of it can be found or arranged before you arrive.",
    ],
    categories: ["Diving", "Snorkelling", "Boat days", "Shoreline experiences"],
    heroMedia: {
      src: "/photography/havelock.webp",
      alt: "A dive boat moored off a jungle-fringed beach, divers surfacing in clear turquoise shallows.",
    },
  },
  "andaman/neil": {
    name: "Neil",
    slug: "neil-island",
    region: "Andaman Islands",
    launchStatus: "first-launch",
    shortDescription:
      "Shallow reefs, slower island days and easy first-time water experiences.",
    introDescription:
      "A quieter island with shallow reefs, easy first-water experiences and a slower pace.",
    fullDescription: [
      "Neil, Shaheed Dweep, is the quieter island, and the one people most often wish they had given more time. It is small enough to cross in an afternoon, with shallow reefs that suit snorkelling and first dives.",
      "Because it is smaller, it is also where a single well-run day makes the most difference to a trip. That is the kind of day we want to be able to show you before you commit to it.",
    ],
    categories: [
      "Shallow-reef snorkelling",
      "First dives",
      "Slow island days",
      "Local food",
    ],
    heroMedia: {
      src: "/photography/neil.webp",
      alt: "Clear shallow water over pale sand, a small wooden boat beside a jetty and palms along the shoreline.",
    },
  },
  "andaman/port_blair": {
    name: "Port Blair",
    slug: "port-blair",
    region: "Andaman Islands",
    launchStatus: "first-launch",
    shortDescription:
      "Food, history, markets and experiences beyond the ferry terminal.",
    introDescription:
      "The arrival point for the islands, with food, history, markets and experiences most itineraries overlook.",
    fullDescription: [
      "Port Blair is the arrival point: the airport, the harbour, and the ferries onward. Most itineraries treat it as a night to get through rather than a place to spend time in.",
      "It is also where the islands' history and food actually live. The days we are most interested in here are the ones people currently skip because nobody told them the day existed.",
    ],
    categories: [
      "Food and markets",
      "Heritage",
      "Harbour experiences",
      "Local neighbourhoods",
    ],
    heroMedia: {
      src: "/photography/port-blair.webp",
      alt: "A cook grilling seafood at a harbour stall at sunset, fishing boats moored along the quay behind.",
    },
  },
};

export const DESTINATIONS: DestinationContent[] =
  LAUNCH_MARKET.destinations.map((destination) => {
    const copy = CONTENT[destination.key];
    if (!copy) {
      // A destination added to the registry without copy would otherwise
      // render a blank card. Fail loudly at build time instead.
      throw new Error(
        `No destination copy for "${destination.key}". Add it to src/lib/site/destinations.ts.`,
      );
    }
    return {
      ...destination,
      ...copy,
      officialName: destination.label,
      waitlistDestinationValue: destination.key,
    };
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

/**
 * What a destination can honestly say about its own availability.
 *
 * Derived rather than stored, so the sentence cannot drift between the three
 * places that show it, and so a destination at a different `launchStatus`
 * gets the right sentence without anyone remembering to rewrite it.
 */
export function availabilityMessage(destination: DestinationContent): string {
  switch (destination.launchStatus) {
    case "live":
      return `Experiences in ${destination.name} are open for booking.`;
    case "opening-soon":
      return `${destination.name} opens next. Join the waitlist to hear first.`;
    case "onboarding":
    case "first-launch":
    default:
      return `Yuvoy is currently onboarding experiences in ${destination.name}. Join the waitlist to hear when the first collection opens.`;
  }
}

/** Every destination except the one given, for "related destinations" rails. */
export function otherDestinations(
  destination: DestinationContent,
): DestinationContent[] {
  return DESTINATIONS.filter((d) => d.key !== destination.key);
}
