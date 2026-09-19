import type { CSSProperties } from "react";
import Image from "next/image";

/**
 * The hunt: six places scattered across the column, the shortlist you tried to
 * build from them, and what the whole exercise costs.
 *
 * Built from the owner's comp (2026-08-15), with four decisions taken with the
 * owner rather than for them:
 *
 * - **No brand logos.** The comp carries the real Instagram, Google, YouTube,
 *   Tripadvisor and WhatsApp marks. Dropped by owner direction: each card
 *   takes a drawn icon of its SHORTFALL instead — a struck-through price tag,
 *   a stack of links, a rewound clock — which says more than a logo did,
 *   because the logo said "here is a brand" and the icon says "here is what
 *   you did not get". One family, one stroke weight, one accent.
 * - **Our own photography** in the two cards that show footage and in the
 *   shortlist rows, rather than the comp's stock frames.
 * - **Six, not four.** The comp's note read "Four sources" above six cards.
 * - **"The hotel site"**, the comp's wording.
 *
 * ## The one thing that could not be matched, and why
 *
 * The comp draws its left half about 700px wide. In the live layout that
 * column is **362px at every desktop size** — `max-w-page` is 70rem and the
 * act splits 4fr / 6fr, because the right side carries the phone AND its rail
 * side by side and an even split leaves that rail wrapping every line three
 * ways. So the comp's wide horizontal spread is reproduced as a vertical
 * one: same overlap, same angles, same character, arranged down the column
 * instead of across it. Matching the comp's geometry exactly needs the act's
 * columns rebalanced, which is a decision about the product rail.
 *
 * ## Two layouts, one DOM
 *
 * Each card carries its position, width and angle as custom properties, which
 * `.hunt-scatter` (globals.css) applies only from `lg`. Below that the same
 * cards are a two-column grid: a scatter needs width to read as a scatter, and
 * at 342px an overlapping spread is a pile of collisions.
 *
 * Everything above the cost row is `aria-hidden` illustration. The costs are
 * the content, and the heading and lede beside them carry the argument.
 */

type Shortfall = "noPrice" | "links" | "dated" | "noVideo" | "ask" | "unknown";

/**
 * A card's placement at `lg`, carried as custom properties.
 *
 * `CSSProperties` has no index signature for `--*`, so a bare object literal
 * of them is a type error rather than a widening. Declared here once instead
 * of cast at each call site — a cast would also silence a genuine typo in a
 * property name, which is exactly the mistake this shape invites.
 */
type Placement = CSSProperties & Record<`--${string}`, string>;

interface Source {
  place: string;
  gives: string;
  icon: Shortfall;
  /**
   * What fills the card under its label, per the owner's comp: a frame of our
   * photography, the bars of a results page, a row of markers still loading,
   * or nothing at all. Two of the six carry nothing on purpose — a card with
   * filler under every label reads as a template.
   */
  media?:
    | {
        kind: "photo";
        frame: string;
        /**
         * Lays a play badge over the frame. Set on the card whose shortfall
         * is that the footage is OLD, not that there is none — the badge says
         * "this is a video" so the shortfall beside it can say what is wrong
         * with it (owner direction, 2026-08-15).
         */
        play?: boolean;
      }
    | { kind: "bars" }
    | { kind: "dots" };
  /**
   * Placement at `lg`: left, top, width, angle. Ignored below it.
   *
   * Every pair overlaps by about six percent of the column — enough to read
   * as a scatter, little enough that the card in front lands on the card
   * behind's PICTURE rather than its words. The first cut overlapped by
   * twelve and clipped "Vlogs from 2019" and "A number, if you ask"; a card
   * on top of another card's text is not a scatter, it is a bug.
   */
  at: Placement;
}

