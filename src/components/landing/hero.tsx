import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * The cover: a full-viewport statement over an island horizon. The scene is
 * three swaying wave lines, a low terracotta sun-glow and film grain, all
 * built from tokens; the movement is slow enough to be felt rather than
 * watched. The product preview lives in the next act, so the cover's only
 * job is atmosphere and the question.
 *
 * `data-dark-hero` is the header's cue to run transparent over this section.
 *
 * The facts row along the bottom is the page's momentum line and every entry
 * on it must be literally true today. "3 founding operators signed" is a real
 * count confirmed by the owner (2026-08-03); update it only to another true
 * number.
 */
const FACTS = [
  "Waitlist open",
  "No payment required",
  "3 founding operators signed",
];

export function Hero() {
  return (
    <section
      data-dark-hero
      className="bg-forest text-cream relative overflow-hidden"
    >
      <IslandHorizon />

      <div className="container-page relative flex min-h-[calc(100dvh-4rem)] flex-col justify-center py-16 sm:py-20">
        <div className="flex flex-col items-center text-center">
          <p
            className="eyebrow text-terra-soft rise"
            style={{ animationDelay: "0.05s" }}
          >
            Season One · Andaman Islands · Opening when the water clears
          </p>

          <h1
            className="font-display rise mt-9 max-w-4xl text-[clamp(3rem,8.5vw,6rem)] leading-[0.98] font-normal tracking-tight text-balance"
            style={{ animationDelay: "0.15s" }}
          >
            Every trip starts with one question.
            <span className="text-terra-soft mt-3 block italic">
              &ldquo;What should I do?&rdquo;
            </span>
          </h1>

          <p
            className="text-cream/70 rise mt-9 max-w-2xl text-lg leading-relaxed"
            style={{ animationDelay: "0.3s" }}
          >
            Yuvoy answers it. Everything a place actually offers, on honest
            video from the people who run it, booked in the same scroll.
          </p>

          <div
            className="rise mt-11 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row"
            style={{ animationDelay: "0.45s" }}
          >
            {/*
              Native anchors, not next/link: hash-only hrefs pushed through
              the router use history.pushState, which never fires the
              hashchange event LeadForms listens on. A plain anchor sets
              location.hash natively, which both scrolls and fires it.
            */}
            <a
              href="#register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "focus-visible:ring-offset-forest w-full sm:w-auto",
              )}
            >
              Join the waitlist
              <ButtonArrow />
            </a>
            <a
              href="#how"
              className={cn(
                buttonVariants({ variant: "outlineOnDark", size: "lg" }),
                "focus-visible:ring-offset-forest w-full sm:w-auto",
              )}
            >
              How it works
            </a>
          </div>

          {/* Scroll cue: a slow falling thread. */}
          <div
            aria-hidden
            className="rise mt-14 hidden flex-col items-center gap-3 lg:flex"
            style={{ animationDelay: "0.6s" }}
          >
            <span className="bg-terra/60 cue-line block h-10 w-px" />
            <span className="label text-cream/70">Scroll</span>
          </div>
        </div>

        {/* The momentum line: three true facts, and the three islands. */}
        <div
          className="rise border-cream/12 mt-16 flex flex-wrap items-center justify-between gap-x-10 gap-y-3 border-t pt-6"
          style={{ animationDelay: "0.7s" }}
        >
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {FACTS.map((fact) => (
              <li
                key={fact}
                className="label text-cream/70 flex items-center gap-2.5"
              >
                <span aria-hidden className="bg-terra size-1 shrink-0" />
                {fact}
              </li>
            ))}
          </ul>
          <p className="label text-cream/70">Havelock · Neil · Port Blair</p>
        </div>
      </div>
    </section>
  );
}

/**
 * The scene behind the cover: a low sun, three wave lines swaying at
 * different slow rates, and grain. Purely decorative, tokens only.
 */
function IslandHorizon() {
  const waves = [
    {
      d: "M-40 70 C 200 30, 440 106, 720 70 S 1240 34, 1480 70",
      opacity: 0.14,
      sway: "sway-a",
      y: "bottom-[21%]",
    },
    {
      d: "M-40 70 C 220 110, 480 32, 760 70 S 1260 108, 1480 70",
      opacity: 0.09,
      sway: "sway-b",
      y: "bottom-[14%]",
    },
    {
      d: "M-40 70 C 180 36, 460 104, 740 70 S 1220 38, 1480 70",
      opacity: 0.06,
      sway: "sway-c",
      y: "bottom-[8%]",
    },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* The low sun: a warm glow settling onto the water line. */}
      <div className="from-terra/20 absolute right-[8%] bottom-[10%] size-[46vmin] rounded-full bg-radial to-transparent to-70% blur-2xl" />
      <div className="from-terra/25 absolute right-[16%] bottom-[19%] size-[10vmin] rounded-full bg-radial to-transparent to-65% blur-md" />

      {waves.map((wave) => (
        <svg
          key={wave.d}
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          className={cn("absolute inset-x-0 h-24 w-full", wave.y, wave.sway)}
          style={{ opacity: wave.opacity }}
        >
          <path
            d={wave.d}
            stroke="var(--color-cream)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ))}

      <div className="grain" />
    </div>
  );
}
