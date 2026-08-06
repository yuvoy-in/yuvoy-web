"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Wordmark } from "@/components/brand/wordmark";

/**
 * The Season One product tour: the phone walks the whole loop on its own,
 * watch, understand, book, while the rail beside it names the act being
 * performed. Clicking a rail step seeks the tour to that act, like chapters
 * on a video; a pause control satisfies WCAG 2.2.2 for motion that runs
 * longer than five seconds.
 *
 * Everything on the screen is built from brand tokens. The "footage" is
 * moving colour (`film-*` + `caustics`), never a fake photograph, and the
 * frame is labelled a preview. Prices, seats, the operator and the booking
 * reference are illustrative; the wrapper carries `data-preview` so the e2e
 * truthfulness guard confines invented numbers to this labelled screen.
 *
 * The tour is watch-only: the surfaces inside the phone are illustrations
 * (divs styled as UI), never focusable controls, and the whole screen region
 * is aria-hidden. Assistive tech gets the story once, through the group
 * label and the rail, instead of a soup of half-visible screens.
 *
 * Choreography rules: the clock only runs while the phone is on screen
 * (IntersectionObserver), never for visitors who prefer reduced motion (the
 * rail then works as a manual switcher), and one pending timeout exists at a
 * time, re-armed per step, so pause, seek and unmount can never leak timers.
 */

type ActId = "watch" | "understand" | "book";
type Screen = "feed" | "detail" | "booking" | "checkout" | "confirmed";

interface DemoState {
  screen: Screen;
  /** Which reel the feed has scrolled to. */
  feedIndex: number;
  /** Detail scroller position, as an index into DETAIL_SCROLL_STOPS. */
  detailScroll: number;
  /** 0 = nothing chosen · 1 = date chosen · 2 = date + slot chosen. */
  bookingStage: number;
  bookTap: boolean;
  payTap: boolean;
  paying: boolean;
}

interface Step extends DemoState {
  act: ActId;
  dur: number;
}

/**
 * The script, as a fold: each step declares only what changed, and carries
 * the full resulting state so any step can be sought directly and the loop
 * wrap resets everything by construction.
 */
const SCRIPT: Step[] = (() => {
  let state: DemoState = {
    screen: "feed",
    feedIndex: 0,
    detailScroll: 0,
    bookingStage: 0,
    bookTap: false,
    payTap: false,
    paying: false,
  };
  const step = (act: ActId, dur: number, patch?: Partial<DemoState>): Step => {
    state = { ...state, ...patch };
    return { act, dur, ...state };
  };
  return [
    step("watch", 2600),
    step("watch", 2600, { feedIndex: 1 }),
    step("understand", 1800, { screen: "detail" }),
    step("understand", 2000, { detailScroll: 1 }),
    step("understand", 2100, { detailScroll: 2 }),
    step("book", 650, { bookTap: true }),
    step("book", 1200, { screen: "booking", bookTap: false }),
    step("book", 950, { bookingStage: 1 }),
    step("book", 1100, { bookingStage: 2 }),
    step("book", 1500, { screen: "checkout" }),
    step("book", 650, { payTap: true }),
    step("book", 1700, { paying: true, payTap: false }),
    step("book", 3400, { screen: "confirmed", paying: false }),
  ];
})();

const ACTS: ReadonlyArray<{ id: ActId; title: string; body: string }> = [
  { id: "watch", title: "Watch", body: "Real videos of the experience." },
  {
    id: "understand",
    title: "Understand",
    body: "Clear details you can trust.",
  },
  { id: "book", title: "Book", body: "Pick a time, pay, done." },
];

const ACT_START: Record<ActId, number> = { watch: 0, understand: 0, book: 0 };
const ACT_TOTAL: Record<ActId, number> = { watch: 0, understand: 0, book: 0 };
SCRIPT.forEach((step, index) => {
  if (ACT_TOTAL[step.act] === 0) ACT_START[step.act] = index;
  ACT_TOTAL[step.act] += step.dur;
});

/** Screens stack left to right; the confirmation rises from the foot. */
const STACK: Screen[] = ["feed", "detail", "booking", "checkout", "confirmed"];

const DETAIL_SCROLL_STOPS = [0, 0.55, 1];

