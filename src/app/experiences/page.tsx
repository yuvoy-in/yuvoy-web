import type { Metadata } from "next";
import Link from "next/link";
import { Waves, Sailboat, UtensilsCrossed, Sparkle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { INTERESTS, type InterestGroup } from "@/lib/leads/registry";
import { DESTINATIONS, destinationHref } from "@/lib/site/destinations";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "The kinds of day Yuvoy is curating for its first Andaman season — diving and water, boats and island days, food and culture. No listings yet, and nothing bookable.",
  alternates: { canonical: "/experiences" },
};

/**
 * `/experiences` — a category page, not a catalogue.
 *
 * This URL was previously 410 Gone. The old version of it published invented
 * prices, invented review counts and third-party operator names flagged as
 * verified without permission, and was retired precisely because of that.
 *
 * It comes back on one condition: **it describes categories, never listings.**
 * No operator names, no prices, no availability, no counts. If a future change
 * would add any of those before the underlying capability is real, the right
 * move is to leave this page as it is.
 */
const DETAIL: Record<
  InterestGroup,
  { icon: LucideIcon; body: string; examples: string[] }
> = {
  diving_water: {
    icon: Waves,
    body: "The islands' reason for being, for most people who come. Run by people who read these seas for a living.",
    examples: [
      "Reef dives",
      "Open water",
      "Try-dives and first descents",
      "Snorkelling",
    ],
  },
  boats_islands: {
    icon: Sailboat,
    body: "Days that use the water to get somewhere, rather than to go under it.",
    examples: [
      "Half- and full-day boats",
      "Quiet coves",
      "Routes the scheduled ferries skip",
      "Sunrise and dusk crossings",
    ],
  },
  food_culture: {
    icon: UtensilsCrossed,
    body: "What the islands actually eat, cook and remember — well beyond the resort menu.",
    examples: [
      "Home and market kitchens",
      "Fish, from boat to plate",
      "History and heritage walks",
    ],
  },
  other: {
    icon: Sparkle,
    body: "The days that fit no category, which are often the ones people talk about afterwards.",
    examples: [
      "Dark-sky nights",
      "Forest and shoreline walks",
      "Whatever an operator does better than anyone",
    ],
  },
};

export default function ExperiencesPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Experiences"
        title="Four kinds of day,"
        accent="curated one island at a time."
        lede={
          <>
            <p>
              These are the categories we are building the first Andaman season
              around. They describe the kind of day, not a list you can browse.
            </p>
            <p className="mt-4">
              There are no listings on Yuvoy yet — no operators published, no
              dates, nothing bookable. Individual experiences appear here only
              once the operator is on board and the content is real.
            </p>
          </>
        }
      >
        <Link
          href="/waitlist"
          className={cn(
            buttonVariants({ size: "lg" }),
            "flex w-full sm:inline-flex sm:w-auto",
          )}
        >
          Join the waitlist
          <ButtonArrow />
        </Link>
      </PageHeader>

      <Section aria-labelledby="categories-heading">
        <SectionHeading
          id="categories-heading"
          eyebrow="The categories"
          title="What we are"
          accent="curating for."
        />
        <div className="mt-14 grid grid-cols-1 gap-px lg:grid-cols-2">
          {INTERESTS.map((interest, i) => {
            const { icon: Icon, body, examples } = DETAIL[interest.key];
            return (
              <div
                key={interest.key}
                className="border-cream-line border-t pt-10 lg:pr-12"
              >
                <div className="flex items-center gap-4">
                  <span className="label text-forest/75">0{i + 1}</span>
                  <Icon
                    aria-hidden
                    strokeWidth={1.25}
                    className="text-terra-deep size-6"
                  />
                </div>
                <h3 className="font-display text-forest mt-6 text-2xl font-normal tracking-tight">
                  {interest.label}
                </h3>
                <p className="text-forest/75 mt-3 leading-relaxed">{body}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {examples.map((example) => (
                    <li
                      key={example}
                      className="label border-cream-line text-forest/75 rounded-edge border px-3 py-1.5"
                    >
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="text-forest/75 border-cream-line mt-14 border-t pt-6 text-sm">
          Examples describe the kind of day in each category. They are not
          listings, they name no operator, and none of them can be booked.
        </p>
      </Section>

      <Section tone="ink" aria-labelledby="where-heading">
        <SectionHeading
          id="where-heading"
          tone="ink"
          eyebrow="Where"
          title="Three islands"
          accent="to begin with."
        />
        <ul className="border-cream/12 mt-14 grid grid-cols-1 gap-px border-t md:grid-cols-3">
          {DESTINATIONS.map((destination) => (
            <li key={destination.key} className="pt-10 md:pr-8">
              <h3 className="font-display text-2xl font-normal tracking-tight">
                <Link
                  href={destinationHref(destination)}
                  className="hover:text-terra-soft transition-colors duration-200"
                >
                  {destination.shortLabel}
                </Link>
              </h3>
              <p className="text-cream/70 mt-4 leading-relaxed">
                {destination.blurb}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
