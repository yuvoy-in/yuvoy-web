import { LifeBuoy } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";

/**
 * The safety position.
 *
 * **Deliberately claim-free.** No verification process, refund policy, waiver
 * or insurance handling is described here, because none of those processes
 * exists yet and none has been signed off. What is stated is a standard we
 * hold ourselves to, phrased as intent — which is true — rather than as a
 * procedure already running, which would not be.
 *
 * The dedicated /safety page is a later rebuild issue and is gated on an
 * explicit owner sign-off; nothing here links to it until it exists.
 */
export function SafetyTeaser() {
  return (
    <Section
      aria-labelledby="safety-heading"
      className="border-cream-line border-t"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionHeading
            id="safety-heading"
            eyebrow="On the water"
            title="The sea deserves"
            accent="respect."
            body="Diving and open water are not activities to be casual about, and we would rather lose a booking than overstate anyone's readiness."
          />
        </div>
        <div className="lg:col-span-5 lg:pt-24">
          <LifeBuoy
            aria-hidden
            strokeWidth={1.25}
            className="text-terra-deep size-7"
          />
          <p className="text-forest/75 mt-6 leading-relaxed">
            Experiences involving diving or open water will only ever be listed
            with operators who run them properly, and we will always be explicit
            about what a day requires of you — before you commit, not at the
            jetty.
          </p>
        </div>
      </div>
    </Section>
  );
}
