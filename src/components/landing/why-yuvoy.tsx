import { Section, SectionHeading } from "@/components/ui/section";
import { ProductDemo } from "@/components/landing/product-demo";

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
 * The improvised stack every traveller actually uses, one card each, with
 * what that source leaves you holding. Real product names and no logos: this
 * is reportage, not endorsement, and a card carries the name at a readable
 * size instead of a clipped tab strip. Six of them fill the grid exactly.
 */
const SOURCES = [
  { name: "Instagram", note: "Clips, no prices" },
  { name: "Google", note: "Ten blue links" },
  { name: "YouTube", note: "Vlogs from 2019" },
  { name: "Tripadvisor", note: "Verdicts, no video" },
  { name: "WhatsApp", note: "A number, if you ask" },
  { name: "The hotel desk", note: "Whoever they know" },
];

/** The comparison every traveller tries to build, and cannot finish. */
const COMPARE = {
  columns: ["Depth", "Level", "Worth it"],
  rows: ["Nemo Reef", "Lighthouse", "Mangrove Wall"],
};

const COSTS = [
  "Scattered sources",
  "Hard to compare",
  "Uncertain choices",
  "Hours of guesswork",
];

export function WhyYuvoy() {
  return (
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
      <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-8 sm:mt-20 lg:grid-cols-[minmax(0,4fr)_auto_minmax(0,6fr)] lg:grid-rows-[auto_1fr] lg:gap-x-10">
        {/* ---------------------------------------- without Yuvoy · header */}
        <div className="lg:col-start-1 lg:row-start-1">
          <p className="label text-forest/75">Without Yuvoy</p>
          <p className="font-display tracking-display mt-3 text-2xl leading-snug text-balance">
            Too many places. Too much guesswork.
          </p>
        </div>

        {/* ----------------------------------------- without Yuvoy · panel */}
        <div className="border-cream-line divide-cream-line bg-cream-deep rounded-edge flex flex-col divide-y border lg:col-start-1 lg:row-start-2">
          {/* The open tabs, one card each: the headline's "too many tabs",
              drawn. Six cards, six cells, so the grid reads as finished
              rather than clipped (owner report, 2026-08-06). */}
          <div aria-hidden className="p-5 select-none">
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {SOURCES.map((source) => (
                <li
                  key={source.name}
                  className="border-cream-line bg-cream rounded-edge border px-3 py-2.5"
                >
                  <span className="text-forest block truncate text-sm">
                    {source.name}
                  </span>
                  <span className="text-forest/70 mt-1 block text-xs">
                    {source.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* The comparison that never resolves. Every cell is a question
              mark on purpose: inventing depths and levels here would be the
              same fabrication the page bans, and the unknowns are the point. */}
          <div aria-hidden className="flex flex-1 flex-col p-5 select-none">
            <div className="text-forest/75 flex items-center justify-between gap-4 pb-3">
              <span className="label text-[10px]">The shortlist</span>
              <span className="flex gap-3">
                {COMPARE.columns.map((column) => (
                  <span
                    key={column}
                    className="label w-12 text-center text-[10px]"
                  >
                    {column}
                  </span>
                ))}
              </span>
            </div>

            {COMPARE.rows.map((row) => (
              <div
                key={row}
                className="border-cream-line flex items-center justify-between gap-4 border-t py-3.5"
              >
                <span className="text-forest truncate text-sm">{row}</span>
                <span className="flex gap-3">
                  {COMPARE.columns.map((column) => (
                    <span
                      key={column}
                      className="text-terra-deep w-12 text-center text-sm font-bold"
                    >
                      ?
                    </span>
                  ))}
                </span>
              </div>
            ))}

            <p className="text-forest/70 border-cream-line mt-auto border-t pt-4 text-sm leading-relaxed">
              Four sources, three answers, and no way to tell which one was
              written this season.
            </p>
          </div>

          {/* The real content of this panel: what the hunt costs. */}
          <ul className="grid grid-cols-1 gap-x-6 gap-y-3 p-5 sm:grid-cols-2">
            {COSTS.map((cost) => (
              <li
                key={cost}
                className="text-forest/75 flex items-center gap-2.5 text-sm"
              >
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className="text-terra-deep size-2.5 flex-none"
                  aria-hidden
                >
                  <path
                    d="M2 2l8 8M10 2l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                {cost}
              </li>
            ))}
          </ul>
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

      <div className="border-cream-line mt-20 border-t pt-10 text-center sm:mt-24">
        <p className="font-display tracking-display text-[clamp(1.75rem,4vw,2.625rem)] leading-tight text-balance">
          Less searching.{" "}
          <em className="text-terra font-turn italic">Better decisions.</em>
        </p>
      </div>
    </Section>
  );
}