const REELS = [
  {
    film: "film-b",
    live: "Runs at low tide",
    filmedBy: "Filmed by the operator",
    cat: "Sea walk · No swimming needed",
    title: "Walk the reef without swimming",
    meta: "Neil · 90 min · helmet supplied",
    price: "₹3,200",
  },
  {
    film: "film-a",
    live: "3 seats left today",
    filmedBy: "Filmed by the dive crew",
    cat: "Discover scuba · Beginner friendly",
    title: "Your first breath underwater",
    meta: "Havelock · 3 hrs · no experience needed",
    price: "₹4,500",
  },
] as const;

const DATES = [
  { day: "Today", num: "12" },
  { day: "Tmrw", num: "13" },
  { day: "Thu", num: "14" },
  { day: "Fri", num: "15" },
] as const;

const SLOTS = [
  { time: "6:30 AM", note: "Best visibility", state: "open" },
  { time: "9:00 AM", note: "2 seats left", state: "few" },
  { time: "11:30 AM", note: "5 seats open", state: "open" },
  { time: "2:00 PM", note: "Sold out", state: "full" },
] as const;

const INCLUDED = [
  "All dive gear & wetsuit",
  "Instructor at a 1:2 ratio",
  "Shallow-water training first",
  "Photos & a video clip",
];

