import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The hunt, drawn: the places you already look, the shortlist you cannot
 * finish, and what it costs you. The left half of the why act.
 *
 * ## The concept (owner comp, 2026-08-14)
 *
 * A scatter of cards — one per place, each showing what that place hands back
 * — then the comparison table every traveller tries to build, then the four
 * things the whole exercise leaves you with. The pile is the argument: six
 * near-identical cards at slightly different angles read as "too many places"
 * before a single word is read.
 *
 * ## What was adapted from the comp, and why
 *
 * - **No third-party logos.** The comp carries the real Instagram, Google,
 *   YouTube, Tripadvisor and WhatsApp marks. This file names the products and
 *   draws none of them: it is the site's standing rule (reportage, not
 *   endorsement — see the note in `why-yuvoy.tsx`), it keeps someone else's
 *   trademark and someone else's brand colours off a page that is otherwise
 *   three tokens, and the owner's instruction was to bring the comp into this
 *   theme rather than to transcribe it.
 * - **Sharp edges.** `rounded-edge` (2px), not the comp's ~12px cards. The
 *   editorial near-square is the system (design system §4); the one rounded
 *   object on the site is the preview phone.
 * - **Hairlines, not shadows.** The comp floats its cards on soft drop
 *   shadows. Here each card is a hairline on `cream-deep`, which is how every
 *   other raised surface on the site is drawn (§4), and the *rotation* does
 *   the lifting the shadows were doing.
 * - **Our photography, never a competitor's screenshot.** The comp puts real
 *   posts and real search results in the cards. The two cards that stand for
 *   footage carry OUR OWN frames, washed back with `plate-wash`; the rest are
 *   drawn from tokens (skeleton bars, a marker row). A genuine screenshot of
 *   somebody else's product is both a licensing question and exactly the fake
 *   product content the truthfulness rules confine to the preview surface.
 * - **No `rounded-full`.** The play mark and the marker row are square. Round
 *   geometry is reserved for the preview phone and the hardware inside it
 *   (§4); everything else on the site is the editorial near-square.
 *
 * ## The scatter is in flow, never absolute
 *
 * Every card is a normal grid item that is *rotated* and nudged with a
 * transform. Transforms do not affect layout, so the grid keeps its own
 * geometry at every width: nothing can overlap the section beside it, nothing
 * can spill past the container, and the whole thing reflows to two columns on
 * a phone with no positional maths to get wrong. The container carries the
 * padding the nudges need so a rotated corner cannot be clipped.
 *
 * Everything here is `aria-hidden` illustration except the cost row, which is
 * a real list. The section's argument is carried in text by the heading and
 * the lede beside it; a screen reader gets the point without being read six
 * card labels and nine question marks.
 */

interface Source {
  name: string;
  note: string;
  media?: "photo" | "links" | "video" | "dots";
  /** Our own photography, for the two cards that show footage. */
  frame?: string;
  /** Tailwind classes for this card's angle and nudge. */
  lift: string;
}

/**
 * Six places, in the order a person tries them. The angles alternate and the
 * nudges never exceed the container's padding, so the pile reads as dropped
 * rather than arranged and still cannot escape its box.
 */
const SOURCES: Source[] = [
  {
    name: "Instagram",
    note: "Clips, no prices",
    media: "photo",
    frame: "/photography/diving-water.webp",
    lift: "-rotate-3",
  },
  {
    name: "Google",
    note: "Ten blue links",
    media: "links",
    lift: "rotate-2 translate-y-2",
  },
  {
    name: "YouTube",
    note: "Vlogs from 2019",
    media: "video",
    frame: "/photography/local-unexpected.webp",
    lift: "rotate-2 -translate-y-1",
  },
  {
    name: "Tripadvisor",
    note: "Verdicts, no video",
    media: "dots",
    lift: "-rotate-2 translate-y-1",
  },
  { name: "WhatsApp", note: "A number, if you ask", lift: "-rotate-2" },
  {
    name: "The hotel desk",
    note: "Whoever they know",
    lift: "rotate-3 -translate-y-1",
  },
];

/** The comparison every traveller starts and nobody finishes. */
const SHORTLIST = {
  columns: ["Depth", "Level", "Worth"],
  rows: ["Nemo Reef", "Lighthouse", "Mangrove Wall"],
};

/** What the hunt actually leaves you holding. The one real list here. */
const COSTS = [
  "Scattered sources",
  "Uncertain choices",
  "Hard to compare",
  "Hours of guesswork",
];

/**
 * A card's illustrative content.
 *
 * The two cards that stand for footage carry our OWN photography, washed back
 * so it reads as something glimpsed rather than as the page's own imagery —
 * which is also the honest picture: a clip of the right place, with none of
 * what you need to act on it. A competitor's actual screenshot would be both
 * a licensing question and the fake product content the truthfulness rules
 * keep to the preview surface. Everything else is drawn from tokens.
 */
