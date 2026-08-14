"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * The hunt, as a deck: six places cycling through a stack, and the shortlist
 * you tried to build from them on its own card underneath.
 *
 * ## Why a deck
 *
 * The right half of this act is a single clean device. The left has to answer
 * it with a single object — the argument is *one tidy thing against one
 * untidy one*, and it only lands if both sides read as objects rather than as
 * regions of a page. Five earlier versions enumerated the problem instead of
 * depicting it: a panel of cards, a ruled index, a grid over a table over
 * chips, a fan of strips, and a single static sheet.
 *
 * A deck says "too many places" the way none of them could, because you watch
 * one give way to the next and it never runs out.
 *
 * ## The motion is one keyframe, and that is the whole bug-avoidance strategy
 *
 * The obvious build — hold an order in state, reorder on a timer, let each
 * card transition to its new slot — has a wrap bug at its heart: the card
 * leaving the FRONT must become the card at the BACK, and any transition
 * between those animates it backwards through the stack. Every fix is a state
 * machine that can desynchronise.
 *
 * So there is no order state and no per-tick re-render. Every card runs the
 * identical `yuvoy-deck` keyframe with its start shifted by a sixth of the
 * cycle (`animation-delay`, negative, so the stack is already mid-cycle on
 * first paint rather than assembling itself). The wrap happens where the
 * keyframe loops, which is exactly where the card is invisible. See the
 * keyframe in globals.css.
 *
 * React owns three things only: whether the animation is running, whether the
 * deck is on screen, and the motion preference. None of them is per-frame.
 *
 * ## Two obligations that come with anything that auto-plays
 *
 * 1. **A pause control (WCAG 2.2.2).** Motion that starts on its own and runs
 *    past five seconds needs a mechanism to stop it. Same treatment as the
 *    preview beside it: the control rides the deck, quiet where a pointer can
 *    hover, and always visible where one cannot — on a touch device a
 *    hover-revealed control is a control that does not exist. The button sits
 *    OUTSIDE the `aria-hidden` stack so it is reachable.
 * 2. **A static state that is the default.** The cards' own styles place them
 *    in a fan; the keyframe only moves them. So the global reduced-motion
 *    rule collapses the animation and leaves a perfectly composed static
 *    stack — no component-level motion branch, which is what the design
 *    system asks for. The keyframe deliberately has no `fill-mode`: with
 *    `both`, a neutralised animation would strand every card off-stage.
 *
 * The clock also stops when the deck is off screen, which is the preview's
 * rule too — an animation nobody is looking at should not be costing a phone
 * its battery.
 *
 * ## What was dropped from the owner's comp
 *
 * The product logos: reportage, not endorsement, and someone else's trademark
 * and brand colours do not belong on a page that is otherwise three tokens.
 * Everything on the cards is `aria-hidden` illustration; the caption under
 * the shortlist is the content, and the heading and lede beside it carry the
 * argument.
 */

interface Source {
  place: string;
  gives: string;
  /** The line the comp asked for: what that place actually leaves you with. */
  detail: string;
}

/**
 * Six places, in the order a person tries them. Reportage: real product
 * names, no invented counts, ratings or prices — the truthfulness rules
 * confine those to the preview surface, and nothing here is inside it.
 */
const SOURCES: Source[] = [
  {
    place: "Instagram",
    gives: "Clips, no prices",
    detail: "Beautiful reels. No dates, no cost, no way to book one.",
  },
  {
    place: "Google",
    gives: "Ten blue links",
    detail: "Aggregators and blog posts, mostly written seasons ago.",
  },
  {
    place: "YouTube",
    gives: "Vlogs from 2019",
    detail: "Somebody else's trip, filmed in a different season.",
  },
  {
    place: "Tripadvisor",
    gives: "Verdicts, no video",
    detail: "Ratings that never show you what the day looks like.",
  },
  {
    place: "WhatsApp",
    gives: "A number, if you ask",
    detail: "A chat thread, and no idea what you are agreeing to.",
  },
  {
    place: "The hotel desk",
    gives: "Whoever they know",
    detail: "One recommendation, and nothing to compare it against.",
  },
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

/** One full pass of the deck. A card reaches the front every sixth of this. */
const CYCLE_SECONDS = 21;

/*
  Drawn here rather than imported from `ProductDemo`, which has its own pair:
  importing them would pull a 1,200-line client component into this file's
  graph for twelve lines of SVG. Same spec as that pair — square caps, the
  same proportions — so the two pause controls on the page are one control.
*/
function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className={className}>
      <path d="M3 1.5 10 6l-7 4.5Z" fill="currentColor" />
    </svg>
  );
}

function PauseGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className={className}>
      <path d="M3 1.5h2.2v9H3zM6.8 1.5H9v9H6.8z" fill="currentColor" />
    </svg>
  );
}

export function ScatteredSources() {
  const deckRef = React.useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = React.useState(true);
  const [inView, setInView] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // The clock only runs while the deck is on screen. An animation nobody is
  // looking at is a phone's battery being spent on nothing.
  React.useEffect(() => {
    const node = deckRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const running = playing && inView && !reduced;

  return (
    <div className="flex flex-col">
      {/*
        The deck.

        A fixed height, because the cards are absolutely stacked and a stack
        has no intrinsic one. `pt-12` is the room the cards behind rise into
        (the keyframe lifts them up to 2.75rem) and `pb-3` is where the
        departing card goes; without both, a shadow would be clipped at the
        moment it matters most.
      */}
      <div ref={deckRef} className="group/deck relative pt-12 pb-3">
        <div
          aria-hidden
          className="relative h-40 select-none sm:h-36"
          role="presentation"
        >
          {SOURCES.map((source, index) => (
            <article
              key={source.place}
              style={{
                // Negative, so the deck is already mid-cycle at first paint
                // instead of assembling itself from nothing.
                animationDelay: `-${(index * CYCLE_SECONDS) / SOURCES.length}s`,
                animationPlayState: running ? "running" : "paused",
                // The STATIC fan, written on the element itself. This is what
                // shows under reduced motion, and what the keyframe overrides
                // while it plays — which is why no motion branch is needed.
                transform: `translateY(-${index * 0.55}rem) scale(${1 - index * 0.025})`,
                zIndex: SOURCES.length - index,
              }}
              className={cn(
                "border-cream-line bg-cream card-lift rounded-edge absolute inset-x-0 top-0 border px-5 py-4",
                // Suspended entirely under reduced motion: with the animation
                // neutralised there is nothing to run, and the static
                // transform above is the composition.
                !reduced && "deck-card",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-forest flex-none text-base font-bold sm:text-lg">
                  {source.place}
                </h3>
                <p className="text-terra-deep label min-w-0 truncate text-[10px]">
                  {source.gives}
                </p>
              </div>
              <p className="text-forest/70 mt-2 text-sm leading-relaxed">
                {source.detail}
              </p>
            </article>
          ))}
        </div>

        {/*
          WCAG 2.2.2. Outside the `aria-hidden` stack so it is reachable, and
          shown outright where the device cannot hover — a hover-revealed
          control on a touchscreen is a control that does not exist. Under
          reduced motion nothing auto-plays, so there is nothing to pause and
          the button is not rendered at all.
        */}
        {!reduced && (
          <button
            type="button"
            onClick={() => setPlaying((now) => !now)}
            aria-label={playing ? "Pause the deck" : "Play the deck"}
            className="border-cream-line bg-cream/90 text-forest rounded-edge focus-visible:ring-terra-deep ease-interaction absolute top-1 right-0 z-20 flex size-8 items-center justify-center border opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover/deck:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none [@media(hover:none)]:opacity-100"
          >
            {playing ? (
              <PauseGlyph className="size-3" />
            ) : (
              <PlayGlyph className="size-3" />
            )}
          </button>
        )}
      </div>

      {/*
        The shortlist, on its own card at the foot (owner direction,
        2026-08-15). It is the thing you were trying to write while the deck
        piled up, so it sits apart from the deck rather than inside it.

        Every cell is a question mark on purpose: inventing depths and levels
        would be the fabrication the page confines to the preview surface, and
        the unknowns ARE the point.

        The cells are narrow where the column is narrow — on a phone, and
        again at `lg` where this drops into a 4fr track of roughly the same
        width — and wide only at the breakpoints where the left column runs
        the full page. A two-word head needs 64px at 10px with
        `tracking-label`'s 0.18em, which is what pushed an earlier version
        past the content box at 320px; one-word heads in 48px cells clear it
        at every width.
      */}
      <div
        aria-hidden
        className="border-cream-line bg-cream-deep card-lift rounded-edge mt-5 border px-5 py-4 select-none"
      >
        <div className="text-forest/75 flex items-baseline justify-between gap-3 pb-2">
          <span className="label min-w-0 truncate text-[10px]">Shortlist</span>
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
            <span className="text-forest min-w-0 truncate text-sm">{row}</span>
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

      {/*
        What it costs. Middots are the brand's own separator (design system
        §2: never an em dash), and `terra-deep` rather than `terra` because
        this is text at body size on cream — `terra` is 3.24:1 and clears AA
        for large text only, which axe caught the one time it was used here.
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
