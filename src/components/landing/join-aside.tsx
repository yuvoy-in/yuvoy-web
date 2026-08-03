import { Reveal } from "@/components/motion/reveal";
import { WaveMotif } from "@/components/brand/wave-motif";

/**
 * Act 05 — the ask, narrated. Rendered by LeadForms as the left column of the
 * homepage registration section.
 *
 * Contract: this component owns the section's heading and must render an
 * element with `id="register-heading"` — the LeadForms section points its
 * aria-labelledby at it.
 *
 * The three answers below are the honest FAQ distilled to the questions a
 * ready-to-join visitor actually still has. Truthfulness rules apply in
 * full — no queue positions, no counts, no promised dates beyond the season.
 */
const ANSWERS = [
  {
    q: "Can I book something today?",
    a: "No, and we won't pretend otherwise. Joining tells us where you're headed and what draws you; we message you as experiences open, before booking opens anywhere else.",
  },
  {
    q: "What does joining cost?",
    a: "Nothing. No fee, no card, no spam. We only ever message you about Yuvoy.",
  },
  {
    q: "I run experiences. What happens after I apply?",
    a: "A real person reaches out on WhatsApp for a conversation about what you run. No listing fee, and terms are agreed with you before anything goes live.",
  },
  {
    q: "A word on the water",
    // The second half of this sentence is a cross-surface promise: /safety
    // makes it too, and an e2e test fails if either page drops or softens it.
    a: "The sea deserves respect. Water experiences will only ever be listed with operators who run them properly. We would rather lose a booking than overstate anyone's readiness.",
  },
];

export function JoinAside() {
  return (
    <Reveal>
      <p className="eyebrow text-terra-soft">Join Season One</p>
      <h2
        id="register-heading"
        className="font-display mt-6 text-[clamp(2.125rem,5vw,3.375rem)] leading-[1.04] font-normal tracking-tight text-balance"
      >
        Be there when it <em className="text-terra-soft italic">opens.</em>
      </h2>
      <p className="text-cream/70 mt-6 max-w-md text-lg leading-relaxed">
        The waitlist hears first: travellers get first access as experiences go
        live, and operators get a conversation before launch.
      </p>

      <WaveMotif tone="onDark" className="mt-8" />

      <p className="label text-cream/70 border-cream/12 mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-6">
        <span className="text-terra-soft">Season One</span>
        <span aria-hidden>·</span>
        When the sea turns to glass
        <span aria-hidden>·</span>
        Andaman &amp; Nicobar Islands
      </p>

      <div className="border-cream/12 mt-8 border-t">
        {ANSWERS.map((item) => (
          <details key={item.q} className="group border-cream/12 border-b">
            <summary className="text-cream flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-medium marker:content-none">
              {item.q}
              <span
                aria-hidden
                className="text-terra-soft shrink-0 text-xl leading-none transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="text-cream/70 max-w-md pb-5 text-sm leading-relaxed">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </Reveal>
  );
}
