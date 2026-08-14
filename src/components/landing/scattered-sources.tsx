import type { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

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
  /** Our own photography, for the two cards that stand for footage. */
  frame?: string;
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
    frame: "/photography/diving-water.webp",
    at: { "--x": "0%", "--y": "0%", "--w": "57%", "--r": "-4deg" },
  },
  {
    place: "Google",
    gives: "Ten blue links",
    icon: "links",
    at: { "--x": "53%", "--y": "2%", "--w": "47%", "--r": "3deg" },
  },
  {
    place: "YouTube",
    gives: "Vlogs from 2019",
    icon: "dated",
    frame: "/photography/local-unexpected.webp",
    at: { "--x": "0%", "--y": "37%", "--w": "55%", "--r": "-3deg" },
  },
  {
    place: "Tripadvisor",
    gives: "Verdicts, no video",
    icon: "noVideo",
    at: { "--x": "51%", "--y": "39%", "--w": "49%", "--r": "2deg" },
  },
  {
    place: "WhatsApp",
    gives: "A number, if you ask",
    icon: "ask",
    at: { "--x": "0%", "--y": "74%", "--w": "53%", "--r": "-2deg" },
  },
  {
    place: "The hotel site",
    gives: "Whoever may know",
    icon: "unknown",
    at: { "--x": "49%", "--y": "76%", "--w": "51%", "--r": "3deg" },
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

/** What the hunt leaves you holding. The one real list here. */
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
    <svg viewBox="0 0 24 24" aria-hidden className="text-terra-deep size-5">
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
    <div className="flex flex-col">
      {/*
        The scatter. `pb-2` at every width and the `lg` canvas height in
        globals.css are the room the angles need: a turned card reaches
        outside the box its layout occupies, and without that room a corner
        clips and a shadow is cut in half.
      */}
      <div aria-hidden className="hunt-scatter relative pb-2 select-none">
        {SOURCES.map((source) => (
          <article
            key={source.place}
            style={source.at}
            className="border-cream-line bg-cream card-lift rounded-lg border p-3.5 sm:p-4"
          >
            {/*
              The icon sits ABOVE the words wherever the card is narrow, and
              beside them only at `sm`-`md` where the left column runs the
              full page.

              An icon tile plus its gap costs 42px. In the 166px cell a phone
              grid leaves, and again in the ~175px card the `lg` scatter
              leaves inside a 362px column, that is more than the words can
              spare — "A number, if you ask" and "Verdicts, no video" both
              truncated. Stacked, the words get the card's whole width.
            */}
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-2.5 lg:flex-col lg:items-start lg:gap-2">
              <span className="bg-cream-deep rounded-edge flex size-8 flex-none items-center justify-center">
                <ShortfallIcon kind={source.icon} />
              </span>
              <span className="min-w-0">
                <span className="text-forest block truncate text-sm font-bold sm:text-base">
                  {source.place}
                </span>
                <span className="text-forest/70 block truncate text-xs sm:text-sm">
                  {source.gives}
                </span>
              </span>
            </div>

            {/*
              The picture and the filler bars are `sm` and up.

              In the 166px cell a two-column grid leaves at 390px, a
              photograph is a postage stamp: it adds a third of the card's
              height and nothing a reader can use, and the phone's problem
              here is length (owner direction, 2026-08-15). The cards keep
              their icon, their name and their shortfall, which is the whole
              argument; the pictures live where they are big enough to read.
            */}
            {source.frame ? (
              <span className="rounded-edge relative mt-3 hidden h-20 overflow-hidden sm:block">
                <Image
                  src={source.frame}
                  alt=""
                  fill
                  quality={75}
                  sizes="(min-width: 1024px) 240px, 45vw"
                  /* Dimmed and desaturated: at full strength these were the
                     brightest thing in the act, which inverts the argument —
                     the "without" half cannot look better than the product
                     beside it. Pulled back they read as glimpses. */
                  className="object-cover opacity-90 saturate-[0.65]"
                />
                <span aria-hidden className="plate-wash absolute inset-0" />
              </span>
            ) : (
              /* The cards with no footage get the comp's own filler: a few
                 bars of nothing, or a row of markers still loading. */
              <span className="mt-3 hidden flex-col gap-1.5 sm:flex">
                {[100, 82, 91].map((width) => (
                  <span
                    key={width}
                    className="bg-forest/10 block h-1.5"
                    style={{ width: `${width}%` }}
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
        className="border-cream-line bg-cream card-lift mt-6 rounded-lg border px-4 py-4 select-none sm:px-5"
      >
        <div className="text-forest/75 flex items-baseline justify-between gap-3 pb-2">
          <span className="label min-w-0 truncate text-[10px]">
            The shortlist
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
            key={row.name}
            className="border-cream-line flex items-center justify-between gap-3 border-t py-2.5"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="rounded-edge relative size-8 flex-none overflow-hidden">
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
                  className="text-terra-deep w-12 text-center text-sm font-bold sm:w-16 lg:w-12"
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
        <p className="text-forest/75 border-cream-line mt-1 flex items-start gap-3 border-t pt-3.5 text-sm leading-relaxed">
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="text-terra-deep mt-0.5 size-4 flex-none"
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
          feeling, and this is what they add up to. */}
      <ul className="mt-5 flex flex-wrap gap-2">
        {COSTS.map((cost) => (
          <li
            key={cost}
            className={cn(
              "border-cream-line text-forest/75 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs sm:text-sm",
            )}
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
