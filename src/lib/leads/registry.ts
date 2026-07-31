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
