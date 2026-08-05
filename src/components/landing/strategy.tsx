import { Section, SectionHeading } from "@/components/ui/section";
import { WaveMotif } from "@/components/brand/wave-motif";

/**
 * The strategy act. Investors and sharp-eyed visitors read a narrow launch as
 * either a limitation or a wedge; this act states it as the wedge it is,
 * backed by facts that are true today. Numbers are nouns here: every figure
 * is real or a stated design rule, and must stay that way.
 */
const FACTS = [
  {
    figure: "3",
    caption: "launch islands",
    detail: "Havelock, Neil and Port Blair. One market, covered properly.",
  },
  {
    figure: "1",
    caption: "sharp season",
    detail: "We open when the water clears, and cover the season end to end.",
  },
  {
    figure: "100%",
    caption: "operator-filmed",
    detail:
      "Every experience is shown as real footage from the people who run it. That is the rule the feed is built on.",
  },
];

export function Strategy() {
  return (
    <Section aria-labelledby="strategy-heading">
      <SectionHeading
        id="strategy-heading"
        eyebrow="The first market"
        title="One destination, done"
        accent="completely."
        body="We would rather cover the Andamans entirely than fifty places thinly. Concentrated supply, a sharp season, operators who all know each other: the right shape for a marketplace to start, and the model for every destination after it."
      />

      {/* A plain list, not a <dl>: a description list may only contain
          dt/dd pairs, and these entries pair a figure with prose. */}
      <ul className="border-cream-line mt-16 grid grid-cols-1 gap-x-10 gap-y-10 border-t pt-10 sm:grid-cols-3">
        {FACTS.map((fact) => (
          <li key={fact.caption}>
            <p className="flex items-baseline gap-3">
              <span className="font-display text-terra tracking-display text-[clamp(3rem,5vw,4.25rem)] leading-none">
                {fact.figure}
              </span>
              <span className="label text-forest/75">{fact.caption}</span>
            </p>
            <p className="text-forest/75 mt-4 max-w-xs leading-relaxed">
              {fact.detail}
            </p>
          </li>
        ))}
      </ul>

      {/*
        The manifesto line: the one sentence the page should be quoted by. It
        closes the section rather than forming a band of its own — the rules
        above and below it, and the padding inside them, left it floating in
        its own room (owner direction, 2026-08-04).
      */}
      <div className="mt-16 flex flex-col items-center text-center">
        <WaveMotif className="h-4 w-11" />
        <p className="font-display text-forest tracking-display mt-5 text-[clamp(1.875rem,4.5vw,3rem)] leading-tight text-balance">
          Don&rsquo;t be a tourist.{" "}
          <em className="text-terra font-turn italic">Experience more.</em>
        </p>
      </div>
    </Section>
  );
}
