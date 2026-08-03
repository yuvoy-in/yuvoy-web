import { Waves, Sailboat, UtensilsCrossed, Sparkle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { INTERESTS, type InterestGroup } from "@/lib/leads/registry";

/**
 * The categories being curated for the first season.
 *
 * Structure comes from the lead registry's `INTERESTS`, so the cards a visitor
 * sees and the options they can pick in the form can never drift apart.
 *
 * **No operator names, no prices, no ratings, no availability.** This is the
 * exact content class that got the previous /experiences pages 410'd; the
 * point is to describe a category, never to imply a bookable listing.
 */
const DETAIL: Record<InterestGroup, { icon: LucideIcon; body: string }> = {
  diving_water: {
    icon: Waves,
    body: "Reefs, dives and open water — with the people who read these seas for a living.",
  },
  boats_islands: {
    icon: Sailboat,
    body: "Island days, quiet coves and the routes the scheduled ferries skip.",
  },
  food_culture: {
    icon: UtensilsCrossed,
    body: "What the islands actually eat, cook and celebrate, beyond the resort menu.",
  },
  other: {
    icon: Sparkle,
    body: "Nights under dark skies, forest walks, and the things that fit no category.",
  },
};

export function Categories() {
  return (
    <Section aria-labelledby="categories-heading">
      <SectionHeading
        id="categories-heading"
        eyebrow="What you'll find"
        title="Four kinds of day,"
        accent="chosen by feeling."
        body="Most travel sites hand you a list to filter. Yuvoy is being built around the people who actually live a place — so what you find isn't an itinerary, it's a way in."
      />

      <ul className="border-cream-line mt-16 grid grid-cols-1 gap-px border-t sm:grid-cols-2 lg:grid-cols-4">
        {INTERESTS.map((interest, i) => {
          const { icon: Icon, body } = DETAIL[interest.key];
          return (
            <li
              key={interest.key}
              className="border-cream-line flex flex-col pt-10 sm:pr-8 lg:border-r lg:last:border-r-0"
            >
              <div className="flex items-center gap-4">
                <span className="label text-forest/75">0{i + 1}</span>
                <Icon
                  aria-hidden
                  strokeWidth={1.25}
                  className="text-terra-deep size-6"
                />
              </div>
              <h3 className="font-display text-forest mt-6 text-xl font-bold tracking-tight">
                {interest.label}
              </h3>
              <p className="text-forest/75 mt-3 text-sm leading-relaxed">
                {body}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="text-forest/75 border-cream-line mt-12 border-t pt-6 text-sm">
        Categories we&rsquo;re curating for the first season. Individual
        experiences appear here only once their operators are on board and their
        content is real.
      </p>
    </Section>
  );
}
