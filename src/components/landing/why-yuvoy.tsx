import { Section, SectionHeading } from "@/components/ui/section";
import { ProductDemo } from "@/components/landing/product-demo";
import { Wordmark } from "@/components/brand/wordmark";
import { ScatteredSources } from "@/components/landing/scattered-sources";
import Image from "next/image";

/**
 * The why act: the problem and the product in one frame, because they are
 * one thought. Until 2026-08-06 these were two sections, the observation
 * ("The hard part was never booking.") and the demo ("Scroll. Watch.
 * Book."); a visitor met the argument twice before seeing the point once.
 * This act shows it instead: the hunt on the left, the product running on
 * the right, one arrow between them.
 *
 * The two sides are laid out as a two-row grid rather than two stacked
 * columns: the headers share row one and the panels share row two, so the
 * labels sit on one line and both panels start and end together whatever
 * the copy does. Centring the columns against each other was what made the
 * sides read as misaligned (owner report, 2026-08-06).
 *
 * The left half lives in `ScatteredSources` — a scatter of cards, the
 * shortlist that never resolves, and what the hunt costs. It is reportage:
 * real product names, **no logos**, no invented ratings, no colour from
 * outside the palette. The cards and the table are illustration and are
 * `aria-hidden`; the cost chips are real content and carry the meaning for
 * assistive tech, together with the heading and lede above them. Nothing
 * here may use the words the homepage truthfulness guard bans outside the
 * preview. The reasoning behind every departure from the owner's comp is
 * documented in that file rather than repeated here.
 *
 * The act carries the owner's line drawing as a watermark behind everything
 * (2026-08-14). It is an alpha stencil with no ground of its own, so it
 * composites onto the cream with no seam — see
 * scripts/generate-without-yuvoy-artwork.mjs.
 *
 * The section keeps the id `how`: the cover's "How it works" button lands
 * here, and this is now the section that shows it.
 */

