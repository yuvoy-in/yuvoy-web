/**
 * The hunt, as one object: a sheet of notes on a small pile of others.
 *
 * ## Why one sheet
 *
 * This is the left half of a two-sided act and the right half is a single
 * clean device. The left has to answer it with a single thing — the argument
 * is *one tidy object against one untidy one*, and it only lands if both
 * sides read as objects rather than as regions of a page.
 *
 * Four earlier versions failed on that. A bordered panel of bordered cards; a
 * ruled two-column index; a grid of cards over a table over a row of chips
 * (three stacked widgets, correctly called generic); and a fan of six
 * overlapping strips. The fan was the right instinct and the wrong mechanism:
 * a sheet turned three degrees dips about nine pixels at its corner, so the
 * sheet in front covered the line on the sheet behind it, and no combination
 * of padding and angle fixed that without flattening the effect it existed
 * for.
 *
 * So the pile is suggested rather than enumerated: two blank sheets sit
 * behind the one you are reading. That is what a pile actually looks like
 * from the front — you see the top sheet and the edges of the ones under it —
 * and it costs nothing in legibility, because nothing is written on the
 * sheets that are covered.
 *
 * ## Proportion is the point
 *
 * The sheet is sized to sit beside the preview phone as its equal (owner
 * direction, 2026-08-14): a document of roughly the phone's height, on the
 * same baseline, so the two halves of the act balance instead of one
 * sprawling past the other.
 *
 * ## What was dropped from the owner's comp, and why
 *
 * - **The product logos.** Reportage, not endorsement: someone else's
 *   trademark and brand colours do not belong on a page that is otherwise
 *   three tokens.
 * - **The card thumbnails.** They made every card a different height and
 *   turned a document back into a grid of tiles.
 * - **The four chips.** Folded into the caption line under the sheet — a row
 *   of small bordered boxes reads as a component library, not as a page.
 *
 * Everything on the sheet is `aria-hidden` illustration. The caption under it
 * is the content, and the heading and lede beside it carry the argument.
 */

/** Six places, in the order a person actually tries them, and what each returns. */
const SOURCES = [
  ["Instagram", "Clips, no prices"],
  ["Google", "Ten blue links"],
  ["YouTube", "Vlogs from 2019"],
  ["Tripadvisor", "Verdicts, no video"],
  ["WhatsApp", "A number, if you ask"],
  ["The hotel desk", "Whoever they know"],
];

/** The comparison every traveller starts and nobody finishes. */
const SHORTLIST = {
  columns: ["Depth", "Level", "Worth"],
  rows: ["Nemo Reef", "Lighthouse", "Mangrove Wall"],
};

/** What the hunt leaves you holding. The one line here that is real content. */
const COSTS = [
  "Scattered sources",
  "Uncertain choices",
  "Hard to compare",
  "Hours of guesswork",
];

export function ScatteredSources() {
  return (
    <div className="flex flex-col">
      {/*
        `px-1.5 pb-3` is structural: the sheets underneath are turned, and a
        turned corner reaches outside the box its layout occupies. This is the
        room it reaches into, so no corner is clipped and no shadow is halved.
      */}
      <div aria-hidden className="relative px-1.5 pb-3 select-none">
        {/*
          The pile, suggested. Two blank sheets on the same box as the one in
          front, turned the other way, so only their edges show. Nothing is
          written on them, so nothing can be covered — which is the whole
          reason the readable content lives on exactly one sheet.
        */}
        <span className="border-cream-line bg-cream-deep/70 rounded-edge card-lift absolute inset-0 rotate-3 border" />
        <span className="border-cream-line bg-cream-deep rounded-edge card-lift absolute inset-0 -rotate-2 border" />

        {/*
          The sheet you are reading. `cream` against the tinted stock behind
          it — the page's own paper on top of the pile — which separates it
          without a heavier rule or a third shadow.
        */}
        <div className="border-cream-line bg-cream rounded-edge card-lift relative -rotate-1 border px-5 py-4 sm:px-6 sm:py-5">
          <p className="label text-forest/75 flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate">Where people look</span>
            {/* `terra-deep`, not `terra`. The accent at label size on cream
                is the exact case design system §1 rules on: `terra` is 3.24:1
                and clears AA for large text only, so at 12px it is a
                violation — axe caught this one. `terra-deep` is 5.21:1 and is
                the rung for accent text at any size on this surface. */}
            <span aria-hidden className="text-terra-deep flex-none">
              Six places
            </span>
          </p>

          <ul className="divide-cream-line border-cream-line mt-3 divide-y border-t">
            {SOURCES.map(([place, gives]) => (
              <li
                key={place}
                className="flex items-baseline justify-between gap-3 py-2.5"
              >
                <span className="text-forest flex-none text-sm font-bold sm:text-base">
                  {place}
                </span>
                <span className="text-forest/70 min-w-0 truncate text-xs sm:text-sm">
                  {gives}
                </span>
              </li>
            ))}
          </ul>

          {/*
            The table you tried to build from all of it. Every cell is a
            question mark on purpose: inventing depths and levels would be the
            fabrication the page confines to the preview surface, and the
            unknowns ARE the point.

            The cells are narrow where the column is narrow — on a phone, and
            again at `lg` where this drops into a 4fr track of roughly the
            same width — and wide only at the breakpoints where the left
            column runs the full page. A two-word head needs 64px at 10px with
            `tracking-label`'s 0.18em, which is what pushed an earlier version
            past the content box at 320px; one-word heads in 48px cells clear
            it at every width.
          */}
          <div className="mt-5">
            <div className="text-forest/75 flex items-baseline justify-between gap-3 pb-2">
              <span className="label min-w-0 truncate text-[10px]">
                Shortlist
              </span>
              <span className="flex gap-2 sm:gap-3">
                {SHORTLIST.columns.map((column) => (
                  <span
                    key={column}
                    className="label w-12 text-center text-[10px] sm:w-16 lg:w-12"
                  >
                    {column}
                  </span>
                ))}
              </span>
            </div>

            {SHORTLIST.rows.map((row) => (
              <div
                key={row}
                className="border-cream-line flex items-baseline justify-between gap-3 border-t py-2.5"
              >
                <span className="text-forest min-w-0 truncate text-sm">
                  {row}
                </span>
                <span className="flex gap-2 sm:gap-3">
                  {SHORTLIST.columns.map((column) => (
                    <span
                      key={column}
                      className="text-terra-deep w-12 text-center text-sm font-bold sm:w-16 lg:w-12"
                    >
                      ?
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* One mark, in the corner the turned sheets leave open. The pile is
            doing the work; a scattering of these would be decoration
            pretending to be an idea. */}
        <span className="text-terra/35 font-display absolute -top-2 -left-1 z-10 text-3xl leading-none">
          ?
        </span>
      </div>

      {/*
        What it costs. Middots are the brand's own separator (design system
        §2: never an em dash), so this reads as the caption under a plate,
        which is exactly what it is.
      */}
      <p className="text-forest/75 mt-4 text-sm leading-relaxed">
        {COSTS.map((cost, index) => (
          <span key={cost}>
            {index > 0 && (
              <span aria-hidden className="text-terra-deep px-1.5">
                ·
              </span>
            )}
            {cost}
          </span>
        ))}
      </p>
    </div>
  );
}
