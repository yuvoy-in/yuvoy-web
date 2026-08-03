import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
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
      <Reveal>
        <SectionHeading
          id="strategy-heading"
          eyebrow="The first market"
          title="One destination, done"
          accent="completely."
          body="We would rather cover the Andamans entirely than fifty places thinly. Concentrated supply, a sharp season, operators who all know each other: the right shape for a marketplace to start, and the model for every destination after it."
        />
      </Reveal>

      {/* A plain list, not a <dl>: the motion wrappers would sit between the
          <dl> and its items, which axe rightly rejects. */}
      <ul className="border-cream-line mt-16 grid grid-cols-1 gap-x-10 gap-y-10 border-t pt-10 sm:grid-cols-3">
        {FACTS.map((fact, i) => (
          <Reveal as="li" key={fact.caption} delay={i * 0.12}>
            <p className="flex items-baseline gap-3">
              <span className="font-display text-terra text-[clamp(3rem,5vw,4.25rem)] leading-none tracking-tight">
                {fact.figure}
              </span>
              <span className="label text-forest/75">{fact.caption}</span>
            </p>
            <p className="text-forest/75 mt-4 max-w-xs leading-relaxed">
              {fact.detail}
            </p>
          </Reveal>
        ))}
      </ul>

      {/* The manifesto line: the one sentence the page should be quoted by. */}
      <Reveal>
        <div className="border-cream-line mt-20 flex flex-col items-center border-y py-14 text-center">
          <WaveMotif />
          <p className="font-display text-forest mt-6 text-[clamp(1.875rem,4.5vw,3rem)] leading-tight tracking-tight text-balance">
            Don&rsquo;t be a tourist.{" "}
            <em className="text-terra italic">Experience more.</em>
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
