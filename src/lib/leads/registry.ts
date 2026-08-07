import type { components } from "@/lib/api/schema";

/**
 * Launch-market registry for the lead funnel.
 *
 * Geography is generic by contract: a market key names a launch market and a
 * destination key is `<market>/<destination>`. Andaman is the first market,
 * not the shape of the data — a future market is a new entry here, nothing
 * else changes.
 */

export type LeadAudience = components["schemas"]["LeadAudience"];
export type InterestGroup = components["schemas"]["InterestGroup"];
export type LeadSource = components["schemas"]["LeadSource"];

export interface Destination {
  key: string; // e.g. "andaman/havelock"
  label: string;
}

export interface Market {
  key: string; // e.g. "andaman"
  label: string;
  destinations: Destination[];
}

/** The active launch market. */
export const LAUNCH_MARKET: Market = {
  key: "andaman",
  label: "Andaman Islands",
  destinations: [
    { key: "andaman/havelock", label: "Havelock (Swaraj Dweep)" },
    { key: "andaman/neil", label: "Neil (Shaheed Dweep)" },
    { key: "andaman/port_blair", label: "Port Blair" },
  ],
};

export const DEFAULT_DESTINATION = LAUNCH_MARKET.destinations[0];

export const INTERESTS: { key: InterestGroup; label: string }[] = [
  { key: "diving_water", label: "Diving & water" },
  { key: "boats_islands", label: "Boats & island days" },
  { key: "food_culture", label: "Food & culture" },
  { key: "other", label: "Something else" },
];

/** Campaign sources with their own QR/landing route under /go/<source>. */
export const CAMPAIGN_SOURCES = [
  "ferry",
  "kiosk",
  "hotel",
  "instagram",
  "direct",
] as const satisfies readonly LeadSource[];

export type CampaignSource = (typeof CAMPAIGN_SOURCES)[number];

export function isCampaignSource(v: string): v is CampaignSource {
  return (CAMPAIGN_SOURCES as readonly string[]).includes(v);
}

export function isDestinationKey(v: string): boolean {
  return LAUNCH_MARKET.destinations.some((d) => d.key === v);
}

/**
 * Campaign attribution, in one place.
 *
 * `/go/<source>` exists to answer one question: did this lead come from a
 * printed QR code, and which one. The `source` it carries is written to the
 * lead row and is the only way to tell campaign spend from organic signups.
 *
 * **It is unrecoverable if dropped.** A client-side `router.replace` leaves no
 * referrer, so whatever the form sends is the only truth there is — nothing
 * downstream can infer it later. That is what makes these three functions
 * worth having rather than inlining the string handling at four call sites:
 * every hop an operator can take between a QR route and the application has to
 * carry the source, and one that forgets fails silently and permanently
 * (yuvoy-web#70).
 */

/**
 * `/operators`, carrying the campaign source when there is one.
 *
 * Organic traffic gets a clean URL: `source=web` is the default the contract
 * already applies, so putting it in the query would only add a parameter that
 * changes nothing and can be shared or indexed.
 */
export function operatorHref(source: LeadSource, hash = ""): string {
  const query = source !== "web" ? `?source=${encodeURIComponent(source)}` : "";
  return `/operators${query}${hash}`;
}

/**
 * A `?source=` query value, validated.
 *
 * **Validated, never trusted.** This value reaches the database, and the API
 * rejects anything outside the contract's enum — so an unrecognised or hostile
 * value has to become `web` here rather than travel to a 400 that the visitor
 * would see as a broken form.
 */
export function campaignSourceFromParam(value: string | undefined): LeadSource {
  return value && isCampaignSource(value) ? value : "web";
}

/** The campaign source a `/go/<source>` pathname is currently on, if any. */
export function campaignSourceFromPathname(pathname: string): LeadSource {
  const segment = /^\/go\/([^/?#]+)/.exec(pathname)?.[1];
  return segment && isCampaignSource(segment) ? segment : "web";
}