export function ProductDemo() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const detailRef = React.useRef<HTMLDivElement>(null);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const [inView, setInView] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);
  /** Bumped on every loop wrap and seek, so the act meter restarts cleanly. */
  const [epoch, setEpoch] = React.useState(0);

  const step = SCRIPT[stepIndex];
  const running = playing && inView && !reduced;

  // Honour the OS preference live, not only at mount.
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  // Run only while the phone is actually on screen.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  // The clock: one pending timeout, re-armed per step. Pausing a step
  // restarts it in full on resume, which is invisible in practice and keeps
  // the machine stateless.
  React.useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      const next = (stepIndex + 1) % SCRIPT.length;
      if (next === 0) setEpoch((count) => count + 1);
      setStepIndex(next);
    }, step.dur);
    return () => clearTimeout(timer);
  }, [running, stepIndex, step.dur]);

  // The detail scroller is driven, not user-scrollable, so its position is
  // state like everything else. Smooth only while the screen is showing;
  // resets between loops happen off screen and must be instant.
  React.useEffect(() => {
    const el = detailRef.current;
    if (!el) return;
    const travel = el.scrollHeight - el.clientHeight;
    el.scrollTo({
      top: travel * (DETAIL_SCROLL_STOPS[step.detailScroll] ?? 0),
      behavior: reduced || step.screen !== "detail" ? "auto" : "smooth",
    });
  }, [step.detailScroll, step.screen, reduced]);

  function seek(act: ActId) {
    setEpoch((count) => count + 1);
    setStepIndex(ACT_START[act]);
    setPlaying(true);
  }

  const activeScreen = STACK.indexOf(step.screen);
  const activeActIndex = ACTS.findIndex((act) => act.id === step.act);
  /**
   * Whether the top of the frame is currently dark, which is what the
   * lockup's tone and its scrim follow. The feed and the detail hero are
   * footage, the confirmation is a forest field, and the processing overlay
   * covers whatever is under it; the booking and checkout screens are cream.
   */
  const onDarkSurface =
    step.paying ||
    step.screen === "feed" ||
    step.screen === "detail" ||
    step.screen === "confirmed";

  return (
    // data-demo marks the perpetual-motion surface for the e2e axe helper:
    // the tour (and its rail meter) animates by design for as long as it is
    // on screen, so "wait for animations to finish" must not include it.
    <div
      data-demo
      className="flex flex-col items-center gap-8 lg:flex-row lg:gap-7"
    >
      <div data-preview ref={rootRef} className="relative w-fit flex-none">
        <div className="rounded-device ring-cream/15 bg-forest relative p-2 ring-1">
          {/* Camera dot — hardware depiction, the one rounded object on the site. */}
          <span
            aria-hidden
            className="bg-cream/20 absolute top-3.5 left-1/2 z-10 size-1.5 -translate-x-1/2 rounded-full"
          />

          <div
            role="group"
            aria-label="Auto-playing preview of the Yuvoy flow: watch a real video, read the details, pick a time and pay. Illustrative: nothing is bookable yet."
            // Narrower at lg than at xl: the rail sits beside it from lg up,
            // and 300px of phone leaves the rail too thin at that width.
            className="group bg-forest relative aspect-[9/17.4] w-[min(72vw,300px)] overflow-hidden rounded-[calc(var(--radius-device)-0.5rem)] lg:w-65 xl:w-75"
          >
            {/* The screens. Illustration only: hidden from assistive tech
                (the group label above tells the story) and inert to the
                pointer, because this is a film, not a control surface. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden select-none"
            >
              <ScreenShell
                order={0}
                active={activeScreen}
                className="bg-forest"
              >
                <FeedScreen feedIndex={step.feedIndex} />
              </ScreenShell>

              <ScreenShell
                order={1}
                active={activeScreen}
                className="bg-cream text-forest flex flex-col"
              >
                <DetailScreen bookTap={step.bookTap} scrollerRef={detailRef} />
              </ScreenShell>

              <ScreenShell
                order={2}
                active={activeScreen}
                className="bg-cream text-forest flex flex-col"
              >
                <BookingScreen stage={step.bookingStage} />
              </ScreenShell>

              <ScreenShell
                order={3}
                active={activeScreen}
                className="bg-cream text-forest flex flex-col"
              >
                <CheckoutScreen payTap={step.payTap} />
              </ScreenShell>

              <ScreenShell
                order={4}
                active={activeScreen}
                rise
                className="bg-forest text-cream"
              >
                <ConfirmedScreen />
              </ScreenShell>

              {/* Payment processing, over whichever screen is showing. */}
              <div
                className={cn(
                  "bg-forest/90 text-cream ease-interaction absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px] transition-opacity duration-200",
                  step.paying ? "opacity-100" : "opacity-0",
                )}
              >
                <span className="border-cream/20 border-t-terra-soft size-9 animate-spin rounded-full border-2" />
                <span className="text-[11px] font-medium">
                  Confirming your payment
                </span>
                <span className="text-cream/60 -mt-2 text-[9px]">
                  Just a moment
                </span>
              </div>
            </div>

            {/*
              The product's own top bar: content runs edge to edge and the
              lockup sits over it (owner direction, 2026-08-06, replacing the
              browser address strip). The mark takes the surface's tone, and
              a scrim rides in only over the dark screens, where cream type
              needs ground under it; the cream screens reserve the band with
              their own top padding instead.
            */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-11 items-center justify-center"
            >
              <span
                className={cn(
                  "from-forest/85 ease-interaction absolute inset-0 bg-linear-to-b to-transparent transition-opacity duration-300",
                  onDarkSurface ? "opacity-100" : "opacity-0",
                )}
              />
              <Wordmark
                tone={onDarkSurface ? "onDark" : "onLight"}
                className="relative h-6 sm:h-6"
              />
            </div>

            {/*
              WCAG 2.2.2: the tour moves for far longer than five seconds, so
              a pause mechanism has to exist. It rides the frame like a video
              player's control rather than sitting under it as a labelled
              button (owner direction: the button was visual noise) — revealed
              on hover, and on keyboard focus, which is the skip-link pattern
              and keeps it reachable without a pointer. Under reduced motion
              nothing auto-plays, so there is nothing to pause.
            */}
            {!reduced && (
              <button
                type="button"
                onClick={() => setPlaying((now) => !now)}
                aria-label={playing ? "Pause the preview" : "Play the preview"}
                className="border-cream/25 bg-forest/70 text-cream rounded-edge focus-visible:ring-terra-soft ease-interaction absolute top-2.5 right-2.5 z-30 flex size-8 items-center justify-center border opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
              >
                {playing ? (
                  <PauseGlyph className="size-3" />
                ) : (
                  <PlayGlyph className="size-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/*
          The label that keeps the preview honest (DESIGN_SYSTEM §8): it moved
          off the frame as a badge and became this caption, which also carries
          the not-yet-bookable statement the section used to close on.
        */}
        <p className="label text-forest/75 mt-4 text-center text-[10px]">
          Season One preview <span aria-hidden>·</span> nothing is bookable yet
        </p>
      </div>

      {/* The rail: the same three moves the section promises, highlighted in
          sync with the phone. Clicking one seeks the tour to that act. */}
      <ol className="w-full max-w-xs lg:min-w-0 lg:flex-1">
        {ACTS.map((act, index) => {
          const isActive = index === activeActIndex;
          const isDone = index < activeActIndex;
          return (
            <li key={act.id}>
              <button
                type="button"
                onClick={() => seek(act.id)}
                aria-current={isActive ? "step" : undefined}
                className="rounded-edge focus-visible:ring-terra-deep group flex w-full items-start gap-4 py-3.5 text-left focus-visible:ring-2 focus-visible:outline-none"
              >
                <span
                  aria-hidden
                  className={cn(
                    "rounded-edge ease-interaction flex size-10 flex-none items-center justify-center border transition-colors duration-200",
                    isActive
                      ? "border-forest bg-forest text-cream"
                      : "border-cream-line bg-cream-deep text-forest/70 group-hover:text-forest",
                  )}
                >
                  <ActGlyph id={act.id} />
                </span>
                <span className="min-w-0 flex-1">
                  {/* Inactive steps recede by stepping down the measured
                      opacity ladder, never by dimming the whole row: a
                      wrapper opacity puts the text below the AA floor. */}
                  <span
                    className={cn(
                      "font-display tracking-display ease-interaction block text-xl leading-snug transition-colors duration-200",
                      isActive
                        ? "text-forest"
                        : "text-forest/75 group-hover:text-forest",
                    )}
                  >
                    {act.title}
                  </span>
                  <span className="text-forest/70 mt-0.5 block text-sm leading-relaxed">
                    {act.body}
                  </span>
                  {/* The act meter: fills over the act's real duration. */}
                  <span
                    aria-hidden
                    className="bg-cream-line rounded-edge mt-3 block h-0.5 w-full overflow-hidden"
                  >
                    <span
                      key={`${act.id}-${epoch}`}
                      className={cn(
                        "bg-terra block h-full w-full origin-left",
                        isActive && "demo-fill",
                      )}
                      style={
                        isActive
                          ? {
                              animationDuration: `${ACT_TOTAL[act.id]}ms`,
                              animationPlayState: running
                                ? "running"
                                : "paused",
                            }
                          : { transform: isDone ? "scaleX(1)" : "scaleX(0)" }
                      }
                    />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------- screens -- */

/**
 * Screens live in one stack: everything at or before the active screen sits
 * in place, everything after waits off the right edge (the confirmation
 * below the foot). On the loop wrap the whole stack retreats together,
 * which reads as the demo starting over.
 */
function ScreenShell({
  order,
  active,
  rise = false,
  className,
  children,
}: {
  order: number;
  active: number;
  rise?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const open = order <= active;
  return (
    <div
      className={cn(
        "ease-cinematic absolute inset-0 overflow-hidden transition-transform duration-420",
        open
          ? "translate-x-0 translate-y-0"
          : rise
            ? "translate-y-full"
            : "translate-x-full",
        className,
      )}
    >
      {children}
    </div>
  );
}

function FeedScreen({ feedIndex }: { feedIndex: number }) {
  return (
    <>
      <div
        className="ease-cinematic absolute inset-x-0 top-0 h-[200%] transition-transform duration-700"
        style={{ transform: `translateY(-${feedIndex * 50}%)` }}
      >
        {REELS.map((reel) => (
          <div key={reel.title} className="relative h-1/2 overflow-hidden">
            <div className={cn("film", reel.film)} />
            <div className="caustics" />
            {/* Scrim so every word on the card sits on near-forest. */}
            <div className="to-forest/95 via-forest/40 absolute inset-0 bg-linear-to-b from-transparent from-35%" />

            {/* Clears the lockup band that now rides over the footage. */}
            <p className="bg-forest/55 text-cream rounded-edge tracking-label absolute top-14 left-3 inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-medium uppercase backdrop-blur-sm">
              <span className="bg-terra-soft inline-block size-1 animate-pulse rounded-full" />
              {reel.live}
            </p>

            <div className="absolute inset-x-3 bottom-3">
              <p className="text-cream/75 flex items-center gap-1.5 text-[10px]">
                <span
                  aria-hidden
                  className="bg-terra inline-block size-3 rounded-full"
                />
                {reel.filmedBy}
              </p>
              <p className="font-display text-cream tracking-display mt-1 text-[21px] leading-[1.08]">
                {reel.title}
              </p>
              <p className="text-cream/70 mt-1 text-[10px]">{reel.meta}</p>
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <p className="text-cream text-[17px] font-bold">
                  {reel.price}
                  <span className="text-cream/60 ml-1 text-[9px] font-normal">
                    / person
                  </span>
                </p>
                <span className="bg-cream text-forest rounded-edge tracking-label px-3.5 py-2 text-[9px] font-bold uppercase">
                  Book
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feed position dots. */}
      <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 flex-col gap-1.5">
        {REELS.map((reel, index) => (
          <span
            key={reel.title}
            className={cn(
              "rounded-edge ease-interaction w-0.5 transition-all duration-300",
              index === feedIndex ? "bg-terra-soft h-5" : "bg-cream/25 h-3",
            )}
          />
        ))}
      </div>
    </>
  );
}

function DetailScreen({
  bookTap,
  scrollerRef,
}: {
  bookTap: boolean;
  scrollerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const reel = REELS[1];
  return (
    <>
      <div className="relative h-[36%] flex-none overflow-hidden">
        <div className={cn("film", reel.film)} />
        <div className="caustics" />
        <div className="to-forest/90 absolute inset-0 bg-linear-to-b from-transparent from-40%" />
        {/* Sits in the lockup band, where a real app puts its back control. */}
        <span className="bg-forest/40 text-cream rounded-edge absolute top-3.5 left-2.5 flex size-6 items-center justify-center backdrop-blur-sm">
          <ChevronGlyph className="size-3" />
        </span>
        <div className="text-cream absolute inset-x-3 bottom-2.5">
          <p className="text-terra-soft tracking-label text-[9px] font-medium uppercase">
            {reel.cat}
          </p>
          <p className="font-display tracking-display mt-0.5 text-[19px] leading-tight">
            {reel.title}
          </p>
          <p className="text-cream/80 mt-1 flex items-center gap-1 text-[10px]">
            <StarGlyph className="text-terra-soft size-2.5" />
            4.9 (132) · 3 hrs · small groups
          </p>
        </div>
      </div>

      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-hidden">
        <div className="space-y-3.5 px-3 py-3">
          <div className="flex flex-wrap gap-1.5">
            {["Certified crew", "Insured", "Free cancel · 24h"].map((chip) => (
              <span
                key={chip}
                className="border-cream-line bg-cream-deep rounded-edge border px-2 py-1 text-[9px] font-medium"
              >
                {chip}
              </span>
            ))}
          </div>

          <div>
            <p className="text-terra-deep tracking-label text-[9px] font-medium uppercase">
              Your operator
            </p>
            <div className="border-cream-line bg-cream-deep rounded-edge mt-1.5 flex items-center gap-2.5 border p-2.5">
              <span className="bg-forest text-cream rounded-edge flex size-8 flex-none items-center justify-center text-[10px] font-bold">
                BS
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] leading-tight font-bold">
                  Blue Season Divers
                </span>
                <span className="text-forest/70 block text-[9px]">
                  PADI-certified · Havelock
                </span>
              </span>
              <span className="bg-forest/8 rounded-edge ml-auto flex items-center gap-1 px-1.5 py-1 text-[9px] font-bold whitespace-nowrap">
                <CheckGlyph className="size-2" /> Verified
              </span>
            </div>
          </div>

          <div>
            <p className="text-terra-deep tracking-label text-[9px] font-medium uppercase">
              What&rsquo;s included
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {INCLUDED.map((item) => (
                <li
                  key={item}
                  className="flex items-baseline gap-2 text-[11px]"
                >
                  <CheckGlyph className="text-terra-deep size-2 flex-none" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-terra-deep tracking-label text-[9px] font-medium uppercase">
              What guests say
            </p>
            <div className="border-cream-line bg-cream-deep rounded-edge mt-1.5 border p-2.5">
              <span className="text-terra flex gap-0.5">
                {Array.from({ length: 5 }, (_, star) => (
                  <StarGlyph key={star} className="size-2" />
                ))}
              </span>
              <p className="text-forest/80 mt-1.5 text-[11px] leading-relaxed">
                &ldquo;First dive ever and I felt safe the whole time. Saw a
                turtle!&rdquo;
              </p>
              <p className="text-forest/70 mt-1.5 text-[9px]">
                Meera · last week
              </p>
            </div>
          </div>

          <p className="text-forest/70 pb-1 text-[10px]">
            Free cancellation up to 24 hours before your slot.
          </p>
        </div>
      </div>

      <div className="border-cream-line flex flex-none items-center gap-3 border-t px-3 py-2.5">
        <span>
          <span className="block text-[15px] leading-tight font-bold">
            ₹4,500
          </span>
          <span className="text-forest/60 block text-[9px]">/ person</span>
        </span>
        <span
          className={cn(
            "bg-forest text-cream rounded-edge tracking-label ease-interaction flex-1 py-2.5 text-center text-[10px] font-bold uppercase transition-transform duration-150",
            bookTap && "scale-[0.96] opacity-90",
          )}
        >
          Book
        </span>
      </div>
    </>
  );
}

function BookingScreen({ stage }: { stage: number }) {
  return (
    <>
      {/* pt-11 reserves the lockup band: these screens are cream, so the
          band is empty surface above them rather than a scrim over footage. */}
      <div className="border-cream-line flex flex-none items-center gap-2.5 border-b px-3 pt-11 pb-2.5">
        <span className="border-cream-line rounded-edge flex size-6 flex-none items-center justify-center border">
          <ChevronGlyph className="size-3" />
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] leading-tight font-bold">
            Pick your slot
          </span>
          <span className="text-forest/60 block truncate text-[9px]">
            Your first breath underwater
          </span>
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-hidden px-3 pt-3">
        <div>
          <p className="text-terra-deep tracking-label text-[9px] font-medium uppercase">
            Date
          </p>
          <div className="mt-1.5 flex gap-1.5">
            {DATES.map((date, index) => {
              const on = stage >= 1 && index === 1;
              return (
                <span
                  key={date.day}
                  className={cn(
                    "rounded-edge ease-interaction flex-1 border py-2 text-center transition-colors duration-200",
                    on
                      ? "border-forest bg-forest text-cream"
                      : "border-cream-line bg-cream",
                  )}
                >
                  <span
                    className={cn(
                      "tracking-label block text-[8px] font-medium uppercase",
                      on ? "text-cream/75" : "text-forest/60",
                    )}
                  >
                    {date.day}
                  </span>
                  <span className="mt-0.5 block text-[15px] leading-none font-bold">
                    {date.num}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-terra-deep tracking-label text-[9px] font-medium uppercase">
            Time
          </p>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {SLOTS.map((slot, index) => {
              const on = stage >= 2 && index === 1;
              return (
                <span
                  key={slot.time}
                  className={cn(
                    "rounded-edge ease-interaction relative border px-2.5 py-2 transition-colors duration-200",
                    on ? "border-forest bg-forest/5" : "border-cream-line",
                    slot.state === "full" && "opacity-45",
                  )}
                >
                  {on && (
                    <CheckGlyph className="text-forest absolute top-2 right-2 size-2.5" />
                  )}
                  <span className="block text-[11px] font-bold">
                    {slot.time}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-[9px]",
                      slot.state === "few"
                        ? "text-terra-deep font-medium"
                        : "text-forest/60",
                    )}
                  >
                    {slot.note}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-cream-line flex flex-none items-center gap-3 border-t px-3 py-2.5">
        <span>
          <span className="block text-[15px] leading-tight font-bold">
            ₹4,500
          </span>
          <span className="text-forest/60 block text-[9px] whitespace-nowrap">
            {stage >= 2 ? "Tmrw · 9:00 AM" : "1 guest"}
          </span>
        </span>
        <span
          className={cn(
            "rounded-edge tracking-label ease-interaction flex-1 py-2.5 text-center text-[10px] font-bold uppercase transition-colors duration-200",
            stage >= 2
              ? "bg-forest text-cream"
              : "bg-cream-deep text-forest/40",
          )}
        >
          Continue
        </span>
      </div>
    </>
  );
}

function CheckoutScreen({ payTap }: { payTap: boolean }) {
  return (
    <>
      {/* pt-11 reserves the lockup band: these screens are cream, so the
          band is empty surface above them rather than a scrim over footage. */}
      <div className="border-cream-line flex flex-none items-center gap-2.5 border-b px-3 pt-11 pb-2.5">
        <span className="border-cream-line rounded-edge flex size-6 flex-none items-center justify-center border">
          <ChevronGlyph className="size-3" />
        </span>
        <span>
          <span className="block text-[11px] leading-tight font-bold">
            Confirm &amp; pay
          </span>
          <span className="text-forest/60 block text-[9px]">
            No account needed
          </span>
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-hidden px-3 pt-3">
        <div className="bg-forest text-cream rounded-edge p-3">
          <p className="font-display tracking-display text-[15px] leading-snug">
            Your first breath underwater
          </p>
          <p className="text-cream/70 mt-0.5 text-[10px]">
            Tmrw · 9:00 AM · Havelock
          </p>
          <div className="border-cream/15 mt-2.5 flex items-baseline justify-between border-t pt-2">
            <span className="text-[11px]">Total · 1 guest</span>
            <span className="text-[13px] font-bold">₹4,500</span>
          </div>
          <p className="text-cream/60 mt-0.5 text-[9px]">No hidden fees</p>
        </div>

        <div>
          <p className="text-terra-deep tracking-label text-[9px] font-medium uppercase">
            Pay with
          </p>
          <div className="mt-1.5 space-y-1.5">
            <span className="border-forest bg-forest/5 rounded-edge flex items-center gap-2.5 border px-2.5 py-2">
              <span className="min-w-0">
                <span className="block text-[11px] leading-tight font-bold">
                  UPI
                </span>
                <span className="text-forest/60 block text-[9px]">
                  Any UPI app
                </span>
              </span>
              <span className="border-forest rounded-edge ml-auto flex size-3.5 flex-none items-center justify-center border-[1.5px]">
                <span className="bg-forest size-1.5" />
              </span>
            </span>
            <span className="border-cream-line rounded-edge flex items-center gap-2.5 border px-2.5 py-2">
              <span className="min-w-0">
                <span className="block text-[11px] leading-tight font-bold">
                  Card
                </span>
                <span className="text-forest/60 block text-[9px]">
                  Credit or debit
                </span>
              </span>
              <span className="border-cream-line rounded-edge ml-auto size-3.5 flex-none border-[1.5px]" />
            </span>
          </div>
        </div>

        <span
          className={cn(
            "bg-forest text-cream rounded-edge tracking-label ease-interaction block w-full py-2.5 text-center text-[10px] font-bold uppercase transition-transform duration-150",
            payTap && "scale-[0.96] opacity-90",
          )}
        >
          Pay ₹4,500
        </span>

        <p className="text-forest/60 flex items-center justify-center gap-1.5 text-[9px]">
          <LockGlyph className="size-2.5" />
          Payments secured · full refund if the operator cancels
        </p>
      </div>
    </>
  );
}

function ConfirmedScreen() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
      <div className="caustics opacity-40" />
      <span className="bg-terra-deep flex size-11 items-center justify-center rounded-full">
        <CheckGlyph className="text-cream size-5" strokeWidth={2.2} />
      </span>
      <p className="font-display tracking-display mt-4 text-[22px] leading-tight">
        You&rsquo;re booked.
      </p>
      <p className="text-cream/70 mt-1 text-[10px]">
        Tmrw · 9:00 AM · Havelock Island
      </p>
      <p className="border-cream/30 bg-cream/10 rounded-edge tracking-label mt-3.5 border border-dashed px-3 py-1.5 text-[10px] font-bold uppercase">
        Ref · YV-4127
      </p>
      <p className="text-cream/60 mt-3.5 text-[9px]">
        Ticket sent to your WhatsApp
      </p>
    </div>
  );
}

/* -------------------------------------------------------------- glyphs -- */

function ActGlyph({ id }: { id: ActId }) {
  if (id === "watch") return <PlayGlyph className="size-4" />;
  if (id === "understand") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="size-4.5" aria-hidden>
        <circle
          cx="10"
          cy="10"
          r="7.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10 9.25V13.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="6.4" r="0.9" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4.5" aria-hidden>
      <rect
        x="3"
        y="4.5"
        width="14"
        height="12"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M3 8.25h14" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 2.75v3M13 2.75v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.4 12.4l1.8 1.7 3.4-3.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M5.2 3.2v9.6L13 8 5.2 3.2z" />
    </svg>
  );
}

function PauseGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <rect x="3.8" y="3" width="2.7" height="10" />
      <rect x="9.5" y="3" width="2.7" height="10" />
    </svg>
  );
}

function LockGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect
        x="3.25"
        y="7"
        width="9.5"
        height="6.25"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5.5 7V5.25a2.5 2.5 0 015 0V7"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ChevronGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M10 3.5L5.5 8l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckGlyph({
  className,
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M4 10.5l4 4 8-8.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M10 1.8l2.47 5.34 5.53.63-4.1 3.9 1.1 5.55L10 14.5l-4.99 2.72 1.1-5.55-4.1-3.9 5.52-.63L10 1.8z" />
    </svg>
  );
}
