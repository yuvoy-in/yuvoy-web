import { FaqAccordion } from "@/components/site/faq-accordion";
import { OPERATOR_FAQS } from "@/lib/site/faqs";

/**
 * The application, narrated. Rendered by LeadForms as the left column of the
 * operators page's closing section — the same shape the homepage uses for the
 * waitlist (`JoinAside`).
 *
 * Contract: this component owns the section's heading and must render an
 * element with `id="apply-heading"` — the LeadForms section points its
 * `aria-labelledby` at it.
 *
 * ## Why the questions moved in here (owner direction, 2026-08-07)
 *
 * They were a section of their own, immediately above the application. That
 * put an operator through "here is what you might be worried about" and then
 * "now fill this in" as two separate scrolls, which reads as a page bracing
 * for objections rather than one making an offer.
 *
 * Beside the form they are what they actually are: the things still going
 * through someone's head *while* they apply. It is also how the homepage has
 * always closed, so the two audiences now meet the same gesture — the ask on
 * the right, and the honest answers beside it.
 *
 * Truthfulness rules apply in full — no rates, no guarantees, no dates.
 */
export function ApplyAside() {
  return (
    <>
      <p className="eyebrow text-terra-soft">Applying</p>
      <h2
        id="apply-heading"
        className="font-display tracking-display mt-6 text-[clamp(2.125rem,5vw,3.375rem)] leading-[1.04] font-normal text-balance"
      >
        Apply as a{" "}
        <em className="text-terra-soft font-turn italic">founding operator.</em>
      </h2>
      <p className="text-cream/70 mt-6 max-w-md text-lg leading-relaxed">
        Tell us who you are, where you operate and what you offer. A member of
        the team reads it and comes back to you directly.
      </p>

      <FaqAccordion items={OPERATOR_FAQS} tone="ink" className="mt-12" />
    </>
  );
}