function CardMedia({
  kind,
  frame,
}: {
  kind: NonNullable<Source["media"]>;
  frame?: string;
}) {
  if (kind === "links") {
    return (
      <span className="mt-2.5 flex flex-col gap-1.5">
        {[100, 78, 88].map((width) => (
          <span
            key={width}
            className="bg-forest/12 block h-1.5"
            style={{ width: `${width}%` }}
          />
        ))}
      </span>
    );
  }

  if (kind === "dots") {
    return (
      <span className="mt-3 flex items-center gap-1.5">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="bg-forest/20 block size-1.5" />
        ))}
      </span>
    );
  }

  return (
    <span className="rounded-edge relative mt-2.5 block h-14 overflow-hidden sm:h-16">
      {frame && (
        <Image
          src={frame}
          alt=""
          fill
          quality={75}
          // Small by construction: two thumbnails inside a column that is at
          // most ~200px wide, so the optimiser never needs a large variant.
          sizes="(min-width: 1024px) 200px, 45vw"
          /*
            Desaturated and dimmed on purpose. At full strength these two
            frames were the most vivid thing in the act — which inverts the
            argument the section is making, because the "without" half then
            looks better than the product beside it. Pulled back, they read as
            glimpses: enough to know it is the right place, not enough to act
            on, which is the whole point of the card they sit in.
          */
          className="object-cover opacity-90 saturate-[0.65]"
        />
      )}
      {/* Seats the frame in the brand field, the same wash the destination
          plates use, so a borrowed glimpse cannot out-colour the page. */}
      <span aria-hidden className="plate-wash absolute inset-0" />
      {kind === "video" && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="bg-cream/90 rounded-edge flex size-7 items-center justify-center">
            <svg viewBox="0 0 12 12" className="text-forest size-3">
              <path d="M4 2.5 9.5 6 4 9.5Z" fill="currentColor" />
            </svg>
          </span>
        </span>
      )}
    </span>
  );
}

export function ScatteredSources() {
  return (
    <div className="flex flex-col">
      {/*
        The pile. `px-1 py-2` is not decoration: the cards are rotated and
        nudged, and a transformed corner reaches outside its grid cell — this
        is the room it reaches into, so nothing is ever visually clipped.
      */}
      <div aria-hidden className="relative px-1 py-2 select-none">
        {/* The confusion, as punctuation. Three marks, placed in the grid's
            own gutters so they never sit on a card's text. Decorative and
            hidden with the pile. */}
        <span
          className="text-terra/30 font-display absolute top-0 -left-1 text-2xl leading-none sm:text-3xl"
          aria-hidden
        >
          ?
        </span>
        <span
          className="text-terra/25 font-display absolute top-1/2 -right-1 text-xl leading-none sm:text-2xl"
          aria-hidden
        >
          ?
        </span>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4">
          {SOURCES.map((source) => (
            <li
              key={source.name}
              className={cn(
                "border-cream-line bg-cream-deep rounded-edge border p-3 sm:p-3.5",
                // Transform only: layout is untouched, so the grid geometry
                // holds at every width and nothing can overlap its neighbour.
                "transition-transform duration-200",
                source.lift,
              )}
            >
              <span className="text-forest block truncate text-sm font-bold sm:text-base">
                {source.name}
              </span>
              <span className="text-forest/70 mt-0.5 block text-xs leading-snug sm:text-sm">
                {source.note}
              </span>
              {source.media && (
                <CardMedia kind={source.media} frame={source.frame} />
              )}
            </li>
          ))}
        </ul>
      </div>

      {/*
        The shortlist. Not a card: a ruled table, drawn the way the rest of the
        site draws structure. Every cell is a question mark on purpose —
        inventing depths and levels here would be exactly the fabrication the
        page bans outside the preview, and the unknowns ARE the point.

        The column widths are measured, not chosen. At 10px with
        `tracking-label`'s 0.18em, a two-word head like "Worth it" renders 62px
        and needs a 64px cell — which left the header row one pixel inside the
        content box at 360px and 15px OUTSIDE it at 320px. So the third column
        is one word: "Worth" measures ~37px, the cells drop to 56px on a phone,
        and the row clears the 360px content box by 21px instead of 1.

        `min-w-0 truncate` on the row label is the backstop for the widths this
        does not anticipate: the label gives way rather than pushing the
        columns off the edge, which is the failure that is actually visible.
      */}
      <div
        aria-hidden
        className="border-cream-line mt-7 border-t select-none sm:mt-9"
      >
        <div className="text-forest/75 flex items-center justify-between gap-3 pt-4 pb-3">
          <span className="label min-w-0 truncate text-[10px]">
            The shortlist
          </span>
          <span className="flex gap-2 sm:gap-3">
            {SHORTLIST.columns.map((column) => (
              <span
                key={column}
                className="label w-14 text-center text-[10px] sm:w-16"
              >
                {column}
              </span>
            ))}
          </span>
        </div>

        {SHORTLIST.rows.map((row) => (
          <div
            key={row}
            className="border-cream-line flex items-center justify-between gap-3 border-t py-3"
          >
            <span className="text-forest min-w-0 truncate text-sm">{row}</span>
            <span className="flex gap-2 sm:gap-3">
              {SHORTLIST.columns.map((column) => (
                <span
                  key={column}
                  className="text-terra-deep w-14 text-center text-sm font-bold sm:w-16"
                >
                  ?
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>

      {/* The reading of the table above it, in words. It counts what is
          actually drawn: six cards, three shortlisted rows. Changing either
          list has to move these numbers. */}
      <p className="text-forest/75 border-cream-line mt-5 border-t pt-5 text-sm leading-relaxed">
        Six places, three shortlisted, and no way to tell which one is worth
        your time.
      </p>

      {/*
        What it costs, as four quiet chips. This is the only part of the block
        exposed to assistive tech: the cards and the table are drawings of a
        feeling, and this is the content.
      */}
      <ul className="mt-6 flex flex-wrap gap-2 sm:mt-7 sm:gap-2.5">
        {COSTS.map((cost) => (
          <li
            key={cost}
            className="border-cream-line text-forest/75 rounded-edge inline-flex items-center gap-2 border px-3 py-2 text-xs sm:text-sm"
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
              className="text-terra-deep size-3 flex-none"
            >
              <path
                d="M6 3v3.25"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle cx="6" cy="8.75" r="0.85" fill="currentColor" />
              <circle
                cx="6"
                cy="6"
                r="5"
                stroke="currentColor"
                strokeWidth="1.1"
              />
            </svg>
            {cost}
          </li>
        ))}
      </ul>
    </div>
  );
}
