import { FaqAccordion } from "@/components/site/faq-accordion";
import { WAITLIST_FAQS } from "@/lib/site/faqs";

/**
 * The ask, narrated. Rendered by LeadForms as the left column of the
 * homepage registration section.
 *
 * Contract: this component owns the section's heading and must render an
 * element with `id="register-heading"` — the LeadForms section points its
 * aria-labelledby at it.
 *
 * ## Three questions, not four
 *
 * This carried four longer answers until 2026-08-06, including one that
 * argued the case for trusting an unlaunched waitlist and one that restated
 * the site's water-safety position. Both were true and neither belonged here:
 * a visitor at the form has already decided to join, and a defence of the
 * product at the point of conversion reads as a product that expects to be
 * doubted. The safety position lives on `/safety`, where someone looking for
 * it will actually go, and the questions here are the three a person filling
 * in a form still has.
 *
 * Truthfulness rules apply in full — no queue positions, no counts, no
 * promised dates.
 */
export function JoinAside() {
  return (
    <>
      <p className="eyebrow text-terra-soft">Early access</p>
      <h2
        id="register-heading"
        className="font-display tracking-display mt-6 text-[clamp(2.125rem,5vw,3.375rem)] leading-[1.04] font-normal text-balance"
      >
        Be first to experience{" "}
        <em className="text-terra-soft font-turn italic">Yuvoy.</em>
      </h2>
      <p className="text-cream/70 mt-6 max-w-md text-lg leading-relaxed">
        Join the waitlist and we will contact you when the first experiences for
        your destination are ready.
      </p>

      <FaqAccordion items={WAITLIST_FAQS} tone="ink" className="mt-12" />
    </>
  );
}
