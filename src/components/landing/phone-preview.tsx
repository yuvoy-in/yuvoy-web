"use client";

import * as React from "react";

/**
 * The Season One phone preview — the product, on the cover of the site.
 *
 * A self-running illustration of the Yuvoy loop: a vertical feed of
 * experiences that advances on its own, and a Book tap that lands on a
 * confirmation. Everything on the screen is built from brand tokens — the
 * "footage" is moving colour (`film-*` utilities), never a fake photograph —
 * and the frame is explicitly labelled a preview. The prices, seat counts and
 * operators shown are illustrative; the wrapper carries `data-preview` so the
 * e2e truthfulness guard can hold the rest of the page to the no-invented-
 * numbers rule while allowing them here, inside the labelled screen.
 *
 * Motion rules: the feed only auto-advances while on screen, pauses for a
 * while whenever the visitor touches it (WCAG 2.2.2 — the visitor can always
 * take over), and never starts for visitors who prefer reduced motion. CSS
 * animations inside are neutralised by the global reduced-motion rule.
 */

interface Scene {
  film: string;
  live: string;
  filmedBy: string;
  title: string;
  meta: string;
  price: string;
  slot: string;
}

const SCENES: Scene[] = [
  {
    film: "film-a",
    live: "3 seats left today",
    filmedBy: "Filmed by the dive crew",
    title: "Your first breath underwater",
    meta: "Discover scuba · Havelock · 3 hrs · no experience needed",
    price: "₹4,500",
    slot: "Tomorrow, 9:00 AM · Havelock",
  },
  {
    film: "film-b",
    live: "Runs at low tide",
    filmedBy: "Filmed by the operator",
    title: "Walk the reef without swimming",
    meta: "Sea walk · Neil · 90 min · helmet supplied",
    price: "₹3,200",
    slot: "Thursday, 11:30 AM · Neil",
  },
  {
    film: "film-c",
    live: "New moon this week",
    filmedBy: "Filmed by the guide",
    title: "The water lights up after dark",
    meta: "Bioluminescence paddle · Havelock · after dark",
    price: "₹2,400",
    slot: "Friday, 8:15 PM · Havelock",
  },
  {
    film: "film-d",
    live: "Six seats only",
    filmedBy: "Filmed at the market",
    title: "Breakfast where the boats land",
    meta: "Market walk + cook-along · Port Blair · morning",
    price: "₹1,800",
    slot: "Sunday, 6:45 AM · Port Blair",
  },
];

const ADVANCE_MS = 4200;
const RESUME_AFTER_MS = 9000;
const CONFIRM_MS = 2100;

