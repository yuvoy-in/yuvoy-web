import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * The cover: a full-viewport statement on forest, lit by a single low
 * terracotta glow and filmic grain. Nothing moves here. An animated wave
 * horizon was tried and removed (owner direction, 2026-08-03); the type and
 * the light carry the register on their own.
 *
 * The product preview lives in the next act, so the cover's only job is the
 * question.
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
    <section className="bg-forest text-cream relative overflow-hidden">
      {/* The light: a warm horizon glow low in the frame, and grain over it. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="from-terra/16 absolute right-[6%] bottom-[-10%] size-[62vmin] rounded-full bg-radial to-transparent to-70% blur-3xl" />
        <div className="grain" />
      </div>

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
        </div>

        {/* The momentum line: three true facts, and the three islands. */}
        <div
          className="rise border-cream/12 mt-20 flex flex-wrap items-center justify-between gap-x-10 gap-y-3 border-t pt-6"
          style={{ animationDelay: "0.6s" }}
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
