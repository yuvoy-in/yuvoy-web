import { Section, SectionHeading } from "@/components/ui/section";
import { DESTINATIONS } from "@/lib/site/destinations";

/**
 * The three launch destinations.
 *
 * A teaser only — the dedicated destination pages are a later rebuild issue,
 * and per the navigation registry rule these cards stay unlinked until those
 * pages actually exist.
 */
export function DestinationsTeaser() {
  return (
    <Section tone="teal" aria-labelledby="destinations-heading">
      <SectionHeading
        id="destinations-heading"
        tone="teal"
        eyebrow="Where we start"
        title="Three islands,"
        accent="done properly."
        body="One market, covered well, before anywhere else. The Andamans are high-intent and largely offline — which today means haggling at counters and hoping."
      />

      <ul className="border-cream/12 mt-16 grid grid-cols-1 gap-px border-t md:grid-cols-3">
        {DESTINATIONS.map((destination, i) => (
          <li key={destination.key} className="pt-10 md:pr-8">
            <span className="label text-terra-soft">0{i + 1}</span>
            <h3 className="font-display mt-5 text-2xl font-bold tracking-tight">
              {destination.shortLabel}
            </h3>
            <p className="label text-cream/60 mt-2">{destination.label}</p>
            <p className="text-cream/70 mt-4 leading-relaxed">
              {destination.blurb}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
