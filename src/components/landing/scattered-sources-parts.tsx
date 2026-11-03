/**
 * The hunt's cards, shortlist, costs and shortfall icons, drawn by
 * `ScatteredSources` (scattered-sources.tsx).
 */
import type { CSSProperties } from "react";

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

export const SOURCES: Source[] = [
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
export const SHORTLIST = {
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
export const COSTS = [
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
export function ShortfallIcon({ kind }: { kind: Shortfall }) {
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
