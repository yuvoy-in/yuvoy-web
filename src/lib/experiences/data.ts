import type { Experience, ExperienceSummary } from "@/lib/api/types";

const inr = (rupees: number) => ({
  amountMinor: rupees * 100,
  currency: "INR",
});

const ANCHOR = {
  id: "prov_bubbles",
  name: "Andaman Bubbles Diving",
  tier: "professional" as const,
  verified: true,
};
const YUVOY_HOSTS = {
  id: "prov_yuvoy",
  name: "Yuvoy Hosts",
  tier: "creator" as const,
  verified: true,
};

/**
 * Season One seed. Real content from the brand docs, shaped to the API
 * contract. When the live endpoint lands, only the accessors below change —
 * callers stay identical.
 */
const EXPERIENCES: Experience[] = [
  {
    id: "exp_scuba",
    slug: "sunrise-scuba-dive",
    title: "Sunrise Scuba Dive",
    location: "Havelock Island",
    category: "adventure",
    mode: "travel",
    durationMinutes: 180,
    fromPrice: inr(4500),
    rating: 4.9,
    reviewCount: 212,
    provider: ANCHOR,
    policyTier: "weather",
    maxGroupSize: 4,
    summary:
      "Descend into the reefs of the Andaman Sea with a dive team that has called these waters home for years.",
    description:
      "First light on the water, then below it. Guided by instructors who have dived these reefs for over a decade, you drop into a quiet, teeming world before the day's boats arrive. For certified divers and first-timers alike — the sea decides the pace, and we follow it.",
    highlights: [
      "Reefs at their calmest, before the crowds",
      "Small groups, one guide per pair",
      "Beginner discovery dives and certified dives",
    ],
    included: ["All dive gear", "Certified divemaster", "Boat transfer"],
    gallery: [],
  },
  {
    id: "exp_biolum",
    slug: "bioluminescence-night-kayak",
    title: "Bioluminescence Night Kayak",
    location: "Havelock Island",
    category: "nature_wildlife",
    mode: "travel",
    durationMinutes: 120,
    fromPrice: inr(2800),
    rating: 4.8,
    reviewCount: 96,
    provider: {
      id: "prov_bluetide",
      name: "Blue Tide Adventures",
      tier: "professional",
      verified: true,
    },
    policyTier: "weather",
    maxGroupSize: 8,
    summary:
      "Paddle into the dark and watch the water light up with every stroke.",
    description:
      "On moonless nights the bay fills with plankton that glow at the touch of a paddle. You slip out after dusk and trace glowing lines across black water — no engine, no light but the sea's own. A guide reads the tide and the sky so the night stays yours.",
    highlights: [
      "Best on new-moon nights",
      "Stable sit-on-top kayaks, no experience needed",
      "Guided in small groups",
    ],
    included: ["Kayak & safety gear", "Local guide", "Dry bag"],
    gallery: [],
  },
  {
    id: "exp_island",
    slug: "island-hopping",
    title: "Island Hopping",
    location: "Havelock & around",
    category: "adventure",
    mode: "travel",
    durationMinutes: 480,
    fromPrice: inr(6500),
    rating: 4.9,
    reviewCount: 74,
    provider: ANCHOR,
    policyTier: "weather",
    maxGroupSize: 10,
    summary:
      "Trace the archipelago by boat — empty beaches, hidden coves and the islands as the people who live them know them.",
    description:
      "A full day on the water with boatmen who grew up on it. You move between islands the ferries skip, stop where the swimming is good, and eat what the day brings. Nothing is rushed and nothing is scripted — the route bends to the weather and the mood.",
    highlights: [
      "Beaches you can't reach by road",
      "Snorkelling stops along the way",
      "Lunch with the crew",
    ],
    included: ["Private boat & crew", "Snorkel gear", "Lunch & water"],
    gallery: [],
  },
  {
    id: "exp_fishing",
    slug: "game-fishing",
    title: "Game Fishing",
    location: "Havelock Island",
    category: "adventure",
    mode: "travel",
    durationMinutes: 300,
    fromPrice: inr(9000),
    rating: 4.7,
    reviewCount: 41,
    provider: ANCHOR,
    policyTier: "weather",
    maxGroupSize: 4,
    summary:
      "Head out with local boatmen for the day's catch, the way these waters have been worked for generations.",
    description:
      "Out past the reef line where the water goes deep and dark, you fish the way the islanders do. The boatmen know where the fish run with the season. Land something and the evening's dinner sorts itself out.",
    highlights: [
      "Deep-water trolling and bottom fishing",
      "Generations of local knowledge",
      "Cook your catch on return",
    ],
    included: ["Boat, crew & tackle", "Bait", "Refreshments"],
    gallery: [],
  },
  {
    id: "exp_intertidal",
    slug: "intertidal-walk",
    title: "Intertidal Walk",
    location: "Havelock Island",
    category: "nature_wildlife",
    mode: "travel",
    durationMinutes: 90,
    fromPrice: inr(1500),
    rating: 4.8,
    reviewCount: 33,
    provider: YUVOY_HOSTS,
    policyTier: "flexible",
    maxGroupSize: 8,
    summary:
      "Read the shoreline at low tide — the small, secret life the sea leaves behind.",
    description:
      "When the tide pulls back it leaves a world you'd otherwise walk straight past: anemones, brittle stars, hunting octopus, shells still on the move. A naturalist host slows you right down until the shore comes alive in your hands.",
    highlights: [
      "Timed to the lowest tide",
      "Led by a resident naturalist",
      "Gentle, family-friendly pace",
    ],
    included: ["Naturalist host", "Reef-safe footing guidance"],
    gallery: [],
  },
  {
    id: "exp_birding",
    slug: "bird-watching",
    title: "Bird Watching at First Light",
    location: "Havelock Island",
    category: "nature_wildlife",
    mode: "travel",
    durationMinutes: 180,
    fromPrice: inr(2200),
    rating: 4.9,
    reviewCount: 28,
    provider: YUVOY_HOSTS,
    policyTier: "flexible",
    maxGroupSize: 6,
    summary:
      "Into the forest at first light, where the Andamans hide species found nowhere else on earth.",
    description:
      "The islands hold endemics you'll find in no other forest on the planet. Before the heat, you walk in with a host who knows their calls, and the canopy slowly gives them up — the Andaman drongo, the serpent eagle, the woodpecker that exists only here.",
    highlights: [
      "Andaman endemics",
      "Dawn start, before the heat",
      "Binoculars provided",
    ],
    included: ["Expert host", "Binoculars", "Field notes"],
    gallery: [],
  },
  {
    id: "exp_stargazing",
    slug: "stargazing",
    title: "Stargazing",
    location: "Havelock Island",
    category: "nature_wildlife",
    mode: "travel",
    durationMinutes: 120,
    fromPrice: inr(1800),
    rating: 4.9,
    reviewCount: 52,
    provider: YUVOY_HOSTS,
    policyTier: "weather",
    maxGroupSize: 12,
    summary:
      "Skies almost untouched by light pollution — the night as it was meant to be seen.",
    description:
      "So far from any city that the Milky Way throws a shadow. On a dark beach, a host walks you across the sky — the constellations, the planets, the satellites drifting through — while the sea keeps time behind you.",
    highlights: [
      "Near-zero light pollution",
      "Telescope viewing",
      "Guided sky tour",
    ],
    included: ["Astronomy host", "Telescope", "Mats & blankets"],
    gallery: [],
  },
  {
    id: "exp_dinner",
    slug: "candlelight-dinner",
    title: "Candlelight Dinner by the Sea",
    location: "Havelock Island",
    category: "food_drink",
    mode: "travel",
    durationMinutes: 150,
    fromPrice: inr(7500),
    rating: 5.0,
    reviewCount: 18,
    provider: {
      id: "prov_shore",
      name: "Shore Table",
      tier: "professional",
      verified: true,
    },
    policyTier: "firm",
    maxGroupSize: 2,
    summary:
      "A table set for two where the sea meets the sand — a night made for the occasion.",
    description:
      "One table, set on the sand at the water's edge, lit by candles and the last of the light. A private menu built around the day's catch and island produce, served while the tide comes slowly in. For the night that deserves it.",
    highlights: [
      "Private beachfront table for two",
      "Menu around the day's catch",
      "Candlelight and quiet",
    ],
    included: ["Multi-course dinner", "Private setup", "Dedicated server"],
    gallery: [],
  },
];

export function listExperiences(): ExperienceSummary[] {
  return EXPERIENCES;
}

export function getExperience(slug: string): Experience | undefined {
  return EXPERIENCES.find((e) => e.slug === slug);
}

export function experienceSlugs(): string[] {
  return EXPERIENCES.map((e) => e.slug);
}
