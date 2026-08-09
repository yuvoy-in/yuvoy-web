import { FaqAccordion } from "@/components/site/faq-accordion";
import { AUDIENCE_COPY } from "@/lib/site/audiences";

/**
 * The ask, narrated. Rendered by LeadForms as the left column of the
 * homepage registration section.
 *
 * Contract: this component owns the section's heading and must render an
 * element with `id="register-heading"` — the LeadForms section points its
 * aria-labelledby at it.
 *
 * ## The words are not written here
 *
 * They come from `AUDIENCE_COPY.traveller` (2026-08-07), which is also what
 * the `/waitlist` traveller tab and that route's `<title>` read. The same ask
 * appears on two pages, and it used to be typed into both — this is the file
 * that stopped one of them drifting.
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
  const copy = AUDIENCE_COPY.traveller;

  return (
    <>
      <p className="eyebrow text-terra-soft">{copy.eyebrow}</p>
      <h2
        id="register-heading"
        className="font-display tracking-display mt-4 text-[clamp(2.125rem,5vw,3.375rem)] leading-[1.04] font-normal text-balance sm:mt-6"
      >
        {copy.title}{" "}
        <em className="text-terra-soft font-turn italic">{copy.accent}</em>
      </h2>
      <p className="text-cream/70 mt-5 max-w-md leading-relaxed sm:mt-6 sm:text-lg">
        {copy.lede}
      </p>

      <FaqAccordion items={copy.faqs} tone="ink" className="mt-10 sm:mt-12" />
    </>
  );
}
