import { AUDIENCE_COPY } from "@/lib/site/audiences";

/**
 * The application, narrated. Rendered by LeadForms as the head of the
 * operator application section — the eyebrow, the heading and the lede. The
 * questions moved to LeadForms on 2026-08-10 so they can sit below the form
 * on a phone; see JoinAside for the reasoning. Formerly the left column of the
 * operators page's closing section — the same shape the homepage uses for the
 * waitlist (`JoinAside`).
 *
 * Contract: this component owns the section's heading and must render an
 * element with `id="apply-heading"` — the LeadForms section points its
 * `aria-labelledby` at it.
 *
 * ## The words are not written here
 *
 * They come from `AUDIENCE_COPY.provider` (2026-08-07), which is also what the
 * `/waitlist` operator tab and that route's `<title>` read. An operator can
 * reach the application from either page, and both must describe the same act
 * in the same words.
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
  const copy = AUDIENCE_COPY.provider;

  return (
    <>
      <p className="eyebrow text-terra-soft">{copy.eyebrow}</p>
      <h2
        id="apply-heading"
        className="font-display tracking-display mt-4 text-[clamp(2.125rem,5vw,3.375rem)] leading-[1.04] font-normal text-balance sm:mt-6"
      >
        {copy.title}{" "}
        <em className="text-terra-soft font-turn italic">{copy.accent}</em>
      </h2>
      <p className="text-cream/70 mt-5 max-w-md leading-relaxed sm:mt-6 sm:text-lg">
        {copy.lede}
      </p>
    </>
  );
}
