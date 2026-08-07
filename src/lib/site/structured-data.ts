import { SITE_URL } from "@/lib/site";

/**
 * Structured data.
 *
 * ## The allow-list is the point
 *
 * Only three `@type`s may ever appear on this site. Everything else is barred,
 * and the banned list is not arbitrary — it is the set of types that assert
 * things Yuvoy cannot currently back:
 *
 * - `AggregateRating` / `Review` — there are no ratings or reviews.
 * - `Product` / `Offer` — nothing is for sale; there are no prices.
 * - `Event` — nothing is scheduled or bookable.
 * - `LocalBusiness` / `TouristAttraction` — we are not the operator, and
 *   claiming to be one in markup is a claim even if no page says it in words.
 *
 * "SEO polish" is the likeliest way a truthfulness violation gets reintroduced,
 * because structured data is invisible on the page. A test parses every
 * rendered route and fails on anything outside `ALLOWED_TYPES`, which is the
 * actual enforcement — not this comment.
 */
export const ALLOWED_TYPES = [
  "Organization",
  "WebSite",
  "BreadcrumbList",
] as const;

export const FORBIDDEN_TYPES = [
  "AggregateRating",
  "Review",
  "Product",
  "Offer",
  "Event",
  "LocalBusiness",
  "TouristAttraction",
] as const;

export type AllowedType = (typeof ALLOWED_TYPES)[number];

type JsonLd = Record<string, unknown> & {
  "@context": "https://schema.org";
  "@type": AllowedType;
};

/** Who Yuvoy is. No address, no rating, no contact point we cannot honour. */
export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Yuvoy",
    url: SITE_URL,
    description:
      "Yuvoy is building an experience commerce platform, opening first in the Andaman Islands.",
    slogan: "Experience more.",
    /*
      A square mark on its own ground, not the Open Graph card. Google wants
      an organisation logo it can crop to a square and place beside a result;
      the OG card is 1200x630 of headline with the mark in a corner, which
      crops to a slice of type. `/icon.png` is 512x512, generated from the
      vector by scripts/generate-icons.mjs, and well over the 112px floor.
    */
    logo: `${SITE_URL}/icon.png`,
  };
}

/**
 * The site itself.
 *
 * Deliberately no `SearchAction`: there is no site search, and declaring one
 * would advertise a capability that does not exist.
 */
export function webSiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Yuvoy",
    url: SITE_URL,
    inLanguage: "en",
  };
}

export function breadcrumbSchema(
  trail: { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}