export function PhonePreview() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const feedRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const [confirmSlot, setConfirmSlot] = React.useState<string | null>(null);

  /**
   * The whole choreography lives inside one effect; the Book handler reaches
   * it through this ref. `hold` stops the auto-advance; `advance` moves one
   * card on and re-arms it.
   */
  const controls = React.useRef({ hold: () => {}, advance: () => {} });

  React.useEffect(() => {
    const root = rootRef.current;
    const feed = feedRef.current;
    if (!root || !feed) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Mutable choreography state; none of it re-renders the tree.
    let inView = false;
    let paused = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let resume: ReturnType<typeof setTimeout> | undefined;
    let settle: ReturnType<typeof setTimeout> | undefined;

    function goTo(index: number) {
      if (!feed) return;
      const next = (index + SCENES.length) % SCENES.length;
      feed.scrollTo({
        top: next * feed.clientHeight,
        behavior: reduced ? "auto" : "smooth",
      });
    }

    function advance() {
      if (!feed) return;
      goTo(Math.round(feed.scrollTop / feed.clientHeight) + 1);
    }

    /** (Re)arm the auto-advance, replacing any pending tick. */
    function schedule() {
      clearTimeout(timer);
      if (!inView || paused || reduced) return;
      timer = setTimeout(() => {
        advance();
        schedule();
      }, ADVANCE_MS);
    }

    controls.current = {
      hold: () => clearTimeout(timer),
      advance: () => {
        advance();
        schedule();
      },
    };

    // Run only while the phone is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        schedule();
      },
      { threshold: 0.35 },
    );
    io.observe(root);

    // Track which card the feed has settled on.
    const onScroll = () => {
      clearTimeout(settle);
      settle = setTimeout(() => {
        setActive(
          Math.max(
            0,
            Math.min(
              SCENES.length - 1,
              Math.round(feed.scrollTop / feed.clientHeight),
            ),
          ),
        );
      }, 90);
    };
    feed.addEventListener("scroll", onScroll, { passive: true });

    // The visitor taking over pauses the choreography for a while.
    const onEngage = () => {
      paused = true;
      clearTimeout(timer);
      clearTimeout(resume);
      resume = setTimeout(() => {
        paused = false;
        schedule();
      }, RESUME_AFTER_MS);
    };
    const engageEvents = ["pointerdown", "wheel", "touchstart"] as const;
    engageEvents.forEach((event) =>
      feed.addEventListener(event, onEngage, { passive: true }),
    );

    return () => {
      io.disconnect();
      feed.removeEventListener("scroll", onScroll);
      engageEvents.forEach((event) =>
        feed.removeEventListener(event, onEngage),
      );
      clearTimeout(timer);
      clearTimeout(resume);
      clearTimeout(settle);
      controls.current = { hold: () => {}, advance: () => {} };
    };
  }, []);

  function book(scene: Scene) {
    controls.current.hold();
    setConfirmSlot(scene.slot);
    setTimeout(() => {
      setConfirmSlot(null);
      controls.current.advance();
    }, CONFIRM_MS);
  }

  return (
    <div ref={rootRef} data-preview className="relative w-fit">
      {/* The label that keeps the preview honest, pinned to the frame. */}
      <p className="label border-cream/20 text-cream/70 rounded-edge bg-forest absolute -top-3 left-1/2 z-10 -translate-x-1/2 border px-3 py-1 whitespace-nowrap">
        Season One preview
      </p>

      <div className="rounded-device ring-cream/15 bg-forest relative p-2 ring-1">
        {/* Camera dot — hardware depiction, the one rounded object on the site. */}
        <span
          aria-hidden
          className="bg-cream/20 absolute top-3.5 left-1/2 z-10 size-1.5 -translate-x-1/2 rounded-full"
        />

        <div
          className="bg-forest relative aspect-[9/17.4] w-[clamp(280px,24vw,330px)] overflow-hidden rounded-[calc(var(--radius-device)-0.5rem)]"
          role="group"
          aria-label="Preview of the Yuvoy app — illustrative, nothing is bookable yet"
        >
          <div
            ref={feedRef}
            className="absolute inset-0 snap-y snap-mandatory scrollbar-none overflow-y-auto overscroll-contain"
          >
            {SCENES.map((scene) => (
              <article
                key={scene.title}
                className="relative h-full snap-start overflow-hidden"
              >
                <div className={`film ${scene.film}`} />
                <div className="caustics" />
                {/* Scrim so every word on the card sits on near-forest. */}
                <div className="to-forest/95 via-forest/40 absolute inset-0 bg-linear-to-b from-transparent from-35%" />

                <div className="absolute inset-x-3 top-8">
                  <div className="bg-cream/95 text-forest rounded-edge flex items-center gap-2 px-3 py-2.5 text-xs font-medium">
                    <svg
                      aria-hidden
                      viewBox="0 0 20 20"
                      fill="none"
                      className="size-3.5 opacity-50"
                    >
                      <circle
                        cx="9"
                        cy="9"
                        r="6.2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M13.6 13.6L17 17"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    Andaman Islands
                  </div>
                  <p className="label bg-forest/55 text-cream rounded-edge mt-2 inline-flex items-center gap-1.5 px-2 py-1 text-[9px] backdrop-blur-sm">
                    <span className="bg-terra-soft inline-block size-1 animate-pulse rounded-full" />
                    {scene.live}
                  </p>
                </div>

                <div className="absolute inset-x-3 bottom-4">
                  <p className="text-cream/75 flex items-center gap-2 text-[10px]">
                    <span
                      aria-hidden
                      className="bg-terra inline-block size-3.5 rounded-full"
                    />
                    {scene.filmedBy}
                  </p>
                  <h3 className="font-display text-cream mt-1.5 text-[22px] leading-[1.1] tracking-tight">
                    {scene.title}
                  </h3>
                  <p className="text-cream/70 mt-1 text-[10px]">{scene.meta}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-cream text-lg font-semibold">
                      {scene.price}
                      <span className="text-cream/60 ml-1 text-[10px] font-normal">
                        / person
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => book(scene)}
                      aria-label={`Book ${scene.title} — preview only`}
                      className="bg-terra-deep text-cream rounded-edge hover:bg-terra-deep/90 focus-visible:ring-terra-soft px-4 py-2 font-mono text-[10px] font-semibold tracking-widest uppercase transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Feed position dots. */}
          <div
            aria-hidden
            className="absolute top-1/2 right-1.5 flex -translate-y-1/2 flex-col gap-1.5"
          >
            {SCENES.map((scene, i) => (
              <span
                key={scene.title}
                className={
                  i === active
                    ? "bg-terra-soft rounded-edge h-5 w-0.5 transition-all duration-300"
                    : "bg-cream/25 rounded-edge h-3 w-0.5 transition-all duration-300"
                }
              />
            ))}
          </div>

          {/* Booking confirmed — the loop closing, inside the preview. */}
          <div
            role="status"
            className={
              confirmSlot
                ? "bg-forest/85 absolute inset-0 z-10 flex items-center justify-center opacity-100 backdrop-blur-sm transition-opacity duration-200"
                : "pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-200"
            }
          >
            {confirmSlot && (
              <div className="px-6 text-center">
                <span className="bg-terra-deep mx-auto flex size-11 items-center justify-center rounded-full">
                  <svg
                    aria-hidden
                    viewBox="0 0 20 20"
                    fill="none"
                    className="size-5"
                  >
                    <path
                      d="M4 10.5l4 4 8-8.5"
                      stroke="var(--color-cream)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className="font-display text-cream mt-4 text-2xl">
                  Seat confirmed
                </p>
                <p className="text-cream/70 mt-1.5 text-xs">{confirmSlot}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="label text-cream/60 mt-5 text-center text-[10px]">
        Swipe the feed · tap book
      </p>
    </div>
  );
}
