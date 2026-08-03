import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

/**
 * Act 03 — the strategy. Investors and sharp-eyed visitors read a narrow
 * launch as either a limitation or a wedge; this act states it as the wedge
 * it is, backed by the three facts that are true today. Numbers are nouns
 * here — every figure is real and owner-confirmed, and must stay that way.
 */
const FACTS = [
  {
    figure: "3",
    caption: "launch islands",
    detail: "Havelock, Neil and Port Blair — one market, covered properly.",
  },
  {
    figure: "Oct–May",
    caption: "the season we open with",
    detail: "Booking opens with Season One and follows the water.",
  },
  {
    figure: "6 yrs",
    caption: "on Havelock water",
    detail:
      "Yuvoy grows out of a dive school that has run these seas for six years.",
  },
];

export function Strategy() {
  return (
    <Section aria-labelledby="strategy-heading">
      <Reveal>
        <SectionHeading
          id="strategy-heading"
          eyebrow="03 — The first market"
          title="One destination, done"
          accent="completely."
          body="We would rather cover the Andamans entirely than fifty places thinly. Concentrated supply, a sharp season, operators who all know each other — the right shape for a marketplace to start, and the model for every destination after it."
        />
      </Reveal>

      <dl className="border-cream-line mt-16 grid grid-cols-1 gap-x-10 gap-y-10 border-t pt-10 sm:grid-cols-3">
        {FACTS.map((fact, i) => (
          <Reveal key={fact.caption} delay={i * 0.12}>
            <div className="flex items-baseline gap-3">
              <dt className="sr-only">{fact.caption}</dt>
              <dd className="font-display text-terra text-[clamp(3rem,5vw,4.25rem)] leading-none tracking-tight">
                {fact.figure}
              </dd>
              <dd className="label text-forest/75">{fact.caption}</dd>
            </div>
            <dd className="text-forest/75 mt-4 max-w-xs leading-relaxed">
              {fact.detail}
            </dd>
          </Reveal>
        ))}
      </dl>

      {/* The manifesto line — the one sentence the page should be quoted by. */}
      <Reveal>
        <p className="font-display border-cream-line text-forest mt-20 border-y py-14 text-center text-[clamp(1.875rem,4.5vw,3rem)] leading-tight tracking-tight text-balance">
          Don&rsquo;t be a tourist.{" "}
          <em className="text-terra italic">Experience more.</em>
        </p>
      </Reveal>
    </Section>
  );
}
