import { Section, SectionHeading } from "@/components/ui/section";

/**
 * The insight act: the observation the company is built on, stated the way a
 * founder would state it to an investor. Not "travel planning is hard" but
 * the sharper point that discovery, not booking, is the unsolved half.
 *
 * The chips are the evidence: the improvised stack every traveller actually
 * uses today. Real product names, no logos, because this is reportage rather
 * than endorsement.
 */
const STACK = [
  "Instagram",
  "Google",
  "YouTube",
  "Blogs from 2019",
  "A WhatsApp number",
  "The hotel desk",
];

export function Insight() {
  return (
    <Section id="problem" aria-labelledby="insight-heading">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading
            id="insight-heading"
            eyebrow="The real problem"
            title="The hard part was never"
            accent="booking."
          />
        </div>

        <div className="lg:col-span-7 lg:pt-2">
          <p className="text-forest/75 max-w-xl text-lg leading-relaxed">
            It&rsquo;s knowing what a place even offers. Nobody hands you that
            list, so you go hunting for it across platforms that were never
            built to answer the question.
          </p>

          <ul className="mt-8 flex flex-wrap gap-2">
            {STACK.map((source) => (
              <li
                key={source}
                className="border-cream-line bg-cream-deep text-forest/75 rounded-edge border px-4 py-2 text-sm"
              >
                {source}
              </li>
            ))}
            <li className="border-terra-deep/40 text-terra-deep rounded-edge border border-dashed px-4 py-2 text-sm">
              …then four more sites to actually book any of it
            </li>
          </ul>

          <p className="font-display border-cream-line text-forest mt-10 border-t pt-8 text-[clamp(1.375rem,2.4vw,1.75rem)] leading-snug">
            Hours later you have a shortlist, and{" "}
            <em className="text-terra-deep italic">still no idea</em> what you
            missed.
          </p>
        </div>
      </div>
    </Section>
  );
}