const SOURCES: Source[] = [
  {
    place: "Instagram",
    gives: "Clips, no prices",
    icon: "noPrice",
    media: { kind: "photo", frame: "/photography/diving-water.webp" },
    at: { "--x": "0%", "--y": "0%", "--w": "34%", "--r": "-5deg" },
  },
  {
    place: "Google",
    gives: "Ten blue links",
    icon: "links",
    media: { kind: "bars" },
    at: { "--x": "33%", "--y": "5%", "--w": "34%", "--r": "3deg" },
  },
  {
    place: "YouTube",
    gives: "Vlogs from 2019",
    icon: "dated",
    media: {
      kind: "photo",
      frame: "/photography/local-unexpected.webp",
      play: true,
    },
    at: { "--x": "66%", "--y": "0%", "--w": "34%", "--r": "-2deg" },
  },
  {
    place: "Tripadvisor",
    gives: "Verdicts, no video",
    icon: "noVideo",
    media: { kind: "dots" },
    at: { "--x": "2.3%", "--y": "56%", "--w": "30%", "--r": "3deg" },
  },
  {
    place: "WhatsApp",
    gives: "A number, if you ask",
    icon: "ask",
    at: { "--x": "35.5%", "--y": "61%", "--w": "29%", "--r": "-3deg" },
  },
  {
    place: "The hotel site",
    gives: "Whoever may know",
    icon: "unknown",
    at: { "--x": "68%", "--y": "55%", "--w": "30.3%", "--r": "2deg" },
  },
];

/** The comparison every traveller starts and nobody finishes. */
const SHORTLIST = {
  columns: ["Depth", "Level", "Worth"],
  rows: [
    { name: "Nemo Reef", frame: "/photography/diving-water.webp" },
    { name: "Lighthouse", frame: "/photography/neil.webp" },
    { name: "Mangrove Wall", frame: "/photography/havelock.webp" },
  ],
};

/**
 * What the hunt leaves you holding. The one real list here.
 *
 * All FOUR of the comp's phrases, two to a line (owner direction,
 * 2026-08-15). They ran as three for a day because the brief then was one
 * line: four phrases totalling 67 characters need 463px at 12px against the
 * 362px this column has at `lg`, which is past legible before it is past the
 * edge, so "Scattered sources" was cut as the only one the lede above already
 * says. Two lines cost 28px and buy the phrase back, which is the better
 * trade — and they are what let the row grow from 10px type in 6px of padding
 * to something that reads as a chip rather than a footnote.
 *
 * The two-and-two break is arithmetic, not luck: the widest pair comes to
 * 292px of the 362 available and any three to 436, so the row cannot wrap
 * three-and-one at any desktop width. Anything that widens a chip — longer
 * copy, more padding, a bigger mark — has to be checked against those two
 * numbers.
 */
const COSTS = [
  "Scattered sources",
  "Uncertain choices",
  "Hard to compare",
  "Hours of guesswork",
];

/**
 * The shortfall icons — what that place did NOT give you.
 *
 * Authored rather than borrowed, one family: a 24 box, 1.6 stroke, square
 * caps, drawn on the same grid so six of them read as one set. They replace
 * the comp's brand marks (owner direction), and they carry more meaning than
 * the marks did: a logo says which app, and the whole point of the section is
 * what every app leaves out.
 */
