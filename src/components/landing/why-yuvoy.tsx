import { Section, SectionHeading } from "@/components/ui/section";
import { ProductDemo } from "@/components/landing/product-demo";
import { Wordmark } from "@/components/brand/wordmark";

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
 * The left panel is reportage, and it is built like the artefact it
 * describes: a strip of open tabs, then the comparison that never resolves.
 * Real product names, no logos, no invented ratings, no colour from outside
 * the palette. Those two parts are illustration and are aria-hidden; the
 * cost list below them is real content and carries the meaning for
 * assistive tech. Nothing here may use the words the homepage truthfulness
 * guard bans outside the preview.
 *
 * The section keeps the id `how`: the cover's "How it works" button lands
 * here, and this is now the section that shows it.
 */

/**
 * The improvised stack every traveller actually uses, and what each one leaves
 * them holding. Real product names, no logos: this is reportage, not
 * endorsement, and every line is literally true of that source today.
 *
 * This is the section's argument, so it is **real content** — not the
 * `aria-hidden` illustration it used to be. See the note on the index below.
 */
const SOURCES = [
  { name: "Instagram", note: "Clips, no prices" },
  { name: "Google", note: "Ten blue links" },
  { name: "YouTube", note: "Vlogs from 2019" },
  { name: "Tripadvisor", note: "Verdicts, no video" },
  { name: "WhatsApp", note: "A number, if you ask" },
  { name: "The hotel desk", note: "Whoever they know" },
];

export function WhyYuvoy() {
  return (
    /*
      No bottom rule any more. It existed because two cream sections met
      here and the join needed drawing; since 2026-08-07 the act below is
      forest, so the tone change does that work and a hairline on top of it
      would just be a line for its own sake.
    */
    <Section id="how" aria-labelledby="why-heading">
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
          <p className="label text-forest/75">Without Yuvoy</p>
          <p className="font-display tracking-display mt-3 text-2xl leading-snug text-balance">
            Too many places. Too much guesswork.
          </p>
        </div>

        {/* ----------------------------------------- without Yuvoy · index */}
        {/*
          The hunt as a ruled index, not as a panel of cards.

          ## Why this stopped being a card (2026-08-10)

          It was a bordered, tinted, rounded panel containing a grid of six
          bordered cards and a mocked comparison table — a box of boxes, which
          is the one structure this site's design law names and rejects
          outright: "a plain list on a rule, not three bordered cards; boxes
          inside a box is the SaaS grid this rebuild exists to get away from"
          (design system §5, written about the operator list and true here).
          Owner report, 2026-08-10: present the concept better than "just like
          a card".

          What replaces it is the brand's own editorial language — hairlines
          doing the work boxes do elsewhere, the display face carrying the
          names, wide-tracked metadata beside them. It reads as an index in a
          printed magazine: the six places you already look, and what each one
          actually gives you. Six large names stacked IS "too many places",
          drawn by the type rather than by a container.

          ## Two things it deletes

          The mocked shortlist table has gone. It was a second drawing of the
          same idea sitting directly under the first, and its every cell was a
          question mark; the sentence at the foot of this block says what it
          was trying to say, in words, in one line. The four-item cost grid has
          gone with it for the same reason — it restated the notes on the right
          of every row.

          ## And one thing it fixes

          The old panel's two illustrations were `aria-hidden`, so a screen
          reader got the argument only through a separate cost list bolted
          underneath. Here the names and their notes are the argument, in
          text, so there is one thing to read and everybody reads the same
          thing. A `<dl>` because that is exactly the shape of the content: a
          source, and what it leaves you with.
        */}
        <div className="lg:col-start-1 lg:row-start-2">
          <dl className="border-cream-line divide-cream-line divide-y border-t border-b">
            {SOURCES.map((source) => (
              <div
                key={source.name}
                className="flex items-baseline justify-between gap-4 py-3.5 sm:py-4"
              >
                <dt className="font-display tracking-display text-forest min-w-0 text-xl leading-snug font-normal sm:text-2xl">
                  {source.name}
                </dt>
                {/* Right-aligned and quiet: this is the annotation on the
                    name, not a second column of content competing with it. */}
                <dd className="text-forest/70 shrink-0 text-right text-sm leading-snug">
                  {source.note}
                </dd>
              </div>
            ))}
          </dl>

          {/* The closing statement, carrying what the mocked table used to
              draw. Body rather than display: the section's typographic turn
              belongs to the headline, and this is the evidence under the
              index, not a second headline.

              It counts the rows above it. The line read "Four sources, three
              answers" while it sat under a mocked table of its own; directly
              beneath an index of six named places that was simply wrong, and
              the kind of wrong a reader checks. Anything added to or removed
              from SOURCES has to move this number with it. */}
          <p className="text-forest/75 mt-5 max-w-md leading-relaxed sm:mt-6">
            Six places to look, no two that agree, and no way to tell which was
            written this season.
          </p>
        </div>

        {/* The turn of the story: one arrow, chaos into flow. */}
        <div
          aria-hidden
          className="flex justify-center self-center lg:col-start-2 lg:row-span-2 lg:row-start-1"
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