export function WhyYuvoy() {
  return (
    /*
      No bottom rule any more. It existed because two cream sections met
      here and the join needed drawing; since 2026-08-07 the act below is
      forest, so the tone change does that work and a hairline on top of it
      would just be a line for its own sake.
    */
    <Section
      id="how"
      aria-labelledby="why-heading"
      className="relative isolate"
    >
      {/*
        The owner's line drawing, behind everything.

        Bottom-anchored and full-bleed: the artwork is a wide horizon — headland
        and palms at the edges, water and a boat along the foot — with an empty
        sky through the middle, so the foot is the only part worth showing and
        the middle is what the section's own content sits in.

        It is an alpha stencil in `terra` with no ground of its own (see
        scripts/generate-without-yuvoy-artwork.mjs), so it composites onto the
        cream with no seam and no colour shift. At 55% it reads as watermark
        rather than illustration and leaves the body text's 11.44:1 essentially
        untouched — it is 8.7% ink at the best of times, and none of it lands
        under a paragraph.

        `-z-10` with `isolate` on the section: behind the content, and unable
        to escape into any ancestor's stacking context.

        It spans the SECTION, not the act — the foot of the drawing sits at
        the foot of the section, under the sign-off. Anchoring it to the two
        halves instead was tried on 2026-08-15 and reverted the same day
        (owner direction): the horizon wants the full height to sit in.

        It must stay a DIRECT child of the section's children, too.
        `container-page` is static, so this absolutely positioned element
        resolves against the section and is edge-to-edge for free. Giving any
        ancestor between here and the section a position takes that away and
        silently crops the drawing to the 70rem measure — which is exactly
        what happened while it lived in a wrapper.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <Image
          src="/assets/without-yuvoy-artwork.webp"
          alt=""
          width={1672}
          height={941}
          quality={75}
          sizes="100vw"
          className="absolute inset-x-0 bottom-0 h-auto w-full opacity-55"
        />
      </div>

      <SectionHeading
        id="why-heading"
        className="mx-auto text-center"
        eyebrow="Why Yuvoy"
        title="From too many tabs to"
        accent="one simple place."
        body="See the experience, understand the details, and book in one flow."
      />

      {/*
        4fr / 6fr, not an even split: the right column carries the phone and
        its rail side by side, and an even split leaves the rail about 130px
        wide at the lg breakpoint, where every line of it wraps three ways.
      */}
      <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 sm:mt-20 sm:gap-y-8 lg:grid-cols-[minmax(0,4fr)_auto_minmax(0,6fr)] lg:grid-rows-[auto_1fr] lg:gap-x-10">
        {/* ---------------------------------------- without Yuvoy · header */}
        <div className="lg:col-start-1 lg:row-start-1">
          {/* No trailing rule (owner direction, 2026-08-15). It was drawing a
              line across the top of the column that read as a divider rather
              than as part of the label. */}
          <p className="label text-forest/75">Without Yuvoy</p>
          <p className="font-display tracking-display mt-3 text-2xl leading-snug text-balance">
            Too many places. Too much guesswork.
          </p>
          <p className="text-forest/70 mt-4 max-w-sm leading-relaxed">
            Scattered sources. Confusing info. You spend hours, still not sure.
          </p>
        </div>

        {/* -------------------------------------- without Yuvoy · the pile */}
        <div className="lg:col-start-1 lg:row-start-2">
          <ScatteredSources />
        </div>

        {/* The turn of the story: one arrow, chaos into flow. */}
        <div
          aria-hidden
          className="flex justify-center self-center lg:col-start-2 lg:row-start-2"
        >
          <svg
            viewBox="0 0 56 16"
            fill="none"
            className="text-terra w-12 rotate-90 lg:w-14 lg:rotate-0"
          >
            <path d="M0 8h51" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M46 2.5L52.5 8L46 13.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ------------------------------------------- with Yuvoy · header */}
        <div className="lg:col-start-3 lg:row-start-1">
          <p className="label text-terra-deep">With Yuvoy</p>
          {/* text-2xl is 24px, which is where `terra` clears AA as large
              text, and this header sits on `cream`, never on a panel. */}
          <p className="font-display tracking-display mt-3 text-2xl leading-snug text-balance">
            Everything you need.{" "}
            <em className="text-terra font-turn italic">In one flow.</em>
          </p>
        </div>

        {/* -------------------------------------------- with Yuvoy · panel */}
        <div className="lg:col-start-3 lg:row-start-2">
          <ProductDemo />
        </div>
      </div>

      {/*
        The sign-off: the mark, then a line drawn down to the sentence it
        signs. It used to sit under a full-width rule, which reads as the
        start of the next section rather than the end of this one (owner
        report, 2026-08-06) — a hairline across the measure is a divider
        wherever it lands, so the rule that closes this act is at the very
        foot of it now, below the sentence, where it terminates rather than
        introduces.

        The connector's spacing is measured, not eyeballed. It read as
        misplaced (owner report) for three compounding reasons, all fixed
        here:

        1. The stroke used to fade in from zero opacity over its first 60%,
           so it did not become visible until a third of the way down and
           the gap above it looked far larger than the gap below. It is
           solid now — which also matches the arrow between the two panels,
           keeping one drawing in the section rather than two.
        2. The viewBox ran to 60 while the arrowhead ended at 56.25, leaving
           dead space under the tip. The box is now exactly the drawing:
           the line starts at y=0 with a butt cap, and the head's round join
           carries half a stroke width past y=27.25 to land on 28.

           The box is also 1:1 with the rendered size (16x28 units in an
           `h-7 w-4`), so the stroke is exactly 1.5px and the head keeps its
           drawn proportions at 6.75 tall by 10.5 wide. Shortening it again
           means editing the viewBox and both paths together and leaving the
           head's numbers alone — dropping the height class on its own would
           scale the whole drawing down, head and stroke with it.
        3. `leading-tight` puts roughly 8px of empty line box above the
           sentence's cap height, which no margin can see. The bottom margin
           is therefore one step short of the top (24px against 32px) so the
           two OPTICAL gaps match. Change one and change the other.
      */}
      <div className="mt-16 flex flex-col items-center text-center sm:mt-32">
        <Wordmark className="h-14 sm:h-20" />

        <svg
          viewBox="0 0 16 28"
          fill="none"
          aria-hidden
          /* The 8px asymmetry is the point, at both steps: `leading-tight`
             leaves ~8px of empty line box above the sentence's cap height
             that no margin can see, so the bottom margin is one 8px step
             short of the top and the two OPTICAL gaps match. The mobile pair
             (24/16) keeps that same 8px difference rather than scaling it —
             the dead space comes from the font's metrics, not from the
             margin, so it does not shrink with the viewport. */
          className="text-terra mt-6 mb-4 h-7 w-4 sm:mt-8 sm:mb-6"
        >
          <path d="M8 0V26" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M2.75 20.5L8 27.25L13.25 20.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p className="font-display tracking-display text-[clamp(1.75rem,4vw,2.625rem)] leading-tight text-balance">
          Less searching.{" "}
          <em className="text-terra font-turn italic">Better decisions.</em>
        </p>
      </div>
    </Section>
  );
}