function ShortfallIcon({ kind }: { kind: Shortfall }) {
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "square" as const,
    fill: "none",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="text-terra-deep size-4.5 sm:size-5 lg:size-4.5"
    >
      {kind === "noPrice" && (
        <>
          <path d="M4 12.5 11.5 5H19v7.5L11.5 20 4 12.5Z" {...stroke} />
          <circle cx="15" cy="9" r="1.3" fill="currentColor" />
          <path d="M3 21 21 3" {...stroke} />
        </>
      )}
      {kind === "links" && (
        <>
          <path d="M4 6h16M4 11h13M4 16h16M4 21h9" {...stroke} />
        </>
      )}
      {kind === "dated" && (
        <>
          <circle cx="12" cy="13" r="8" {...stroke} />
          <path d="M12 8.5V13l3 2" {...stroke} />
          <path d="M4 6.5 6.5 4v5H1.5" {...stroke} />
        </>
      )}
      {kind === "noVideo" && (
        <>
          <rect x="3" y="6" width="18" height="12" rx="1" {...stroke} />
          <path d="M10 10.5 14.5 12 10 13.5Z" fill="currentColor" />
          <path d="M3 21 21 3" {...stroke} />
        </>
      )}
      {kind === "ask" && (
        <>
          <path d="M4 5h16v11H12l-5 4v-4H4V5Z" {...stroke} />
          <path d="M10 8.6a2 2 0 1 1 2 2.4v1" {...stroke} />
          <circle cx="12" cy="13.8" r="0.9" fill="currentColor" />
        </>
      )}
      {kind === "unknown" && (
        <>
          <path d="M4 21V4h9v17M13 21V9h7v12M2 21h20" {...stroke} />
          <path d="M6.6 8.2a1.7 1.7 0 1 1 1.7 2v.9" {...stroke} />
          <circle cx="8.3" cy="13.4" r="0.85" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

export function ScatteredSources() {
  return (
    /*
      `h-full` + `justify-between` from `lg`, and neither below it.

      Side by side, the two halves of the act share a grid row, so the row is
      as tall as the taller of them — the product preview — and anything the
      left half does not use is dead space under it. Measured at 1440 that was
      94px of the 615 (owner report, 2026-08-15).

      Spreading the three blocks to fill it is self-correcting: whatever the
      preview's height turns out to be, the scatter, the shortlist and the
      costs distribute themselves across it, so this cannot silently
      re-open the gap when either side changes.

      Below `lg` the halves are stacked in one column and there is no row to
      fill — spreading there would just be a long block with holes in it, so
      the phone keeps the compact rhythm it was tuned to.
    */
    <div className="flex flex-col lg:h-full lg:justify-between">
      {/*
        The scatter. `pb-2` at every width and the `lg` canvas height in
        globals.css are the room the angles need: a turned card reaches
        outside the box its layout occupies, and without that room a corner
        clips and a shadow is cut in half.
      */}
      <div aria-hidden className="hunt-scatter relative pb-2 select-none">
        {/*
          The comp's dashed arcs and question marks — the search doubling back
          on itself between one place and the next.

          `lg` only, and drawn in the scatter's own pixel space rather than in
          percentages: the left column is a fixed 362px from that breakpoint,
          so a viewBox in real units scales without distorting the dash
          pattern, which stretching to a percentage box would. Below `lg` the
          cards are a grid and there is nothing for an arc to connect.

          Behind everything (`-z-10` against the cards' own stacking) and
          inert. `terra` at low opacity: this is decoration, and fills are
          exempt from the contrast floors that govern text.
        */}
        <svg
          viewBox="0 0 362 312"
          fill="none"
          className="text-terra pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
        >
          {/*
            Drawn onto the cards' measured edges at `lg`, where the column is
            a fixed 362px and this box is 312 tall — the viewBox must equal
            that or every path is stretched and nothing lines up, which is
            exactly what a stale 272 did.

            Three connectors, each joining the card above to the card below
            it, and the question sits ON the middle one: Google leads to a
            question, the question leads to WhatsApp. Re-measure the card
            rects before moving any of these.
          */}
          <g
            stroke="currentColor"
            strokeWidth="1.25"
            strokeDasharray="5 6"
            opacity="0.34"
          >
            <path d="M62 157C54 162 51 167 55 172" />
            <path d="M180 143C175 149 174 152 177 155" />
            <path d="M179 177C180 181 180 184 181 188" />
            <path d="M300 154C295 159 296 165 300 170" />
          </g>
          <g
            stroke="currentColor"
            strokeWidth="1.25"
            strokeDasharray="4 5"
            opacity="0.4"
          >
            <circle cx="178" cy="166" r="11" />
          </g>
          <g fill="currentColor" opacity="0.55">
            <text
              x="178"
              y="171"
              textAnchor="middle"
              fontSize="13"
              fontWeight="500"
            >
              ?
            </text>
          </g>
        </svg>

        {SOURCES.map((source) => (
          <article
            key={source.place}
            style={source.at}
            /*
              `flex-col justify-center` so the content sits in the MIDDLE of
              the card rather than at the top of it. Grid items stretch, so
              the shorter of two cards sharing a row is as tall as the taller
              one; as a plain block its content stayed at the top and all the
              slack fell to the bottom (owner report, 2026-08-15). At `lg`
              the cards are absolutely positioned and size to their content,
              where centring a box inside itself changes nothing.
            */
            className="border-paper-line bg-paper card-lift flex flex-col justify-center rounded-lg border p-3.5 sm:p-4 lg:p-3"
          >
            {/*
              The icon sits BESIDE the words everywhere except `lg`.

              It used to stack them on a phone, to give the words the card's
              whole width: an icon tile plus its gap cost 42px of the 138px a
              166px cell leaves inside its padding, and "A number, if you ask"
              truncated. Beside them is shorter — the tallest card goes from
              104px to about 76 — and shorter is the whole brief on a phone
              (owner direction, 2026-08-15), so the width is bought back
              instead: the tile drops to the 28px it already uses at `lg`, the
              gap to 8, and the words WRAP rather than truncate. A second line
              costs 16px; the stack cost 36.

              `lg` is the exception because the card is ~175px wide there
              inside a 362px column and there is no second line to spend —
              the scatter's height is fixed by the canvas it sits in.
            */}
            {/* `items-center`: the icon takes the same air above it as below
                (owner report, 2026-08-15 — top-aligned, a 28px tile beside a
                36px block of words left all 8px of the difference under the
                icon and none over it). On the cards whose shortfall runs to a
                second line the icon centres against three lines rather than
                two, which is the trade: an icon that sits level with its own
                words beats six icons at one height with air under each. */}
            <div className="flex items-center gap-2 sm:gap-2.5 lg:flex-col lg:items-start lg:gap-1.5">
              <span className="bg-paper-deep rounded-edge flex size-7 flex-none items-center justify-center sm:size-8 lg:size-7">
                <ShortfallIcon kind={source.icon} />
              </span>
              <span className="min-w-0 lg:w-full">
                <span className="text-forest block text-sm font-bold sm:text-base lg:text-sm">
                  {source.place}
                </span>
                <span className="text-forest/70 block text-xs sm:text-sm lg:text-xs">
                  {source.gives}
                </span>
              </span>
            </div>

            {/*
              The fill is `sm` and up. In the 166px cell a two-column grid
              leaves at 390px a photograph is a postage stamp: it costs a
              third of the card's height and tells the reader nothing, and
              the phone's problem here is length (owner direction). The cards
              keep their icon, their name and their shortfall, which is the
              whole argument.
            */}
            {source.media?.kind === "photo" && (
              <span className="rounded-edge relative mt-3 hidden h-20 overflow-hidden sm:block lg:mt-2 lg:h-12">
                <Image
                  src={source.media.frame}
                  alt=""
                  fill
                  quality={75}
                  sizes="(min-width: 1024px) 150px, 45vw"
                  /* Dimmed and desaturated: at full strength these were the
                     brightest thing in the act, which inverts the argument —
                     the "without" half cannot look better than the product
                     beside it. Pulled back they read as glimpses. */
                  className="object-cover opacity-90 saturate-[0.65]"
                />
                <span aria-hidden className="plate-wash absolute inset-0" />

                {/* The play badge, in the pause control's clothes: a forest
                    square at 70% with a paper mark, `rounded-edge` like every
                    other box in the system. It is deliberately small — this is
                    a still of a video, not a player, and a badge that fills
                    the frame turns the card into a thumbnail of itself. */}
                {source.media.play && (
                  <span className="bg-forest/70 text-paper rounded-edge absolute top-1/2 left-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center backdrop-blur-[1px] lg:size-5">
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="size-2.5 lg:size-2"
                    >
                      <path d="M5.2 3.2v9.6L13 8 5.2 3.2z" />
                    </svg>
                  </span>
                )}
              </span>
            )}

            {source.media?.kind === "bars" && (
              <span className="mt-3 hidden flex-col gap-1.5 sm:flex lg:mt-2 lg:gap-1">
                {[100, 82, 91].map((width) => (
                  <span
                    key={width}
                    className="bg-forest/10 block h-1.5 lg:h-1"
                    style={{ width: `${width}%` }}
                  />
                ))}
              </span>
            )}

            {/* One row of markers, not three bars: a verdict page is a row of
                scores still loading, and the comp draws it that way. */}
            {source.media?.kind === "dots" && (
              <span className="mt-3 hidden items-center gap-1.5 sm:flex lg:mt-2">
                {[0, 1, 2, 3].map((dot) => (
                  <span
                    key={dot}
                    className="bg-forest/15 block size-2 lg:size-1.5"
                  />
                ))}
              </span>
            )}
          </article>
        ))}
      </div>

      {/*
        The shortlist, on its own card. Every cell is a question mark on
        purpose: inventing depths and levels would be the fabrication the page
        confines to the preview surface, and the unknowns ARE the point.

        Column cells are narrow where the column is narrow — on a phone, and
        again at `lg` where this sits in a 362px track — and wide only at the
        breakpoints where the left column runs the full page. A two-word head
        needs 64px at 10px with `tracking-label`'s 0.18em, which is what
        pushed an earlier version past the content box at 320px.
      */}
      <div
        aria-hidden
        className="border-paper-line bg-paper card-lift mt-5 rounded-lg border px-3.5 py-3 select-none sm:px-4 sm:py-3.5 lg:mt-3 lg:px-3 lg:py-2.5"
      >
        <div className="text-forest/75 flex items-baseline justify-between gap-3 pb-2">
          <span className="label min-w-0 truncate text-[10px]">
            The shortlist
          </span>
          <span className="flex gap-2 sm:gap-3">
            {SHORTLIST.columns.map((column) => (
              <span
                key={column}
                className="label w-11 text-center text-[10px] sm:w-16 lg:w-12"
              >
                {column}
              </span>
            ))}
          </span>
        </div>

        {SHORTLIST.rows.map((row) => (
          <div
            key={row.name}
            className="border-paper-line flex items-center justify-between gap-2.5 border-t py-2 lg:py-1.5"
          >
            <span className="flex min-w-0 items-center gap-2 sm:gap-2.5">
              <span className="rounded-edge relative hidden size-7 flex-none overflow-hidden sm:block lg:size-6">
                <Image
                  src={row.frame}
                  alt=""
                  fill
                  quality={75}
                  sizes="32px"
                  className="object-cover saturate-[0.7]"
                />
                <span aria-hidden className="plate-wash absolute inset-0" />
              </span>
              <span className="text-forest min-w-0 truncate text-sm">
                {row.name}
              </span>
            </span>
            <span className="flex gap-2 sm:gap-3">
              {SHORTLIST.columns.map((column) => (
                <span
                  key={column}
                  className="text-terra-deep w-11 text-center text-sm font-bold sm:w-16 lg:w-12"
                >
                  ?
                </span>
              ))}
            </span>
          </div>
        ))}

        {/* The comp's closing note. It counts what is actually drawn — six
            cards, three shortlisted rows — where the comp said "four"; change
            either list and this number moves with it. */}
        <p className="text-forest/75 border-paper-line mt-1 flex items-start gap-2.5 border-t pt-3 text-xs leading-relaxed sm:text-sm lg:pt-2.5 lg:text-[0.6875rem]">
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="text-terra-deep mt-0.5 size-3.5 flex-none"
          >
            <circle
              cx="12"
              cy="12"
              r="9.5"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
            />
            <path
              d="M12 11v6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="square"
            />
            <circle cx="12" cy="7.6" r="1.1" fill="currentColor" />
          </svg>
          Six sources, three answers, and no way to tell which one was worth
          your time.
        </p>
      </div>

      {/* What it costs, as the comp's four chips. The one part of this block
          exposed to assistive tech: the cards and the table are drawings of a
          feeling, and this is what they add up to.

          A two-column GRID, not a wrapping row. Wrapping put two chips on each
          line, but each chip took its own text's width, so the four ended up
          four different sizes and the pairs did not line up under each other
          (owner report, 2026-08-15). Equal columns fix that by construction:
          both track to the widest phrase, "Hours of guesswork", and the other
          three match it rather than trailing it.

          `w-fit` + `mx-auto` is what keeps the block centred without letting
          it stretch — `fit-content` takes the two columns' width and no more,
          and it is clamped by the space available, so below the supported
          360px floor the columns shrink and a phrase wraps instead of
          overflowing the column. */}
      <ul className="mx-auto mt-5 grid w-fit grid-cols-2 gap-2 lg:mt-3 lg:gap-1.5">
        {COSTS.map((cost) => (
          <li
            key={cost}
            /*
              `lg` was the tightest of the three sizes while the row had to
              fit one line in a 362px column — 10px type in 6px of padding,
              which read as a footnote rather than a chip. Two lines lifted
              that constraint (owner direction, 2026-08-15), so it steps up to
              12px type and 10px of padding: measured there, the widest pair
              is 292px against the 362 available and any three would be 436,
              so the two-and-two break is guaranteed rather than lucky.
            */
            className="border-paper-line text-forest/75 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-center text-xs sm:text-sm lg:gap-1.5 lg:px-2.5 lg:py-1.5 lg:text-xs"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="text-terra-deep size-3.5 flex-none"
            >
              <circle
                cx="12"
                cy="12"
                r="9.5"
                stroke="currentColor"
                strokeWidth="1.7"
                fill="none"
              />
              <path
                d="M12 7v6"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="square"
              />
              <circle cx="12" cy="16.6" r="1.15" fill="currentColor" />
            </svg>
            {cost}
          </li>
        ))}
      </ul>
    </div>
  );
}
