import { Section, SectionHeading } from "@/components/ui/section";
import { DestinationGrid } from "@/components/destinations/destination-panel";
import { DESTINATIONS } from "@/lib/site/destinations";
import { EXPANSION_STATUS } from "@/lib/site/launch";

/**
 * Where Yuvoy opens, as a triptych.
 *
 * This is the act that has to do two contradictory things at once: make the
 * Andamans feel like the whole point, and make clear they are the first
 * destination rather than the shape of the product. The headline does the
 * first; the status line under it does the second, in one line, without the
 * defensive framing the old strategy act used to carry ("a second market is a
 * decision, not a date" — retired 2026-08-07, it made a plan sound like an
 * excuse).
 *
 * The three plates come from `DESTINATIONS`. **Nothing about this section
 * knows there are three of them, or that they are islands** — a second market
 * is an entry in that file, and this section renders whatever it is given.
 *
 * ## Why this act is dark (owner direction, 2026-08-07)
 *
 * It swapped surfaces with the operator act, and the page is better for it:
 * forest → cream → forest → cream → forest → cream → forest, alternating the
 * whole way down instead of running two cream acts and then three dark ones.
 *
 * The plates were already forest, so on this ground they stop being panels
 * *on* a page and become photographs bleeding *into* it — each dissolving
 * from its image into a caption set on the section's own green. That is the
 * better version of the composition, and it is why the grid takes a `tone`:
 * a plate with no photograph has to earn its edges back some other way.
 */
export function FirstLaunch() {
  return (
    <Section
      tone="ink"
      id="destinations"
      aria-labelledby="first-launch-heading"
    >
      <SectionHeading
        id="first-launch-heading"
        tone="ink"
        eyebrow="First launch"
        title="Opening in the"
        accent="Andaman Islands."
        body="We are starting with Havelock, Neil and Port Blair while onboarding more destinations for what comes next."
      />

      {/* The status line, once. Set as a quiet rule-and-label rather than a
          panel: it is context for the headline above it, not a notice. */}
      <p className="label text-cream/70 border-cream/12 mt-8 border-t pt-4 sm:mt-10 sm:pt-5">
        {EXPANSION_STATUS}
      </p>

      <DestinationGrid
        destinations={DESTINATIONS}
        tone="ink"
        className="mt-8 sm:mt-14"
      />
    </Section>
  );
}
