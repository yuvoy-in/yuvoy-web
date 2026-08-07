import type { HeroMedia } from "@/lib/site/destinations";

/**
 * The kinds of experience Yuvoy is built around, as data.
 *
 * There are deliberately **two lists**, because they answer two different
 * questions and conflating them is what makes a category page read as either
 * parochial or vague:
 *
 * - `SEASON_CATEGORIES` — what the first season actually offers. Short and
 *   concrete, and the only list a visitor meets at full size.
 * - `WIDER_CATEGORIES` — the rest of the vocabulary, which has to survive a
 *   second market. Wellness and Arts do not lead an Andaman season, so they
 *   are present and quiet rather than absent.
 *
 * Neither list may grow prices, counts, listings or Book buttons. They
 * describe kinds of day, never inventory.
 */

export interface ExperienceCategory {
  key: string;
  label: string;
  /** One sentence. Never a list of subcategories. */
  description: string;
  /** See `HeroMedia` — optional, so a panel is image-ready but not image-dependent. */
  heroMedia?: HeroMedia;
}

/**
 * The first season's four, in the order `/explore` shows them.
 *
 * Copy is owner-approved and describes the day, not a catalogue of
 * activities.
 */
export const SEASON_CATEGORIES: ExperienceCategory[] = [
  {
    key: "diving_water",
    label: "Diving & water",
    description: "Scuba, snorkelling and days below the surface.",
    heroMedia: {
      src: "/photography/diving-water.webp",
      alt: "A scuba diver above a coral reef, shoals of small orange fish in the sunlit shallows.",
    },
  },
  {
    key: "boats_islands",
    label: "Boats & island days",
    description: "Routes, coves and time spent out on the water.",
    heroMedia: {
      src: "/photography/boats-islands.webp",
      alt: "Two people aboard a small wooden boat anchored in clear water beside a wooded, rocky shoreline.",
    },
  },
  {
    key: "food_culture",
    label: "Food & culture",
    description:
      "Markets, kitchens, history and the way a place actually lives.",
    heroMedia: {
      src: "/photography/food-culture.webp",
      alt: "A woman cooking over an open flame in an open-air kitchen, bowls of vegetables and spices in front of her.",
    },
  },
  {
    key: "local_unexpected",
    label: "Local & unexpected",
    description:
      "The experiences that rarely appear in a normal travel search.",
    heroMedia: {
      src: "/photography/local-unexpected.webp",
      alt: "A woman sorting the day's catch on a wooden jetty, stilt houses and moored boats behind her.",
    },
  },
];

/**
 * The rest of the vocabulary: real kinds of day that an Andaman season does
 * not lead with.
 *
 * They exist so the site does not read as a diving product, and they are shown
 * at a smaller scale for the same reason — present, not promised. When a market
 * opens where wellness or making things *is* the draw, this list and
 * `SEASON_CATEGORIES` swap roles rather than being rewritten.
 *
 * Until 2026-08-07 this file also carried a parallel seven-item
 * `PLATFORM_CATEGORIES` list (Adventure, Nature, Local life and these three),
 * which meant two names for the same day: a visitor met "Diving & water" on the
 * homepage and "Adventure" on `/explore`. The homepage grid moved to `/explore`
 * in that change, the two lists met on one page, and the duplication became
 * impossible to defend.
 */
export const WIDER_CATEGORIES: ExperienceCategory[] = [
  {
    key: "arts",
    label: "Arts & creativity",
    description: "Making something with the people who make it here.",
  },
  {
    key: "wellness",
    label: "Wellness",
    description: "Slower days, built around rest rather than distance.",
  },
  {
    key: "community",
    label: "Community",
    description: "Days that put you alongside the people who live here.",
  },
];
